const express = require("express");
const verifyInitData = require("./auth");
const UserService = require("../services/userService");
const axios = require("axios");
let verificationWord = "INFLUSTAR"; // Слово для проверки, по умолчанию

const router = express.Router();

function isValidUsername(username) {
  const usernameRegex = /^(?!.*\.\.)(?!\.)[A-Za-z0-9._]{2,24}(?<!\.)$/;
  return usernameRegex.test(username);
}

// Функция расчета Trust Score
function calculateTrustScore(followers, likes, posts) {
  return followers * 0.5 + likes * 0.3 + posts * 0.2;
}

router.get("/verify", (req, res) => {
  res.render("verify");
});

router.post("/verify", async (req, res) => {
  const { username } = req.body;
  const userId = req.session.userId;

  // Проверка правильности никнейма
  if (!isValidUsername(username)) {
    return res.render("error", {
      message: "Никнейм не соответствует требованиям TikTok.",
    });
  }

  try {
    const response = await axios.get(
      "https://tiktok-scraper2.p.rapidapi.com/user/info",
      {
        params: { user_name: username },
        headers: {
          "x-rapidapi-key":
            "587df103d3msh4c1fe337ea25f7fp144f75jsn660fb06b1857",
          "x-rapidapi-host": "tiktok-scraper2.p.rapidapi.com",
        },
      }
    );

    const { data } = response;
    if (data && data.stats && data.user) {
      const { followerCount, heartCount, videoCount } = data.stats;
      const { signature, id, avatarThumb } = data.user;

      // Проверка, содержит ли описание слово
      if (
        signature &&
        (verificationWord === null ||
          signature.toUpperCase().includes(verificationWord.toUpperCase()))
      ) {
        const trustScore = calculateTrustScore(
          followerCount,
          heartCount,
          videoCount
        );
        const cointrust = (trustScore / 10).toFixed(4);
        const user = await UserService.getUser(userId);
        user.ttId = id;
        user.ttName = username;
        user.cointrust = cointrust;
        user.trustScore = trustScore;
        user.followerCount = followerCount;
        user.videoCount = videoCount;
        user.heartCount = heartCount;
        // Отправка результатов пользователю
        user.save();

        return res.render("result", {
          username,
          cointrust,
          avatarThumb,
          followerCount,
          heartCount,
          videoCount,
        });
      } else {
        return res.render("error", {
          message: `Описание вашего профиля не содержит слово "${verificationWord}".`,
        });
      }
    } else {
      return res.render("error", {
        message: "Не удалось найти профиль TikTok.",
      });
    }
  } catch (error) {
    console.error(error);
    res.render("error", { message: "Ошибка при получении данных TikTok." });
  }
});

module.exports = router;
