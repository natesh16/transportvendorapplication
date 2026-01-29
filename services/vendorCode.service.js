const TransportVendor = require("../models/transportVendor.model");
const AppError = require("../utils/appError");

/**
 * 🧠 Generate Vendor Code (Corporate Scoped)
 * Format: VND-XXXX-YYYY-001
 */

/* ===================================================== */
/* 🧠 Vendor Code Generator (Corporate Scoped)             */
/* ===================================================== */

exports.generateVendorCode = async (corporateId, vendorName) => {
  if (!corporateId) {
    throw new AppError("corporateId is required", 400);
  }

  if (!vendorName) {
    throw new AppError("Vendor name is required", 400);
  }

  const words = vendorName
    .replace(/[^a-zA-Z ]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2);

  if (words.length === 0) {
    throw new AppError("Invalid vendor name", 400);
  }

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
