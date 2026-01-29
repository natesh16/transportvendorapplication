// cron/driverDocumentExpiry.cron.js
const cron = require("node-cron");
const DriverDocs = require("../models/driverDocumentation.model");
const logger = require("../utils/logger");

const EXPIRY_WARNING_DAYS = [30, 15, 7, 1];

cron.schedule("0 2 * * *", async () => {
  logger.info("🚨 Driver document expiry cron started");

  const today = new Date();

  try {
    const drivers = await DriverDocs.find({
      employmentStatus: "ACTIVE"
    });

    for (const driver of drivers) {
      let expired = false;
      let expiringSoon = false;

      const documentsToCheck = [
        driver.drivingLicense,
        driver.medicalFitness,
        driver.trainingCertificate,
        driver.drugAlcoholTest
      ];

      for (const doc of documentsToCheck) {
        if (!doc?.expiryDate) continue;

        const daysLeft = Math.ceil(
          (doc.expiryDate - today) / (1000 * 60 * 60 * 24)
        );

        if (daysLeft <= 0) expired = true;
        else if (EXPIRY_WARNING_DAYS.includes(daysLeft))
          expiringSoon = true;
      }

      if (expired) {
        driver.complianceStatus = "NON_COMPLIANT";
        driver.employmentStatus = "SUSPENDED";
      } else if (expiringSoon) {
        driver.complianceStatus = "EXPIRING_SOON";
      } else {
        driver.complianceStatus = "COMPLIANT";
      }

      await driver.save();
    }

    logger.info("✅ Driver document expiry cron completed");
  } catch (err) {
    logger.error("❌ Driver expiry cron failed", err);
  }
});
await Alert.create({
  corporateId: driver.corporateId,
  vendorId: driver.vendorId,
  driverId: driver.driverId,
  alertType: expired ? "DOC_EXPIRED" : "DOC_EXPIRY",
  message: expired
    ? "Driver document expired. Driver suspended."
    : "Driver document expiring soon",
  severity: expired ? "HIGH" : "MEDIUM"
});
