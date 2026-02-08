// models/alert.model.js
const mongoose = require("mongoose");
const alertSchema = new mongoose.Schema(
  {
    corporateId: mongoose.Schema.Types.ObjectId,
    vendorId: mongoose.Schema.Types.ObjectId,
    driverId: mongoose.Schema.Types.ObjectId,

    alertType: {
      type: String,
      enum: ["DOC_EXPIRY", "DOC_EXPIRED"]
    },


    
    message: String,
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM"
    },

    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Alert", alertSchema);
