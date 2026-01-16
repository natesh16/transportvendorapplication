const crypto = require("crypto");

/**
 * Encrypt text
 */

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;
function getKey() {
  const secret = process.env.CORPORATE_CODE_SECRET;

  if (!secret) {
    throw new Error("CORPORATE_CODE_SECRET is missing");
  }

  // Always return 32-byte key
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * 🔐 Encrypt text
 */
exports.encrypt = (text) => {
  if (!text) {
    throw new Error("encrypt() requires a value");
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey();

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
};

/**
 * 🔓 Decrypt text (internal use only)
 */
exports.decrypt = (payload) => {
  if (!payload) {
    throw new Error("decrypt() requires a value");
  }

  const [ivHex, encrypted] = payload.split(":");
  if (!ivHex || !encrypted) {
    throw new Error("Invalid encrypted payload format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const key = getKey();

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};
