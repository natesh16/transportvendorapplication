const asyncHandler = require("../utils/asyncHandler");
const logger = require("../utils/logger");
const crypto = require("crypto");
const Corporate = require("../models/corporate.Model");
const CorporateUser = require("../models/corporate.UserModel");
const AppError = require("../utils/appError");
const {generateCorporateLoginId}= require("../utils/generateCorporateLoginId");
const {generateStrongPassword} = require("../utils/generateStrongPassword");

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
    billing,
    usage,
    security
  } = req.body;

    /* ================= LOG: REQUEST START ================= */
  logger.info("Create Corporate request received", {
    requestedBy: req.user?.id,
    ip: req.ip
  });

  /* 🧪 Validation */
  if (!companyname || typeof companyname !== "string") {
     logger.warn("Corporate creation failed - invalid company name", {
      companyname
    });
    throw new AppError("Corporate name is required", 400);
  }

  const trimmedName = companyname.trim();
  if (trimmedName.length < 3) {
     logger.warn("Corporate creation failed - name too short", {
      trimmedName
    });
    throw new AppError(
      "Corporate name must be at least 3 characters",
      400
    );
  }

  if (contact.registerEmail && !/^\S+@\S+\.\S+$/.test(contact.registeredEmail)) {
      logger.warn("Corporate creation failed - invalid contact email", {
      email: contact.registeredEmail
    });
    throw new AppError("Invalid contact email format", 400);
  }

 /* ================= DUPLICATE CHECK ================= */
  logger.debug("Checking for existing corporate", {
    name: trimmedName
  });

  /* 🔍 Duplicate check (case-insensitive) */
  const existingCorporate = await Corporate.findOne({
    name: new RegExp(`^${trimmedName}$`, "i"),
    isDeleted: { $ne: true }
  });

  if (existingCorporate) {
     logger.warn("Corporate already exists", {
      corporateId: existingCorporate._id,
      name: trimmedName
    });
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

  logger.debug("Corporate code generated", {
    corporateCode
  });

  /* 🏢 Create Corporate */
  const corporateID = await Corporate.create({
    companyname: trimmedName,
    corporateCode,
    logo,
    contact,
    address,
    subscription,
    billing,
    usage,
    security,
    createdBy: req.user.id // ✅ from cookie-auth
  });

  logger.info("Corporate created successfully", {
    corporateId: corporateID._id,
    corporateCode,
    createdBy: req.user.id
  });

  /* ✅ Response */
  res.status(201).json({
    success: true,
    message: "Corporate created successfully",
    data: {
      id: corporateID._id,
      name: corporateID.name,
      corporateCode: corporateID.corporateCode,
      status: corporateID.status,
      createdAt: corporateID.createdAt
    }
  });
});

// controllers/superAdminCorporateUser.controller.js
// const Corporate = require("../models/corporateModel");
// const AppError = require("../utils/appError");
// const asyncHandler = require("../utils/asyncHandler");

/**
 * @desc    SuperAdmin creates Corporate Admin / Supervisor
 * @route   POST /api/v1/superadmin/corporate-users
 * @access  SUPER_ADMIN
 */
exports.createCorporateEmployee = asyncHandler(async (req, res) => {
  /* 🔐 Role Guard */
  if (!req.user || req.user.role !== "SUPER_ADMIN") {
    throw new AppError("Unauthorized", 403);
  }

  const {
    corporateId,
    name,
    role,
    password // optional
  } = req.body;

  /* 🧪 Validation */
  if (!corporateId || !name || !role) {
    throw new AppError("Missing required fields", 400);
  }

  if (!["CORPORATE_ADMIN", "CORPORATE_SUPERVISOR"].includes(role)) {
    throw new AppError("Invalid role", 400);
  }

  /* 🔍 Corporate Exists */
  const corporate = await Corporate.findById(corporateId);
  if (!corporate) {
    throw new AppError("Corporate not found", 404);
  }

  /* 🔢 Sequence Count (per role per corporate) */
  const count = await CorporateUser.countDocuments({
    corporateId,
    role
  });

  /* 🔑 Generate Login ID */
  const loginId = generateCorporateLoginId({
    corporateId,
    role,
    sequence: count + 1
  });

  /* 🚫 Prevent Duplicate */
  const exists = await CorporateUser.findOne({ loginId });
  if (exists) {
    throw new AppError("Login ID already exists", 409);
  }

  /* 🔐 Password */
  const finalPassword = password || generateStrongPassword();

  /* 🧾 Create User */
  const user = await CorporateUser.create({
    corporateId,
    loginId,
    name,
    role,
    password: finalPassword,
    createdBy: req.user.id
  });

  /* ✅ Response (Password returned ONCE) */
  res.status(201).json({
    success: true,
    message: "Corporate employee created successfully",
    data: {
      loginId: user.loginId,
      role: user.role,
      temporaryPassword: finalPassword
    }
  });
});


// exports.getCorporates = asyncHandler(async (req, res) => {
//   if (req.user.role !== "SUPER_ADMIN") {
//     throw new AppError("Access denied", 403);
//   }
//   const corporates = await Corporate.find({ isDeleted: false })
//     .populate("createdBy", "name email")
//     .sort("-createdAt");

//   res.json({
//     success: true,
//     count: corporates.length,
//     data: corporates
//   });
// });
// exports.getCorporateById = asyncHandler(async (req, res) => {
//   const corporate = await Corporate.findOne({
//     _id: req.params.id,
//     isDeleted: false
//   }).populate("createdBy", "name email");

//   if (!corporate) {
//     throw new AppError("Corporate not found", 404);
//   }

//   res.json({
//     success: true,
//     data: corporate
//   });
// });
// exports.updateCorporate = asyncHandler(async (req, res) => {
//   if (req.user.role !== "SUPER_ADMIN") {
//     throw new AppError("Only Super Admin can update corporate", 403);
//   }
//   const corporate = await Corporate.findOneAndUpdate(
//     { _id: req.params.id, isDeleted: false },
//     {
//       ...req.body,
//       lastModifiedBy: req.user.id
//     },
//     { new: true, runValidators: true }
//   );

//   if (!corporate) {
//     throw new AppError("Corporate not found", 404);
//   }
//   res.json({
//     success: true,
//     message: "Corporate updated successfully",
//     data: corporate
//   });
// });
// exports.deleteCorporate = asyncHandler(async (req, res) => {
//   if (req.user.role !== "SUPER_ADMIN") {
//     throw new AppError("Only Super Admin can delete corporate", 403);
//   }
//   const corporate = await Corporate.findOneAndUpdate(
//     { _id: req.params.id, isDeleted: false },
//     {
//       isDeleted: true,
//       isActive: false,
//       deletedAt: new Date(),
//       lastModifiedBy: req.user.id
//     },
//     { new: true }
//   );
//   if (!corporate) {
//     throw new AppError("Corporate not found", 404);
//   }
//   res.json({
//     success: true,
//     message: "Corporate deleted successfully"
//   });
// });