const crypto = require("crypto");
const SuperAdmin = require("../models/superAdmin.model");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const bcrypt=require('bcrypt')
const jwt = require("jsonwebtoken");

/* ================= JWT HELPER ================= */

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

/* ================= CREATE SUPER ADMIN ================= */

exports.createSuperAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // 1️⃣ Validate email uniqueness
  const exists = await SuperAdmin.findOne({ email });
  if (exists) {
    throw new AppError("Email already registered", 409);
  }

  // 2️⃣ Create Super Admin (password hashed via schema middleware)
  const admin = await SuperAdmin.create({
    name,
    email,
    password,
    role: "SUPER_ADMIN"
  });

  // 3️⃣ Generate JWT bound to created admin
  const token = signToken(admin);

  // 4️⃣ Attach cookie → directly linked to admin._id
  if (process.env.USE_COOKIE_AUTH === "true") {
    sendAuthCookie(res, token);
  }

  // 5️⃣ Send safe response
  res.status(201).json({
    success: true,
    message: "Super Admin created and authenticated successfully",
    token: process.env.USE_COOKIE_AUTH === "true" ? undefined : token,
        cookies: req.cookies,
    data: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    }
  });
    res.cookie("auth_token", token, {
    httpOnly: true,
    secure: false,   // localhost
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
});


/* ================= JWT HELPER ================= */

const loginSignToken = (admin) =>
  jwt.sign(
    {
      id: admin._id,           // 🔑 unique identity
      email: admin.email,
      role: admin.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    }
  );

/* ================= COOKIE HELPER ================= */

const sendAuthCookielogin = (res, token) => {
  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // false on localhost
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

/* ================= LOGIN SUPER ADMIN ================= */

// exports.loginSuperAdmin = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//   /* 1️⃣ Validate input */
//   if (!email || !password) {
//     throw new AppError("Email and password are required", 400);
//   }

//   /* 2️⃣ Find admin + password */
//   const admin = await SuperAdmin.findOne({ email }).select("+password");
//   if (!admin) {
//     throw new AppError("Invalid email or password", 401);
//   }

//   /* 3️⃣ Verify password */
//   const isMatch = await bcrypt.compare(password, admin.password);
//   if (!isMatch) {
//     throw new AppError("Invalid email or password", 401);
//   }

//   /* 4️⃣ Generate JWT (unique per admin) */
//   const token = signToken(admin._id);


//   /* 5️⃣ Attach cookie BEFORE sending response */
//   if (process.env.USE_COOKIE_AUTH === "true") {
//     sendAuthCookielogin(res, token);
//   }

//   /* 6️⃣ Send response */
//   res.status(200).json({
//     success: true,
//     message: "Login successful",
//     token: process.env.USE_COOKIE_AUTH === "true" ? undefined : token,
//     data: {
//       id: admin._id,
//       name: admin.name,
//       email: admin.email,
//       role: admin.role
//     }
//   });
// });

/* ================= LOGIN SUPER ADMIN ================= */

/* 🔐 JWT SIGNER */
const loginsignToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

exports.loginSuperAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  /* 1️⃣ Validate input */
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  /* 2️⃣ Find admin + password */
  const admin = await SuperAdmin.findOne({ email }).select("+password");
  if (!admin) {
    throw new AppError("Invalid email or password", 401);
  }

  /* 3️⃣ Verify password */
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  /* 4️⃣ Generate JWT (ID ONLY) ✅ */
  const token = loginsignToken(admin._id);
  /* 5️⃣ Attach cookie */
  if (process.env.USE_COOKIE_AUTH === "true") {
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",          // REQUIRED for Postman
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
  }

  /* 6️⃣ Response */
  res.status(200).json({
    success: true,
    message: "Login successful",
    token: process.env.USE_COOKIE_AUTH === "true" ? undefined : token,
    data: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    }
  });
});

/* ================= GET ALL SUPER ADMINS ================= */

exports.getAllSuperAdmins = asyncHandler(async (req, res) => {
  /* Pagination */
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  /* Query with FIELD PROJECTION (CRITICAL) */
  const admins = await SuperAdmin.find()
    .select("_id name email role createdAt updatedAt isActive") // ✅ SAFE FIELDS ONLY
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean(); // performance + immutability

  const total = await SuperAdmin.countDocuments();

  res.status(200).json({
    success: true,
    message: "SuperAdmin list fetched successfully",
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    },
    data: admins
  });
});
