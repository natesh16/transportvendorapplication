module.exports = (err, req, res, next) => {
  console.error(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

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

  res.status(statusCode).json({
    success: false,
    message
  });
};
