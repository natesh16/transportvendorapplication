
const TransportVendor = require("../models/transportVendor.model");

exports.generateVendorCode = async (corporateId) => {
  const year = new Date().getFullYear();

  const count = await TransportVendor.countDocuments({
    corporateId,
    verificationStatus: "VERIFIED"
  });

  const seq = String(count + 1).padStart(3, "0");

  const corpSuffix = corporateId.toString().slice(-6).toUpperCase();

  return `VND-${corpSuffix}-${year}-${seq}`;
};

