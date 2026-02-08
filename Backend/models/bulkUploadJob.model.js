// models/bulkUploadJob.model.js
const mongoose = require("mongoose");

const bulkUploadJobSchema = new mongoose.Schema(
  {
    corporateId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
      default: "PENDING"
    },

    summary: {
      total: Number,
      inserted: Number,
      failed: Number,
      duplicates: Number
    },

    failedRows: [
      {
        row: Number,
        error: String
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("BulkUploadJob", bulkUploadJobSchema);
