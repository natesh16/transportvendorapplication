const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");

module.exports = (paramName) => (req, res, next) => {
  const value = req.params[paramName];

  if (!mongoose.Types.ObjectId.isValid(value)) {
    return next(new ApiError(400, `Invalid ${paramName}`));
  }

  next();
};
