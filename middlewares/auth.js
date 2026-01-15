const jwt = require("jsonwebtoken");
const User = require("../model/superAdmin.model"); // or SuperAdmin model
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  // 1️⃣ Get token
  if (req.cookies && req.cookies.token) {
  token = req.cookies.token;
}
  if (!token) {
    throw new AppError("Not authenticated", 401);
  }
  // 2️⃣ Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // 3️⃣ Get user
  const user = await User.findById(decoded.id).select("role");
  if (!user) {
    throw new AppError("User no longer exists", 401);
  }
  // 4️⃣ Attach user to request
  req.user = {
    id: user._id,
    role: user.role
  };
  next();
});
