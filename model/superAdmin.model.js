const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const superAdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: "Please provide a valid email address"
      }
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      validate: {
        validator: function (value) {
          return (
            value.length >= 8 &&
            /[A-Z]/.test(value) &&
            /[a-z]/.test(value) &&
            /[0-9]/.test(value) &&
            /[@$!%*?&]/.test(value)
          );
        },
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
      }
    },

    role: {
      type: String,
      enum: ["SUPER_ADMIN"],
      default: "SUPER_ADMIN"
    },

    lastLogin: {
      type: Date
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);
superAdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
superAdminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});
});
superAdminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
module.exports = mongoose.model("SuperAdmin", superAdminSchema);
