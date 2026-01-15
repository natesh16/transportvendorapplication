const crypto = require("crypto");

const ALGO = "aes-256-cbc";
const KEY = Buffer.from(process.env.CORPORATE_CODE_ENCRYPT_KEY, "hex");
const IV = Buffer.from(process.env.CORPORATE_CODE_IV, "utf8");

exports.encrypt = (text) => {
  const cipher = crypto.createCipheriv(ALGO, KEY, IV);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

exports.decrypt = (encrypted) => {
  const decipher = crypto.createDecipheriv(ALGO, KEY, IV);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
