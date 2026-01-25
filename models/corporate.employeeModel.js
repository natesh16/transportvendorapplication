// models/employeeModel.js
const mongoose = require("mongoose");
const validator = require("validator");

/**
 * 🔐 Enterprise Employee Schema
 * Secure • Auditable • Duplicate-Proof • Scalable
 */

const employeeSchema = new mongoose.Schema(
  {
    /* 🔗 Corporate Mapping */
    corporateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Corporate",
      required: true,
      index: true,
      immutable: true
    },

    /* 🆔 System Generated Employee Code */
    employeeCode: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      uppercase: true,
      index: true,
    },
  loginId: {
      type: String,
      unique: true,
      uppercase: true,
      index: true
    },

    /* 🔐 Authentication */
    password: {
      type: String,
      select: false
    },

    mustChangePassword: {
      type: Boolean,
      default: true
    },

    /* 👤 Identity */
    name: {
      firstName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50,
        match: [/^[a-zA-Z\s]+$/, "Invalid first name"]
      },
      lastName: {
        type: String,
        trim: true,
        maxlength: 50,
        match: [/^[a-zA-Z\s]*$/, "Invalid last name"]
      }
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"]
    },
dateOfBirth: {
  type: Date,
  required: true,
  index: true},
    /* 📧 Contact (Protected) */
    email: {
      type: String,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Invalid email address"
      },
      index: true
    },

    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Invalid phone number"]
    },

    /* 🏢 Employment */
    department: {
      type: String,
      trim: true,
      maxlength: 80
    },

    designation: {
      type: String,
      trim: true,
      maxlength: 80
    },

    employmentType: {
      type: String,
      enum: ["FULL_TIME", "PART_TIME", "CONTRACT"],
      required: true
    },

    joiningDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value <= new Date();
        },
        message: "Joining date cannot be in the future"
      }
    },

    /* ✅ Verification */
    isVerified: {
      type: Boolean,
      default: false
    },

    lastVerifiedAt: Date,

    /* 🚦 Status */
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
      select: false
    },

    statusReason: {
      type: String,
      maxlength: 200
    },

    /* 🧾 Audit */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CorporateUser",
      required: true,
      immutable: true
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CorporateUser"
    }
  },
  {
    timestamps: true,
    strict: "throw",
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/* 🔐 Prevent Duplicate Email per Corporate (Soft Delete Safe) */
employeeSchema.index(
  { corporateId: 1, email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      email: { $exists: true },
      isDeleted: false
    }
  }
);

/* 🔐 Prevent Duplicate Phone per Corporate */
employeeSchema.index(
  { corporateId: 1, phone: 1 },
  {
    unique: true,
    partialFilterExpression: {
      phone: { $exists: true },
      isDeleted: false
    }
  }
);

/* 🧼 Normalize Data */
employeeSchema.pre("save", function (next) {
  if (this.email) this.email = this.email.toLowerCase();
  if (this.employeeCode)
    this.employeeCode = this.employeeCode.toUpperCase();
});

/* 🛡️ Hide soft-deleted records by default */
employeeSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
});

/* 🔁 Soft Delete Method */
employeeSchema.methods.softDelete = function (userId, reason) {
  this.isDeleted = true;
  this.isActive = false;
  this.statusReason = reason || "Soft deleted";
  this.updatedBy = userId;
  return this.save();
};

module.exports = mongoose.model(" CorporateEmployee", employeeSchema);
