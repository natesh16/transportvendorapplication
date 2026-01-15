const mongoose = require("mongoose");
const corporateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    corporateCode: {
      type: String,
      unique: true,
      uppercase: true,
      index: true
    },
    logo: {
      type: String // S3 / CDN URL
    },
    description: String,
    contact: {
      email: {
        type: String,
        lowercase: true,
        trim: true
      },
      phone: String,
      website: String
    },
    address: {
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      country: {
        type: String,
        default: "India"
      },
      pincode: String
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      required: true
    },
    // admins: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "CorporateUser"
    //   }
    // ],
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active"
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date,
    subscription: {
      plan: {
        type: String,
        enum: ["trial", "basic", "premium", "enterprise"],
        default: "trial"
      },
      startDate: Date,
      endDate: Date,
      maxEmployees: Number,
      maxVendors: Number
    },
    billing: {
      gstNumber: String,
      billingEmail: String,
      paymentStatus: {
        type: String,
        enum: ["paid", "pending", "overdue"],
        default: "pending"
      }
    },
    usage: {
      totalEmployees: {
        type: Number,
        default: 0
      },
      totalTrips: {
        type: Number,
        default: 0
      },
      activeVendors: {
        type: Number,
        default: 0
      }
    },
    security: {
      twoFactorEnabled: {
        type: Boolean,
        default: false
      },
      ipWhitelist: [String],
      dataRetentionDays: {
        type: Number,
        default: 365
      }
    },   
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);
corporateSchema.index({ name: 1 });
corporateSchema.index({ corporateCode: 1 });
corporateSchema.index({ status: 1 });

module.exports = mongoose.model("Corporate", corporateSchema);
