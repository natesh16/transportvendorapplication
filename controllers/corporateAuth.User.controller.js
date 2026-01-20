const jwt = require("jsonwebtoken");
const CorporateUser = require("../models/corporate.UserModel");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const getClientIp = require("../utils/getClientIp");

/* 🔐 JWT Helper */
const signToken = (admin) =>
  jwt.sign(
    {
      id: admin._id,
      email: admin.email,
      role: admin.role || "SUPER_ADMIN"
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    }
  );

/* ================= COOKIE HELPER ================= */

const sendAuthCookie = (res, token) => {
  res.cookie("auth_token", token, {
    httpOnly: true, // 🔐 JS can't access
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};
/**
 * @desc    Corporate User Login
 * @route   POST /api/v1/corporate/auth/login
 * @access  Public
 */
exports.loginCorporateUser = asyncHandler(async (req, res) => {
  const { loginId, password } = req.body;

  if (!loginId || !password) {
    throw new AppError("Login ID and password are required", 400);
  }

  const user = await CorporateUser.findOne({
    loginId: loginId.toUpperCase()
  }).select("+password");

  if (!user) {
    throw new AppError("Invalid login credentials", 401);
  }

  /* 🔒 Account Lock Check */
 if (user.isLocked()) {
    const waitTime = Math.ceil(
      (user.lockUntil - Date.now()) / (60 * 1000)
    );

    throw new AppError(
      `Account locked due to multiple failed attempts. Try again in ${waitTime} minutes.`,
      423
    );
  }

  /* 🔑 Password Validation */
  const isMatch = await user.correctPassword(password);
  if (!isMatch) {
    await user.incrementLoginAttempts();
    throw new AppError("Invalid login credentials", 401);
  }

  /* 🌐 Track Login Metadata */
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLogin = new Date();
  user.lastLoginIp = getClientIp(req);

  await user.save({ validateBeforeSave: false });

  /* 🎟️ Token */
 // Generate JWT bound to created admin
  const token = signToken(admin);
  //  Attach cookie → directly linked to admin._id
  if (process.env.USE_COOKIE_AUTH === "true") {
    logger.info("Auth cookie set for SuperAdmin", {
      adminId: admin._id
    });
    sendAuthCookie(res, token);
  }

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      id: user._id,
      loginId: user.loginId,
      role: user.role,
      corporateId: user.corporateId,
      lastLogin: user.lastLogin,
      lastLoginIp: user.lastLoginIp,
      token
    }
  });
});
