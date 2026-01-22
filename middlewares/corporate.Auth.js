const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const CorporateUser = require("../models/corporate.UserModel");

exports.protectCorporate = asyncHandler(async (req, res, next) => {
  let token;

  /* 1️⃣ Get token from COOKIE (PRIMARY) */
  if (req.cookies?.login_token) {
    token = req.cookies.login_token;
  }

  /* 2️⃣ Fallback: Authorization Header */
  if (
    !token &&
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  /* 3️⃣ If no token → NOT AUTHENTICATED */
  if (!token) {
    throw new AppError("Corporate login required", 401);
  }

  /* 4️⃣ Verify token */
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new AppError("Invalid or expired token", 401);
  }

  /* 5️⃣ Find corporate user */
  const user = await CorporateUser.findById(decoded.id)
    .populate({
      path: "role",
      populate: { path: "permissions" }
    });

  // if (!user || !user.isActive) {
  //   throw new AppError(
  //     "Corporate account inactive or not found",
  //     401
  //   );
  // }

  /* 6️⃣ Attach corporate user context */
  req.corporateUser = {
    id: user._id,
    email: user.email,
    role: user.role.name,
    permissions: user.role.permissions,
    corporateId: user.corporateId
  };

  next();
});
