const winston = require("winston");
const path = require("path");

const isProd = process.env.NODE_ENV === "production";

/* ------------------ Custom Levels ------------------ */
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

/* ------------------ Colors (dev only) ------------------ */
winston.addColors({
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "cyan"
});

/* ------------------ Log Format ------------------ */
const logFormat = winston.format.printf(
  ({ level, message, timestamp, stack, ...meta }) =>
    `${timestamp} [${level.toUpperCase()}]: ${
      stack || message
    } ${Object.keys(meta).length ? JSON.stringify(meta) : ""}`
);

/* ------------------ Logger ------------------ */
const logger = winston.createLogger({
  levels,
  level: isProd ? "info" : "debug", // ✅ KEY FIX
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    logFormat
  ),
  transports: [
    /* ❌ ERROR LOGS */
    new winston.transports.File({
      filename: path.join("logs", "error.log"),
      level: "error"
    }),

    /* 🐞 DEBUG LOGS */
    new winston.transports.File({
      filename: path.join("logs", "debug.log"),
      level: "debug"
    }),

    /* 📦 COMBINED LOGS */
    new winston.transports.File({
      filename: path.join("logs", "combined.log"),
      level: "info"
    })
  ],
  exitOnError: false
});

/* ------------------ Console (DEV ONLY) ------------------ */
// if (!isProd) {
//   logger.add(
//     new winston.transports.Console({
//       level: "debug",
//       format: winston.format.combine(
//         winston.format.colorize(),
//         winston.format.simple()
//       )
//     })
//   );
// }

module.exports = logger;
