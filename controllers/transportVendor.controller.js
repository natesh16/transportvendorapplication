const TransportVendor = require("../models/transportVendor.model");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

/* ===================================================== */
/* 🔐 Allowed Corporate Roles                             */
/* ===================================================== */

const ALLOWED_ROLES = ["CORPORATE_ADMIN", "CORPORATE_SUPERVISOR"];

/* ===================================================== */
/* 🧠 Vendor Code Generator (Corporate Scoped)             */
/* ===================================================== */

const generateVendorCode = async (corporateId, vendorName) => {
  if (!vendorName) {
    throw new AppError("Vendor name is required", 400);
  }

  const words = vendorName
    .replace(/[^a-zA-Z ]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2);

  const namePart = words
    .map(word => word.substring(0, 4).toUpperCase())
    .join("-");

  const count = await TransportVendor.countDocuments({
    corporateId,
    isDeleted: false
  });

  const sequence = String(count + 1).padStart(3, "0");

  return `VND-${namePart}-${sequence}`;
};

/* ===================================================== */
/* 🚚 Create Transport Vendor                              */
/* ===================================================== */

exports.createTransportVendor = asyncHandler(async (req, res, next) => {
  /* ---------- Auth Context (From Cookie) ---------- */
  if (!req.user) {
    return next(new AppError("Authentication required", 401));
  }

  const { _id: userId, role, corporateId } = req.user;

  if (!ALLOWED_ROLES.includes(role)) {
    return next(
      new AppError(
        "Only Corporate Admin or Supervisor can create transport vendors",
        403
      )
    );
  }

  /* ---------- Request Body ---------- */
  const {
    vendorName,
    legalEntityName,
    vendorType,
    yearOfIncorporation,
    contactPerson,
    supportContact,
    address,
    gstNumber,
    panNumber,
    bankDetails,
    serviceAreas,
    shiftSupport,
    documents
  } = req.body;

  /* ---------- Mandatory Validation ---------- */
  if (!vendorName || !legalEntityName || !vendorType) {
    return next(
      new AppError(
        "vendorName, legalEntityName and vendorType are required",
        400
      )
    );
  }

  if (!Array.isArray(documents) || documents.length === 0) {
    return next(
      new AppError("At least one vendor document is required", 400)
    );
  }

  /* ---------- Generate Vendor Code ---------- */
  const vendorCode = await generateVendorCode(corporateId, vendorName);

  /* ---------- Create Vendor ---------- */
  const vendor = await TransportVendor.create({
    corporateId,
    vendorName,
    legalEntityName,
    vendorCode,
    vendorType,
    yearOfIncorporation,
    contactPerson,
    supportContact,
    address,
    gstNumber,
    panNumber,
    bankDetails,
    serviceAreas,
    shiftSupport,
    documents,
    complianceStatus: "PENDING",
    lifecycleStatus: "ONBOARDING",
    createdBy: userId
  });

  /* ---------- Response ---------- */
  res.status(201).json({
    success: true,
    message: "Transport vendor created successfully",
    data: {
      vendorId: vendor._id,
      vendorCode: vendor.vendorCode,
      vendorName: vendor.vendorName,
      complianceStatus: vendor.complianceStatus,
      lifecycleStatus: vendor.lifecycleStatus
    }
  });
});
