// models/employeeModel.js
const mongoose = require("mongoose");
const validator = require("validator");

/**
 * 🔐 Enterprise Employee Schema
 * Secure • Auditable • Duplicate-Proof • Scalable
 */

const employeeSchema = new mongoose.Schema(
  {
    /* ===================================================== */
    /* 🔗 EXISTING FIELDS (UNCHANGED)                         */
    /* ===================================================== */

    corporateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Corporate",
      required: true,
      index: true,
      immutable: true
    },
    employeeCode: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      uppercase: true,
      index: true
    },

    loginId: {
      type: String,
      unique: true,
      uppercase: true,
      index: true
    },
password: {
  type: String,
  required: true,
  select: false, // ❗ never return password in queries
  // minlength: 12
},
    passwordChangedAt: Date,

    passwordExpiresAt: {
      type: Date,
      index: true
    },

    mustChangePassword: {
      type: Boolean,
      default: true
    },
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
      index: true
    },

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

    isVerified: {
      type: Boolean,
      default: false
    },

    lastVerifiedAt: Date,

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

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CorporateUser",
      // required: true,
      immutable: true
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CorporateUser"
    },

    /* ===================================================== */
    /* 🆕 EMPLOYEE LOCATION DETAILS                           */
    /* ===================================================== */

    location: {
      region: {
        type: String,
        trim: true,
        maxlength: 100,
        index: true
      },

      pickupPoint: {
        name: {
          type: String,
          trim: true,
          maxlength: 120
        },

        geo: {
          type: {
            type: String,
            enum: ["Point"],
            default: "Point"
          },
          coordinates: {
            type: [Number], // [longitude, latitude]
            index: "2dsphere"
          }
        }
      }
    },

    /* ===================================================== */
    /* 🆕 SHIFT CONFIGURATION                                 */
    /* ===================================================== */

    loginAudit: [
      {
        loginAt: {
          type: Date,
          default: Date.now
        },

        ipAddress: String,

        userAgent: String,

        device: String,

        success: Boolean,

        attemptedAt:Date
      }
    ],

    shift: {
      shiftName: {
        type: String,
        trim: true,
        maxlength: 50
      },

      loginTime: {
        type: String, // "09:00"
        match: [/^\d{2}:\d{2}$/, "Invalid login time format"]
      },

      logoutTime: {
        type: String, // "18:00"
        match: [/^\d{2}:\d{2}$/, "Invalid logout time format"]
      },

      isOvernight: {
        type: Boolean,
        default: false
      }
    },
    /* 🔐 Login Security */
    loginAttempts: {
      type: Number,
      default: 0
    },

    lockUntil: {
      type: Date
    },

    lastLoginAt: Date,

    /* ===================================================== */
    /* 🆕 SHIFT LOGIN / LOGOUT LOGS (AUDITABLE)               */
    /* ===================================================== */

    attendanceLogs: [
      {
        date: {
          type: Date,
          required: true,
          index: true
        },

        loginAt: Date,
        logoutAt: Date,

        status: {
          type: String,
          enum: ["ON_TIME", "LATE", "EARLY_EXIT", "ABSENT"]
        },

        loginGeo: {
          type: {
            type: String,
            enum: ["Point"],
            default: "Point"
          },
          coordinates: [Number]
        },

        deviceInfo: {
          ip: String,
          device: String
        }
      }
    ]
  },

  {
    timestamps: true,
    strict: "throw",
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/* ===================================================== */
/* 🔐 EXISTING INDEXES & MIDDLEWARE (UNCHANGED)           */
/* ===================================================== */

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

employeeSchema.pre("save", function (next) {
  if (this.email) this.email = this.email.toLowerCase();
  if (this.employeeCode)
    this.employeeCode = this.employeeCode.toUpperCase();
});

employeeSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
});

employeeSchema.methods.softDelete = function (userId, reason) {
  this.isDeleted = true;
  this.isActive = false;
  this.statusReason = reason || "Soft deleted";
  this.updatedBy = userId;
  return this.save();
};
employeeSchema.methods.isAccountLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};
employeeSchema.methods.incrementLoginAttempts = async function () {
  const MAX_ATTEMPTS = 5;
  const LOCK_TIME = 30 * 60 * 1000; // 30 minutes

  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    this.loginAttempts += 1;
    if (this.loginAttempts >= MAX_ATTEMPTS) {
      this.lockUntil = Date.now() + LOCK_TIME;
    }
  }

  await this.save({ validateBeforeSave: false });
};
employeeSchema.methods.addLoginAudit = async function ({
  req,
  success
}) {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress;

  this.loginAudit.push({
    ipAddress: ip,
    userAgent: req.headers["user-agent"],
    device: req.headers["user-agent"] || "Unknown",
    success
  });

  if (success) {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
    this.lastLoginAt = new Date();
  }

  await this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model("CorporateEmployee", employeeSchema);
