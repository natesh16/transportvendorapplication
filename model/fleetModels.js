const mongoose = require("mongoose"); // ✅ IMPORT MONGOOSE

const vehicleSchema = new mongoose.Schema(
  {
    // vendorId: {
    //   // type: mongoose.Schema.Types.ObjectId,
    //   // ref: "Vendor",
    //   required: true
    // },

    vehicleNumber: {
      type: String,
      unique: true,
      required: true
    },

    vehicleId: {
      type: String,
      unique: true
    },

    vehicleType: {
      type: String,
      enum: ["Sedan", "SUV", "Tempo", "Bus", "Others"]
    },

    model: String,

    manufactureYear: Number,

    seatingCapacity: Number,

    fuelType: {
      type: String,
      enum: ["Petrol", "Diesel", "CNG", "EV"]
    },

    status: {
      type: String,
      enum: ["available", "assigned", "maintenance"],
      default: "available"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
