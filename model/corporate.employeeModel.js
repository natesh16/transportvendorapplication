// models/employeeModel.js
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    corporateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Corporate",
      required: true
    },

    employeeCode: {
      type: String,
      required: true
    },

    name: String,

    email: String,

    phone: String,

    pickupLocation: {
      lat: Number,
      lng: Number,
      address: String
    },

    dropLocation: {
      lat: Number,
      lng: Number,
      address: String
    },

    shiftTime: {
      login: String,
      logout: String
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
