const express = require("express");
const userService = require("../services/userService");
const verifyInitData = require("../auth");

const router = express.Router();

router.get("/", async (req, res) => {
  const id = req.session.userId;

  const user = await userService.getUser(id);
  if (!user) {
    return res.render("instructions");
  }
  const { username, cointrust } = await userService.getTikTok(id);
  return res.render("play", { username, cointrust });
});

router.post("/", async (req, res) => {
  const telegramData = req.body;
  const { usernameTg, id } = verifyInitData(telegramData.initData);
  req.session.userId = id;
  req.session.usernameTg = usernameTg;
  //const { username, cointrust } = await userService.getTikTok(id);
  const user = await userService.getUser(id);

  if (!user) {
    return res.send("error");
  }

  return res.send("truth");
});

module.exports = router;
