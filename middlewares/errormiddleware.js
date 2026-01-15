const logger = require("../utils/logger");
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  logger.error({
    message: err.message,
    method: req.method,
    url: req.originalUrl,
    stack: err.stack
  });
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message,
      type: err.name,
      path: req.originalUrl,
      method: req.method,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    }
  });
};
module.exports = errorHandler;
