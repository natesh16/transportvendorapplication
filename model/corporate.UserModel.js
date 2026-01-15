// models/corporateUserModel.js
const mongoose = require("mongoose");
const validate=require("express-validator")
const corporateUserSchema = new mongoose.Schema(
  {
    corporateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Corporate",
      required: true
    },

    name: {
      type: String,
      required: true
    },
 email: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
      validate: [validator.isEmail, "Invalid email"]
    },
    phone: String,

    password: {
      type: String,
      required: true,
      select: false
    },

    role: {
      type: String,
      enum: ["CORPORATE_SUPER_ADMIN", "CORPORATE_SUPERVISOR"],
      required: true
    },

    permissions: [
      {
        type: String,
        enum: [
          "EMPLOYEE_READ",
          "EMPLOYEE_WRITE",
          "TRIP_READ",
          "TRIP_ASSIGN",
          "VENDOR_READ",
          "REPORT_VIEW",
          "BILLING_VIEW"
        ]
      }
    ],

    isActive: {
      type: Boolean,
      default: true
    },

    lastLogin: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("CorporateUser", corporateUserSchema);
