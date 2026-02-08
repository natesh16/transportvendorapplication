// models/driver.model.js
const mongoose = require("mongoose");
const validator = require("validator");

const driverSchema = new mongoose.Schema(
  {
    /* ---------------- Ownership ---------------- */

    corporateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Corporate",
      required: true,
      index: true
    },

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TransportVendor",
      required: true,
      index: true
    },

    /* ---------------- System Identity ---------------- */

    driverCode: {
      type: String,
      unique: true,
      index: true,
      uppercase: true,
      trim: true
    },

    /* ---------------- Personal Details ---------------- */

    name: {
      firstName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
      },
      lastName: {
        type: String,
        trim: true,
        maxlength: 50
      }
    },

    /* ---------------- Contact ---------------- */

    phone: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          // 🇮🇳 India + generic international
          return /^(\+91)?[6-9]\d{9}$/.test(v);
        },
        message: "Invalid phone number"
      },
      index: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      validate: {
        validator: validator.isEmail,
        message: "Invalid email address"
      }
    },

    /* ---------------- Status ---------------- */

    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED", "BLOCKED"],
      default: "ACTIVE",
      index: true
    }
  },
  {
    timestamps: true,
    strict: true
  }
);

/* ===================================================== */
/* ⚡ COMPOSITE INDEXES (ENTERPRISE SCALE)                */
/* ===================================================== */

driverSchema.index({ vendorId: 1, status: 1 });
driverSchema.index({ corporateId: 1, email: 1 });

module.exports = mongoose.model("Driver", driverSchema);
