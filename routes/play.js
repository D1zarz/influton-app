const express = require("express");

const router = express.Router();

router.get("/play", (req, res) => {
  const { username, cointrust } = req.query;
  if (!username || !cointrust) {
    return res.redirect("/error"); // Перенаправляем на страницу ошибки, если данных нет
  }
  return res.render("play", { username, cointrust });
});

module.exports = router;
