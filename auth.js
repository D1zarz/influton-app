const crypto = require("crypto");

const verifyInitData = (telegramInitData) => {
  const urlParams = new URLSearchParams(telegramInitData);
  console.log(urlParams);

  let usernameTg = urlParams.get("user").split(",")[3].split(":")[1];
  let id = urlParams.get("user").split(",")[0].split(":")[1];
  let language_code = urlParams.get("user").split(",")[4].split(":")[1];
  usernameTg = usernameTg.slice(1, -1);
  language_code = language_code.slice(1, -1);
  const hash = urlParams.get("hash");
  urlParams.delete("hash");
  urlParams.sort();

  let dataCheckString = "";
  for (const [key, value] of urlParams.entries()) {
    dataCheckString += `${key}=${value}\n`;
  }
  dataCheckString = dataCheckString.slice(0, -1);

  const secret = crypto
    .createHmac("sha256", "WebAppData")
    .update(process.env.TG_TOKEN);
  const calculatedHash = crypto
    .createHmac("sha256", secret.digest())
    .update(dataCheckString)
    .digest("hex");

  if (calculatedHash === hash) {
    return { usernameTg, id, language_code };
  } else {
    return false;
  }
};

module.exports = verifyInitData;
