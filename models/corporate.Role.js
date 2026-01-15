const mongoose = require("mongoose");
const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: [
      "CORPORATE_ADMIN",
      "CORPORATE_SUPERVISOR"
    ],
    unique: true,
    required: true
  },
  permissions: [
    {
      type: String // e.g. "CREATE_USER", "VIEW_REPORTS"
    }
  ]
});
module.exports = mongoose.model("Role", roleSchema);
