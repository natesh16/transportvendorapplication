const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(v);
        },
        message: props => `${props.value} is not a valid email`
      }
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: [
        "SUPER_ADMIN",
        "CORPORATE_ADMIN",
        "CORPORATE_SUPERVISOR",
        "VENDOR_ADMIN",
        "VENDOR_SUPERVISOR"
      ],
      required: true
    },
    corporateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Corporate",
      default: null
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);
module.exports = mongoose.model("User", userSchema);