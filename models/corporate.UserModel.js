// models/corporateUserModel.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const crypto = require("crypto");

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
    dob: {
      type: Date,
      required: true
    },
    password: {
      type: String,
      required: true,
      select: false,
      minlength: 12 // enforce strong passwords
    },
    mustChangePassword: {
      type: Boolean,
      default: true
    },
    passwordChangedAt: Date,
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

// corporateUserSchema.pre("save", async function (next) {
//   if (!this.isModified("password"));
//   if (
//     !validator.isStrongPassword(this.password, {
//       minLength: 12,
//       minLowercase: 1,
//       minUppercase: 1,
//       minNumbers: 1,
//       minSymbols: 1
//     })
//   ) {
//     return next(
//       new Error(
//         "Password must contain uppercase, lowercase, number, and symbol"
//       )
//     );
//   }
//   const salt = await bcrypt.genSalt(12);
//   this.password = await bcrypt.hash(this.password, salt);
//   this.passwordChangedAt = Date.now() - 1000;
// });
// corporateUserSchema.statics.generateTempPassword = function () {
//   const random = crypto.randomBytes(8).toString("hex"); // 32 chars
//   return `${random}@A1`; // adds uppercase, symbol, number
// };
// corporateUserSchema.methods.correctPassword = async function (
//   candidatePassword
// ) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// corporateUserSchema.statics.generateTempPassword = function (
//   name,
//   dob
// ) {
//   if (!name || typeof name !== "string") {
//     throw new Error("Name is required to generate password");
//   }

//   if (!dob) {
//     throw new Error("Date of birth is required to generate password");
//   }

//   const namePart = name
//     .trim()
//     .replace(/\s+/g, "")
//     .substring(0, 3)
//     .toUpperCase();

//   const dobPart = new Date(dob)
//     .toISOString()
//     .slice(0, 10)
//     .replace(/-/g, "");

//   return `${namePart}${dobPart}@A1`;

//   const salt = await bcrypt.genSalt(12);
//   this.password = await bcrypt.hash(this.password, salt);
//   this.passwordChangedAt = Date.now() - 1000;

// };


// corporateUserSchema.methods.correctPassword = async function (
//   candidatePassword
// ) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// corporateUserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();

//   if (
//     !validator.isStrongPassword(this.password, {
//       minLength: 12,
//       minLowercase: 1,
//       minUppercase: 1,
//       minNumbers: 1,
//       minSymbols: 1
//     })
//   ) {
//     return 
//       new Error(
//         "Password must contain uppercase, lowercase, number, and symbol"
//       )
//   }

//   const salt = await bcrypt.genSalt(12);
//   this.password = await bcrypt.hash(this.password, salt);

//   this.passwordChangedAt = Date.now() - 1000;
//   next();
// });

// corporateUserSchema.statics.generateTempPassword = function (
//   username,
//   dob
// ) {
//   const date = new Date(dob);
//   const dd = String(date.getDate()).padStart(2, "0");
//   const mm = String(date.getMonth() + 1).padStart(2, "0");
//   const yyyy = date.getFullYear();

//   return `${username.toUpperCase()}@${dd}${mm}${yyyy}`;
// };

corporateUserSchema.statics.generateTempPassword = function (
  username,
  dob
) {
  // 1️⃣ Remove spaces and trim
  const cleanedUsername = username.replace(/\s+/g, "").trim();

  // 2️⃣ Take first 4 characters
  const shortName = cleanedUsername
    .substring(0, 4)
    .toUpperCase();

  // 3️⃣ Format DOB as DDMMYYYY
  const date = new Date(dob);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  // 4️⃣ Final password
  return `${shortName}@${dd}${mm}${yyyy}`;
};


/* ---------------------------------- */
/* 🔐 Hash Password (Pre Save)         */
/* ---------------------------------- */
corporateUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return ;

  this.password = await bcrypt.hash(this.password, 12);
  // next();
});

/* ---------------------------------- */
/* 🔑 Compare Password (Login)         */
/* ---------------------------------- */
corporateUserSchema.methods.comparePassword = async function (
  candidatePassword
) {
  return await bcrypt.compare(candidatePassword, this.password);
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
/* 🔒 Check if account is locked */
corporateUserSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

/* 🚨 Increment login attempts */
corporateUserSchema.methods.incrementLoginAttempts = async function () {
  const MAX_ATTEMPTS = 5;
  const LOCK_TIME = 30 * 60 * 1000; // 30 minutes

  // If lock expired → reset
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    this.loginAttempts += 1;

    // Lock account
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
});
corporateUserSchema.index(
  { corporateId: 1, role: 1 },
  { background: true }
);

corporateUserSchema.index(
  { loginId: 1, isDeleted: 1 },
  { unique: true }
);
module.exports = mongoose.model("CorporateUserID", corporateUserSchema);
