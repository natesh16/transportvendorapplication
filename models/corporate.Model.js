const mongoose = require("mongoose");
const crypto = require("crypto");
const { encrypt } = require("../utils/cryptoUtil");
const corporateSchema = new mongoose.Schema(
  {
    corporateCode: {
      type: String,
      unique: true,
      required: true,
      uppercase: true
    },
    companyName: {
      type: String,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin"
    },
    registeredEmail: {
      type: String,
      required: true,
      lowercase: true
    },
    registeredPhone: String,
    address: {
      line1: String,
      city: String,
      state: String,
      pincode: String
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active"
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  corporateSchema.pre("validate", function (next) {
    if (!this.corporateCode) {
    const secret = process.env.CORPORATE_CODE_SECRET;
    if (!secret) throw new Error("CORPORATE_CODE_SECRET missing");

    const rawCode =
      "CORP-" +
      crypto
        .createHmac("sha256", secret)
        .update(this._id.toString())
        .digest("hex")
        .substring(0, 8)
        .toUpperCase();

    // 🔐 Store only encrypted value
    this.corporateCode = encrypt(rawCode);
  }
  next();
  { timestamps: true }
);

module.exports = mongoose.model("Corporate", corporateSchema)