const logger = require("../utils/logger");

const requestLogger = (req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    logger.debug({
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      params: req.params,
      query: req.query
    });
  }
  next();
};

module.exports = requestLogger;
