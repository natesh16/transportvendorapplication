const mongoose = require("mongoose");
const crypto = require("crypto");
const validator = require("validator");
const { encrypt } = require("../utils/cryptoUtil");

/**
 * Corporate Schema
 * Secure, Auditable, Scalable
 */
const corporateSchema = new mongoose.Schema(
  {
    /* 🔐 Encrypted Business Identifier */
    corporateCode: {
      type: String,
      unique: true,
      required: true,
      index: true,
      immutable: true
    },

    /* 🏢 Corporate Identity */
    companyname: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      minlength: 3,
      maxlength: 120,
      index: "text"
    },

    /* 🖼️ Logo */
    logo: {
      url: {
        type: String,
        trim: true
      },
      uploadedAt: Date
    },

    /* 👤 Ownership */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      required: true,
      index: true
    },
contact: {
  /* 📧 Primary Contact Email */
  registeredEmail: {
    type: String,
    required: [true, "Registered email is required"],
    lowercase: true,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: "Invalid registered email"
    },
    index: true
  },

  /* 📞 Primary Contact Phone */
  registeredPhone: {
    type: String,
    trim: true,
    match: [/^[6-9]\d{9}$/, "Invalid phone number"]
  }
},
    
    /* 🏠 Address */
    address: {
      line1: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: {
        type: String,
        match: [/^\d{6}$/, "Invalid pincode"]
      }
    },

    /* 📦 Subscription */
    subscription: {
      plan: {
        type: String,
        enum: ["FREE", "BASIC", "PRO", "ENTERPRISE","PREMIUM"],
        default: "FREE",
        index: true
      },
      startDate: {
        type: Date,
        default: Date.now
      },
      endDate: Date,
      limits: {
        users: { type: Number, default: 5 },
        vendors: { type: Number, default: 2 },
        tripsPerMonth: { type: Number, default: 500 }
      },
      isActive: {
        type: Boolean,
        default: true
      }
    },

    /* 💳 Billing */
    billing: {
      gstNumber: {
        type: String,
        uppercase: true,
        trim: true,
        match: [
          /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
          "Invalid GST number"
        ]
      },
      billingEmail: {
        type: String,
        lowercase: true,
        trim: true,
        validate: {
          validator: validator.isEmail,
          message: "Invalid billing email"
        }
      },
      paymentProvider: {
        type: String,
        enum: ["RAZORPAY", "STRIPE", "MANUAL"],
        default: "MANUAL"
      },
      lastInvoiceId: String,
      lastPaymentDate: Date
    },


    /* 🔄 Employees */
    
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
    /* 🔄 Security */
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

    /* 🔄 Lifecycle */
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
      index: true
    },

    isActive: {
      type: Boolean,
      default: true
    },

    /* 🧾 Soft Delete */
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },

    deletedAt: Date
  },
  
  {
    timestamps: true,
    versionKey: false
  }
);

/* ======================================================
   🔐 Corporate Code Generator
====================================================== */
corporateSchema.pre("validate", function () {
  if (this.corporateCode) return;

  const secret = process.env.CORPORATE_CODE_SECRET;
  if (!secret) {
    throw new Error("CORPORATE_CODE_SECRET not configured");
  }

  if (!this._id) {
    this._id = new mongoose.Types.ObjectId();
  }

  const rawCode =
    "CORP-" +
    crypto
      .createHmac("sha256", secret)
      .update(this._id.toString())
      .digest("hex")
      .substring(0, 10)
      .toUpperCase();

  this.corporateCode = encrypt(rawCode);
});

/* ======================================================
   🔍 Global Query Filter
====================================================== */
corporateSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
});

/* ======================================================
   🧠 Virtuals
====================================================== */
corporateSchema.virtual("isSuspended").get(function () {
  return this.status === "suspended";
});

corporateSchema.virtual("isSubscriptionExpired").get(function () {
  return (
    this.subscription?.endDate &&
    this.subscription.endDate < new Date()
  );
});

/* ======================================================
   📤 Safe JSON Output
====================================================== */
corporateSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.corporateCode;
  return obj;
};

module.exports = mongoose.model("CorporateID", corporateSchema);
