// services/driverApproval.service.js
const Driver = require("../models/driver.model");
const DriverDocs = require("../models/driverDocumentation.model");

exports.approveDriverAndCreateId = async ({
  driverDocId,
  vendorUserId
}) => {
  const docs = await DriverDocs.findById(driverDocId);

  if (!docs) throw new Error("Driver documents not found");

  /* ✅ Validate mandatory documents */
  const mandatoryDocs = [
    docs.drivingLicense,
    docs.policeVerification,
    docs.medicalFitnessCertificate,
    docs.addressProof
  ];

  const allVerified = mandatoryDocs.every(
    (d) => d?.verifiedStatus === "VERIFIED"
  );

  if (!allVerified) {
    throw new Error("All mandatory documents must be verified");
  }

  /* 🚗 Create Driver */
  const driver = await Driver.create({
    corporateId: docs.corporateId,
    vendorId: docs.vendorId,
    phone: docs.drivingLicense.documentNumber // example
  });

  /* 🔗 Link Driver ID */
  docs.driverId = driver._id;
  docs.onboardingStatus = "DRIVER_CREATED";
  docs.approvedBy = vendorUserId;
  docs.approvedAt = new Date();

  await docs.save();

  return driver;
};
