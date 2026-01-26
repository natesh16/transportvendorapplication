
/**
 * 🌐 Get Client IP (proxy-safe)
 */
const getClientIp = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
  req.socket?.remoteAddress ||
  req.ip ||
  "UNKNOWN_IP";

/**
 * 💻 Get Device / User-Agent info
 */
const getDeviceInfo = (req) =>
  req.headers["user-agent"] || "UNKNOWN_DEVICE";

module.exports = {
  getClientIp,
  getDeviceInfo
};

module.exports={
  getClientIp,getDeviceInfo
}