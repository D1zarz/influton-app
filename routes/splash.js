const express = require("express");

const router = express.Router();

app.get("/", (req, res) => {
  return res.redirect("/splash");
});

app.get("/splash", (req, res) => {
  return res.render("splash");
});

module.exports = router;
