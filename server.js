const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const app = express();
const routerAuth = require("./routes/auth");
const instructionsRouter = require("./routes/instructions");
const playRouter = require("./routes/play");
const verifyRouter = require("./routes/verify");
const mongoose = require("mongoose");
require("dotenv").config();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//app.use(cors());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Настройка статических файлов
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.COOKIE_KEY, //секретный ключ
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Настройка движка шаблонов EJS
app.use("/", routerAuth);
app.use("/", instructionsRouter);
app.use("/", playRouter);
app.use("/", verifyRouter);

// Главная страница, перенаправляющая на /splash
// app.get("/", (req, res) => {
//   res.redirect("/splash");
// });

// Страница предзагрузки
app.get("/splash", (req, res) => {
  res.render("splash");
});

// Админская страница
app.get("/admin", (req, res) => {
  res.render("admin", { verificationWord });
});

// Обработка формы изменения слова проверки
app.post("/admin", (req, res) => {
  const { newVerificationWord } = req.body;
  if (newVerificationWord === "") {
    verificationWord = null; // Отключить проверку
  } else {
    verificationWord = newVerificationWord; // Установить новое слово проверки
  }
  res.redirect("/admin"); // Перенаправление обратно на админ-страницу
});

// Запуск сервера
async function connectToDB() {
  return mongoose.connect(process.env.MONGO_URL);
}

connectToDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(`${error} is from connection to server`);
  });
