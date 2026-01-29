const TransportVendor = require("../models/transportVendor.model");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const { generateVendorCode } = require("../services/vendorCode.service");


/* ===================================================== */
/* 🔐 Allowed Corporate Roles                             */
/* ===================================================== */

const ALLOWED_ROLES = ["CORPORATE_ADMIN", "CORPORATE_SUPERVISOR"];

/* ===================================================== */
/* 🚚 Create Transport Vendor                             */
/* ===================================================== */

exports.createTransportVendor = asyncHandler(async (req, res, next) => {
  /* ---------- Auth Context (Cookie Based) ---------- */
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const { _id: userId, role, corporateId } = req.user;

  if (!["CORPORATE_ADMIN", "CORPORATE_SUPERVISOR"].includes(role)) {
    throw new AppError(
      "Only Corporate Admin or Supervisor can create transport vendors",
      403
    );
  }

  /* ---------- Input ---------- */
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

  if (!vendorName || !legalEntityName || !vendorType) {
    throw new AppError(
      "vendorName, legalEntityName and vendorType are required",
      400
    );
  }

  if (!Array.isArray(documents) || documents.length === 0) {
    throw new AppError("At least one vendor document is required", 400);
  }

  /* ---------- Vendor Code ---------- */
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

/*============== vendor Approvel ===========*/
exports.approveVendor = asyncHandler(async (req, res, next) => {
  const { vendorId } = req.params;
  const { complianceStatus = "VERIFIED" } = req.body;

  if (!["VERIFIED", "PARTIAL"].includes(complianceStatus)) {
    return next(new AppError("Invalid compliance status", 400));
  }

  const vendor = await TransportVendor.findOne({
    _id: vendorId,
    corporateId: req.user.corporateId,
    isDeleted: false
  });

  if (!vendor) {
    return next(new AppError("Vendor not found", 404));
  }

  vendor.complianceStatus = complianceStatus;

  if (complianceStatus === "VERIFIED") {
    vendor.lifecycleStatus = "ACTIVE";
  }

  vendor.updatedBy = req.user._id;
  await vendor.save();

  res.json({
    success: true,
    message: "Vendor verified successfully",
    data: {
      vendorId: vendor._id,
      lifecycleStatus: vendor.lifecycleStatus,
      complianceStatus: vendor.complianceStatus
    }
  });
});
