const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const validator = require("validator");

const superAdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
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
        message: "Invalid email format"
      }
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    role: {
      type: String,
      enum: ["SUPER_ADMIN"],
      default: "SUPER_ADMIN",
      immutable: true
    },

    passwordChangedAt: Date,

    passwordResetToken: String,
    passwordResetExpires: Date,

    failedLoginAttempts: {
      type: Number,
      default: 0
    },

    lockUntil: Date,

    lastLogin: Date,

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

/* ================= PASSWORD VALIDATION ================= */

function isStrongPassword(password) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[@$!%*?&]/.test(password)
  );
}

/* ================= PRE SAVE HOOK ================= */

superAdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  if (!isStrongPassword(this.password)) {
    return next(
      new Error(
        "Password must contain uppercase, lowercase, number and special character"
      )
    );
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
});

/* ================= INSTANCE METHODS ================= */

superAdminSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

superAdminSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

superAdminSchema.methods.incrementLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.failedLoginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    this.failedLoginAttempts += 1;
    if (this.failedLoginAttempts >= 5) {
      this.lockUntil = Date.now() + 15 * 60 * 1000;
    }
  }
  await this.save({ validateBeforeSave: false });
};

superAdminSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

superAdminSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    return JWTTimestamp < parseInt(this.passwordChangedAt.getTime() / 1000, 10);
  }
  return false;
};

/* ================= STATIC METHOD ================= */

superAdminSchema.statics.findByResetToken = function (hashedToken) {
  return this.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  }).select("+password");
};

module.exports = mongoose.model("SuperAdmin", superAdminSchema);
