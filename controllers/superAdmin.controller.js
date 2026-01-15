const SuperAdmin = require("../model/superAdmin.model");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const validator = require("validator");  
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendToken = require("../utils/sendToken");

exports.createSuperAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!validator.isEmail(email)) {
    throw new ErrorResponse("Invalid email format", 400);
  }
  if (password.length < 8) {
    throw new ErrorResponse(
      "Password must be at least 8 characters",
      400
    );
  }
  const existing = await SuperAdmin.findOne({ email });
  if (existing) {
    throw new ErrorResponse("Email already exists", 409);
  }
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);
  // Create Super Admin
  const superAdmin = await SuperAdmin.create({
    name,
    email,
    password: hashedPassword
  });
  sendToken(superAdmin, 201, res);
});


/**
 * @desc   Get all Super Admins
 * @route  GET /api/super-admin
 * @access Super Admin
 */
exports.getSuperAdmins = asyncHandler(async (req, res) => {
  const admins = await SuperAdmin.find();

  res.json({
    success: true,
    count: admins.length,
    data: admins
  });
});

/**
 * @desc   Get Single Super Admin
 * @route  GET /api/super-admin/:id
 * @access Super Admin
 */
exports.getSuperAdminById = asyncHandler(async (req, res) => {
  const admin = await SuperAdmin.findById(req.params.id);

  if (!admin) {
    throw new ErrorResponse("Super Admin not found", 404);
  }

  res.json({
    success: true,
    data: admin
  });
});

/**
 * @desc   Update Super Admin
 * @route  PUT /api/super-admin/:id
 * @access Super Admin
 */
exports.updateSuperAdmin = asyncHandler(async (req, res) => {
  const { name, isActive } = req.body;

  const admin = await SuperAdmin.findById(req.params.id);
  if (!admin) {
    throw new ErrorResponse("Super Admin not found", 404);
  }

  admin.name = name ?? admin.name;
  admin.isActive = isActive ?? admin.isActive;

  await admin.save();

  res.json({
    success: true,
    message: "Super Admin updated successfully",
    data: admin
  });
});

/**
 * @desc   Delete Super Admin
 * @route  DELETE /api/super-admin/:id
 * @access Super Admin
 */
exports.deleteSuperAdmin = asyncHandler(async (req, res) => {
  const admin = await SuperAdmin.findById(req.params.id);

  if (!admin) {
    throw new ErrorResponse("Super Admin not found", 404);
  }

  await admin.deleteOne();

  res.json({
    success: true,
    message: "Super Admin deleted successfully"
  });
});
