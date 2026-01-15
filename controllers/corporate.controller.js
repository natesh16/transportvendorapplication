const Corporate = require("../models/corporat.ID.Schema");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

exports.createCorporate = asyncHandler(async (req, res) => {
  // 🔐 Auth & Role Guard (works with auth middleware)
  const {
    name,
    logo,
    description,
    contact,
    address,
    subscription,
    billing
  } = req.body;
  // 🧪 Check existing corporate
  const existingCorporate = await Corporate.findOne({
    name,
    isDeleted: false
  });
  if (existingCorporate) {
    throw new AppError("Corporate already exists", 409);
  }
  // 🆔 Generate Corporate Code
  const corporateCode = `CORP-${Date.now().toString().slice(-6)}`;
  // 🏢 Create Corporate
  const corporate = await Corporate.create({
    name,
    corporateCode,
    logo,
    description,
    contact,
    address,
    subscription,
    billing,
    createdBy: req.user.id // from auth middleware
  });
  res.status(201).json({
    success: true,
    message: "Corporate created successfully",
    data: corporate
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