const winston = require("winston");
const path = require("path");
const logFormat = winston.format.printf(
  ({ level, message, timestamp, stack, meta }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${
      stack || message
    } ${meta ? JSON.stringify(meta) : ""}`;
  }
);
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    logFormat
  ),
  transports: [
    new winston.transports.File({
      filename: path.join("logs", "error.log"),
      level: "error"
    }),
    new winston.transports.File({
      filename: path.join("logs", "combined.log")
    })
  ]
});
/* Console logging (dev only) */
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple()
    })
  );
}
module.exports = logger;
