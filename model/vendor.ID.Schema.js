const vendorSchema = new mongoose.Schema({
  name: String,

  createdByCorporate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Corporate"
  },

  createdByUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User" // CORPORATE_ADMIN
  },

  isActive: Boolean
});
