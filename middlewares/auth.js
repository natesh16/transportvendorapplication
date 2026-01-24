const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const SuperAdmin = require("../models/superAdmin.model");
const CorporateUser=require('../models/corporate.UserModel');

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  /* 1️⃣ Get token from COOKIE (PRIMARY) */
  if (req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token;
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
    throw new AppError("Not authenticated", 401);
  }

  /* 4️⃣ Verify token */
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  /* 5️⃣ Find user */
  const admin = await SuperAdmin.findById(decoded.id);
  if (!admin) {
    throw new AppError("User no longer exists", 401);
  }

  /* 6️⃣ Attach user to request */
  req.user = admin;
  next();
});

/**
 * 🔐 Cookie-based authentication & SUPER_ADMIN guard
 */
exports.protectSuperAdmin = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.auth_token;

  if (!token) {
    throw new AppError("Not authenticated. Login required.", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new AppError("Invalid or expired token", 401);
  }

  const admin = await SuperAdmin.findById(decoded.id);
  if (!admin) {
    throw new AppError("Admin account no longer exists", 401);
  }

  if (admin.role !== "SUPER_ADMIN") {
    throw new AppError(
      "Access denied. SUPER_ADMIN only.",
      403
    );
  }

  /* ✅ Attach safe admin context */
  req.user = {
    id: admin._id,
    email: admin.email,
    role: admin.role
  };

  next();
});

exports.corporateprotect = async (req, res, next) => {
  let token;

  // 🍪 Read JWT from cookie
  if (req.cookies?.login_token) {
    token = req.cookies.login_token;
  }

  if (!token) {
    return next(
      new AppError("Authentication required", 401)
    );
  }

  // 🔓 Verify token
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET
  );

  // 🔍 DEBUG (temporarily)
  console.log("JWT decoded id:", decoded.id);

  // 👤 Fetch user
  const user = await CorporateUser.findById(decoded.id)
    .select("+role +corporateId +loginId +isActive");

if (!user) {
    return next(new AppError("User not found", 401));
  }

  // ✅ FIX: only block if explicitly false
  if (user.isActive === false) {
    return next(
      new AppError("User account is deactivated", 401)
    );
  }
  // Inject into request
  req.user = {
    id: user._id,
    role: user.role,
    corporateId: user.corporateId,
    loginId: user.loginId
  };

  next();
};

/* ------------------------------------------------ */
/* 🛡️ Role-Based Access Control (FIX ADDED)          */
/* ------------------------------------------------ */
exports.allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError("Authentication required", 401)
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          "You do not have permission to perform this action",
          403
        )
      );
    }

    next();
  };
};