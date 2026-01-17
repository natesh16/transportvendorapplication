// models/corporateUserModel.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const corporateUserSchema = new mongoose.Schema(
  {
    corporateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Corporate",
      required: true,
      index: true,
      immutable: true
    },
    loginId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 80
    },
    password: {
      type: String,
      required: true,
      select: false,
      minlength: 12 // enforce strong passwords
    },
    passwordChangedAt: Date,
    role: {
      type: String,
      enum: ["CORPORATE_ADMIN", "CORPORATE_SUPERVISOR"],
      required: true,
      index: true
    },
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: Date,
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      required: true,
      immutable: true
    },

    lastLogin: Date,
    lastLoginIp: String
  },
  {
    timestamps: true,
    versionKey: false
  }
);
corporateUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (
    !validator.isStrongPassword(this.password, {
      minLength: 12,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    })
  ) {
    return next(
      new Error(
        "Password must contain uppercase, lowercase, number, and symbol"
      )
    );
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
corporateUserSchema.methods.correctPassword = async function (
  candidatePassword
) {
  return bcrypt.compare(candidatePassword, this.password);
};
corporateUserSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};
corporateUserSchema.methods.incrementLoginAttempts = async function () {
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
corporateUserSchema.pre(/^find/, function (next) {
  this.find({
    isDeleted: false,
    isActive: true
  });
  next();
});
corporateUserSchema.index(
  { corporateId: 1, role: 1 },
  { background: true }
);

corporateUserSchema.index(
  { loginId: 1, isDeleted: 1 },
  { unique: true }
);
module.exports = mongoose.model("CorporateUser", corporateUserSchema);
