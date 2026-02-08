const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/apperror");
const BulkUploadJob = require("../models/bulkUploadJob.model");
const { processBulkEmployees } = require("../services/bulkEmployeeProcessor.service");

exports.bulkUploadEmployees = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Excel file is required", 400);
  }

  const job = await BulkUploadJob.create({
    corporateId: req.user.corporateId,
    uploadedBy: req.user._id
  });

  // 🚀 async, non-blocking
  setImmediate(() => {
    processBulkEmployees({
      fileBuffer: req.file.buffer,
      jobId: job._id,
      user: req.user
    });
  });

  res.status(202).json({
    success: true,
    message: "Bulk upload started",
    jobId: job._id
  });
});
