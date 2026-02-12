module.exports = function requestTimeout(ms) {
  return (req, res, next) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          message: "Request timeout"
        });
      }
    }, ms);

    res.on("finish", () => clearTimeout(timeout));
    next();
  };
};
