const logger = require("../utils/logger");

module.exports = (err, req, res, next) => {
  console.error(err);
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (process.env.NODE_ENV == 'Develpoement') {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      stack: err.stack,
      error: err,
      statuscode: 400
    })
  }
  if (process.env.NODE_ENV == 'Production') {
    let message = err.message;
    let error = new ErrorHandler(message);

    // Mongoose Duplicate Key Error
    if (err.code === 11000) {
      statusCode = 409;
      message = `Duplicate field value: ${Object.keys(err.keyValue)}`;
    }
    // Mongoose Validation Error
    if (err.name === "ValidationError") {
      statusCode = 400;
      message = Object.values(err.errors).map(val => val.message).join(", ");
    }
       if(err.name=="CastError"){
            message=`Resource is not found: ${err.path}` ,
            error = new ErrorHandler(message)
        }

    res.status(statusCode).json({
      success: false,
      message:message || "Internal server error",
      statusCode
    });
  }};


module.exports = (err, req, res, next) => {
  logger.error(err.message, {
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    user: req.user?.id || null
  });

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};
