const isDev = process.env.NODE_ENV !== "production";

const format = (level, message, meta) => {
  const time = new Date().toISOString();
  return `[${time}] [${level}] ${message} ${
    meta ? JSON.stringify(meta) : ""
  }`;
};

module.exports = {
  info: (msg, meta) => {
    if (isDev) console.log(format("INFO", msg, meta));
  },

  debug: (msg, meta) => {
    if (isDev) console.log(format("DEBUG", msg, meta)); // ✅ FIX
  },

  warn: (msg, meta) => {
    if (isDev) console.warn(format("WARN", msg, meta));
  },

  error: (msg, meta) => {
    console.error(format("ERROR", msg, meta));
  }
};
