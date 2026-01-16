const asyncHandler = require("../utils/asyncHandler");
const logger = require("../utils/logger");
const crypto = require("crypto");
const Corporate = require("../models/corporate.Model");
const AppError = require("../utils/appError");

/**
 * @desc    Create Corporate
 * @route   POST /api/v1/corporates
 * @access  Protected (SUPER_ADMIN via cookie)
 */
exports.createCorporate = asyncHandler(async (req, res) => {
  /* 🔐 req.user is guaranteed by middleware */
  const {
    companyname,
    contact,
    address,
    logo,
    subscription,
    billing
  } = req.body;

  /* 🧪 Validation */
  if (!companyname || typeof companyname !== "string") {
    throw new AppError("Corporate name is required", 400);
  }

  const trimmedName = companyname.trim();
  if (trimmedName.length < 3) {
    throw new AppError(
      "Corporate name must be at least 3 characters",
      400
    );
  }

  if (contact.registerEmail && !/^\S+@\S+\.\S+$/.test(contact.registeredEmail)) {
    throw new AppError("Invalid contact email format", 400);
  }

  /* 🔍 Duplicate check (case-insensitive) */
  const existingCorporate = await Corporate.findOne({
    name: new RegExp(`^${trimmedName}$`, "i"),
    isDeleted: { $ne: true }
  });

  if (existingCorporate) {
    throw new AppError("Corporate already exists", 409);
  }

  /* 🆔 Corporate Code generation */
  const normalizedName = trimmedName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6)
    .padEnd(3, "X");

  const hash = crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase();

  const corporateCode = `CORP-${normalizedName}-${hash}`;

  /* 🏢 Create Corporate */
  const corporate = await Corporate.create({
    companyname: trimmedName,
    corporateCode,
    logo,
    contact,
    address,
    subscription,
    billing,
    createdBy: req.user.id // ✅ from cookie-auth
  });

  /* ✅ Response */
  res.status(201).json({
    success: true,
    message: "Corporate created successfully",
    data: {
      id: corporate._id,
      name: corporate.name,
      corporateCode: corporate.corporateCode,
      status: corporate.status,
      createdAt: corporate.createdAt
    }
  });
});

exports.getCorporates = asyncHandler(async (req, res) => {
  if (req.user.role !== "SUPER_ADMIN") {
    throw new AppError("Access denied", 403);
  }
  const corporates = await Corporate.find({ isDeleted: false })
    .populate("createdBy", "name email")
    .sort("-createdAt");

  res.json({
    success: true,
    count: corporates.length,
    data: corporates
  });
});
exports.getCorporateById = asyncHandler(async (req, res) => {
  const corporate = await Corporate.findOne({
    _id: req.params.id,
    isDeleted: false
  }).populate("createdBy", "name email");

  if (!corporate) {
    throw new AppError("Corporate not found", 404);
  }

  res.json({
    success: true,
    data: corporate
  });
});
exports.updateCorporate = asyncHandler(async (req, res) => {
  if (req.user.role !== "SUPER_ADMIN") {
    throw new AppError("Only Super Admin can update corporate", 403);
  }
  const corporate = await Corporate.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    {
      ...req.body,
      lastModifiedBy: req.user.id
    },
    { new: true, runValidators: true }
  );

  if (!corporate) {
    throw new AppError("Corporate not found", 404);
  }
  res.json({
    success: true,
    message: "Corporate updated successfully",
    data: corporate
  });
});
exports.deleteCorporate = asyncHandler(async (req, res) => {
  if (req.user.role !== "SUPER_ADMIN") {
    throw new AppError("Only Super Admin can delete corporate", 403);
  }
  const corporate = await Corporate.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    {
      isDeleted: true,
      isActive: false,
      deletedAt: new Date(),
      lastModifiedBy: req.user.id
    },
    { new: true }
  );
  if (!corporate) {
    throw new AppError("Corporate not found", 404);
  }
  res.json({
    success: true,
    message: "Corporate deleted successfully"
  });
});