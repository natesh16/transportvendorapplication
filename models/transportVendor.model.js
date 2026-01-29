const mongoose = require("mongoose");
const vendorDocumentSchema = require("./vendorDocumentschema");

/**
 * 🚚 Transport Vendor Schema
 * Corporate-Owned • Compliance-Driven • Scalable
 */

const transportVendorSchema = new mongoose.Schema(
  {
    /* ================= Ownership ================= */

    corporateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Corporate",
      required: true,
      index: true,
      immutable: true
    },

    /* ================= Company Profile ================= */

    vendorName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    legalEntityName: {
      type: String,
      required: true,
      trim: true
    },

    vendorCode: {
      type: String,
      unique: true,
      uppercase: true,
      index: true,
      immutable: true
    },

    vendorType: {
      type: String,
      enum: ["INDIVIDUAL", "PARTNERSHIP", "PRIVATE_LIMITED", "LLP"],
      required: true
    },

    yearOfIncorporation: {
      type: Number,
      min: 1950
    },

    /* ================= Contact ================= */

    contactPerson: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, lowercase: true }
    },

    supportContact: {
      phone: String,
      email: String
    },

    address: {
      line1: String,
      city: { type: String, index: true },
      state: String,
      pincode: String,
      country: { type: String, default: "India" }
    },

    /* ================= Compliance ================= */

    gstNumber: {
      type: String,
      uppercase: true,
      index: true
    },

    panNumber: {
      type: String,
      uppercase: true,
      index: true
    },

    complianceStatus: {
      type: String,
      enum: ["PENDING", "PARTIAL", "VERIFIED", "EXPIRED"],
      default: "PENDING",
      index: true
    },

    /* ================= Banking ================= */

    bankDetails: {
      accountName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      branch: String,
      verified: { type: Boolean, default: false }
    },

    /* ================= Service Capability ================= */

    serviceAreas: {
      type: [String],
      index: true
    },

    shiftSupport: {
      day: { type: Boolean, default: true },
      night: { type: Boolean, default: false }
    },

    fleetSummary: {
      totalVehicles: { type: Number, default: 0 },
      gpsEnabledVehicles: { type: Number, default: 0 },
      activeVehicles: { type: Number, default: 0 }
    },

    /* ================= Documents ================= */

    documents: {
      type: [vendorDocumentSchema],
      validate: [
        (docs) => docs.length > 0,
        "At least one vendor document is required"
      ]
    },

    /* ================= SLA & Performance ================= */

    sla: {
      maxPickupDelayMinutes: { type: Number, default: 10 },
      penaltyPerViolation: Number
    },

    slaStats: {
      totalTrips: { type: Number, default: 0 },
      violations: { type: Number, default: 0 },
      lastViolationAt: Date
    },

    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 }
    },

    /* ================= Vendor RBAC ================= */

    vendorAdmins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VendorUser"
      }
    ],

    vendorSupervisors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VendorUser"
      }
    ],

    /* ================= Lifecycle & Status ================= */

    lifecycleStatus: {
      type: String,
      enum: ["ONBOARDING", "ACTIVE", "SUSPENDED", "TERMINATED"],
      default: "ONBOARDING",
      index: true
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    isBlacklisted: {
      type: Boolean,
      default: false,
      index: true
    },

    blockedReason: String,
    terminatedAt: Date,

    /* ================= Audit ================= */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CorporateUser",
      required: true
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CorporateUser"
    },

    isDeleted: {
      type: Boolean,
      default: false,
      select: false
    }
  },
  {
    timestamps: true
  }
);

/* ===================================================== */
/* 🔐 Pre-save Hooks                                      */
/* ===================================================== */

transportVendorSchema.pre("save", function (next) {
  if (!this.vendorCode) {
    const suffix = this._id.toString().slice(-5).toUpperCase();
    this.vendorCode = `VND-${suffix}`;
  }
  next();
});

/* ===================================================== */
/* 📊 Virtuals                                            */
/* ===================================================== */

transportVendorSchema.virtual("isOperational").get(function () {
  return (
    this.lifecycleStatus === "ACTIVE" &&
    this.isActive &&
    !this.isBlacklisted &&
    this.complianceStatus === "VERIFIED"
  );
});

module.exports = mongoose.model(
  "TransportVendor",
  transportVendorSchema
);
