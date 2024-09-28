const express = require("express");
const verifyInitData = require("../auth");

const router = express.Router();

router.post("/telegram-data", async (req, res) => {
  const telegramData = req.body;
  let { username, id } = verifyInitData(telegramData.initData);

  console.log(username, id);
  return res.send("ok");
});

module.exports = router;
