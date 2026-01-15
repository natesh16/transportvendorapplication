const contractSchema = new mongoose.Schema({
  corporateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Corporate",
    required: true
  },

  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true
  },

  pricingModel: {
    type: String,
    enum: ["PER_TRIP", "PER_KM", "MONTHLY"],
    required: true
  },

  SLA: {
    onTimePercentage: Number,
    vehicleReplacementTime: Number
  },

  contractStartDate: Date,
  contractEndDate: Date,

  status: {
    type: String,
    enum: ["ACTIVE", "SUSPENDED", "EXPIRED"],
    default: "ACTIVE"
  }
}, { timestamps: true });

module.exports = mongoose.model("CorporateVendorContract", contractSchema);
