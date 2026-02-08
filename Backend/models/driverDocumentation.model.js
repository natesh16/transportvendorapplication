// models/driverDocumentation.model.js
const mongoose = require("mongoose");
const validator = require("validator");

/* ===================================================== */
/* 📄 COMMON DOCUMENT SCHEMA (REUSABLE)                  */
/* ===================================================== */

const documentSchema = new mongoose.Schema(
  {
    documentNumber: {
      type: String,
      trim: true
    },

    documentUrl: {
      type: String,
      required: true,
      validate: {
        validator: validator.isURL,
        message: "Invalid document URL"
      }
    },

    issuedDate: Date,

    expiryDate: {
      type: Date,
      index: true
    },

    verifiedStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
      index: true
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CorporateUser"
    },

    verifiedAt: Date,
    rejectionReason: String
  },
  { _id: false }
);

/* ===================================================== */
/* 🚗 DRIVER DOCUMENTATION (FINAL)                       */
/* ===================================================== */

const driverDocumentationSchema = new mongoose.Schema(
  {
    /* ---------- Multi-Tenant Ownership ---------- */

    corporateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Corporate",
      required: true,
      index: true,
      immutable: true
    },

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TransportVendor",
      required: true,
      index: true,
      immutable: true
    },

    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
      unique: true,
      index: true
    },

    /* ================================================= */
    /* 🔐 MANDATORY DOCUMENTS                            */
    /* ================================================= */

    drivingLicense: {
      type: documentSchema,
      required: true
    },

    policeVerification: {
      type: documentSchema,
      required: true
    },

    medicalFitnessCertificate: {
      type: documentSchema,
      required: true
    },

    addressProof: {
      type: documentSchema,
      required: true
    },

    driverPhoto: {
      type: String,
      required: true,
      validate: {
        validator: validator.isURL,
        message: "Invalid driver photo URL"
      }
    },

    /* ================================================= */
    /* 🧾 REGULATORY / CONDITIONAL DOCUMENTS              */
    /* ================================================= */

    aadhaarCard: documentSchema,

    panCard: documentSchema,

    esiCard: documentSchema,

    pfUan: {
      uanNumber: String,
      documentUrl: {
        type: String,
        validate: validator.isURL
      }
    },

    bankProof: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      documentUrl: {
        type: String,
        validate: validator.isURL
      }
    },

    trainingCertificate: documentSchema,

    drugAlcoholTest: {
      type: documentSchema
    },

    /* ================================================= */
    /* 📊 COMPLIANCE & STATUS                             */
    /* ================================================= */

    complianceStatus: {
      type: String,
      enum: ["COMPLIANT", "EXPIRING_SOON", "NON_COMPLIANT"],
      default: "COMPLIANT",
      index: true
    },

    employmentStatus: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED", "BLOCKED"],
      default: "ACTIVE",
      index: true
    },

    /* ================================================= */
    /* 🧾 AUDIT                                          */
    /* ================================================= */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CorporateUser",
      required: true
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CorporateUser"
    }
  },
  {
    timestamps: true,
    strict: true
  }
);

/* ===================================================== */
/* ⚡ INDEXES (ENTERPRISE SCALE)                          */
/* ===================================================== */

driverDocumentationSchema.index({ vendorId: 1, employmentStatus: 1 });
driverDocumentationSchema.index({
  "drivingLicense.expiryDate": 1,
  "medicalFitnessCertificate.expiryDate": 1,
  "drugAlcoholTest.expiryDate": 1
});

/* ===================================================== */
/* ✅ COMPLIANCE VIRTUAL                                  */
/* ===================================================== */

driverDocumentationSchema.virtual("isFullyCompliant").get(function () {
  return (
    this.drivingLicense?.verifiedStatus === "VERIFIED" &&
    this.policeVerification?.verifiedStatus === "VERIFIED" &&
    this.medicalFitnessCertificate?.verifiedStatus === "VERIFIED" &&
    this.complianceStatus === "COMPLIANT"
  );
});

module.exports = mongoose.model(
  "DriverDocumentation",
  driverDocumentationSchema
);
