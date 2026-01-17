const crypto = require("crypto");

module.exports.generateStrongPassword = () => {
  return crypto.randomBytes(12).toString("base64") + "@A1";
};