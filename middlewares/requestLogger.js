const morgan = require("morgan");
const logger = require("../utils/logger");

morgan.token("body", (req) => JSON.stringify(req.body));

const stream = {
  write: (message) => logger.info(message.trim())
};

module.exports = morgan(
  ":method :url :status :response-time ms - body=:body",
  { stream }
);
