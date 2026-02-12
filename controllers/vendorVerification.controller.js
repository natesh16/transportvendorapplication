const TransportVendor = require("../models/transportVendor.model");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

exports.verifyVendor = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;

  const vendor = await TransportVendor.findById(vendorId);
  if (!vendor) {
    throw new AppError("Vendor not found", 404);
  }

  /* Ensure all mandatory docs are verified */
  const unverified = vendor.documents.filter(
    (d) => !d.verified
  );

  if (unverified.length > 0) {
    throw new AppError(
      "All vendor documents must be verified",
      400
    );
  }

  vendor.verificationStatus = "VERIFIED";
  vendor.verifiedBy = req.user._id;

  await vendor.save();

  res.json({
    success: true,
    message: "Vendor verified successfully",
    vendorCode: vendor.vendorCode
  });
});
