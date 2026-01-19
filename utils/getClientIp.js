module.exports = function getClientIp(req) {
  // 1️⃣ Cloud / Proxy headers (trusted only because trust proxy = true)
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  // 2️⃣ NGINX / Apache
  if (req.headers["x-real-ip"]) {
    return req.headers["x-real-ip"];
  }

  // 3️⃣ Express / Node fallback
  return req.ip || req.connection.remoteAddress;
};
