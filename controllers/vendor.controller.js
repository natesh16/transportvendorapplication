const VendorUser = require("../models/VendorUser");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
exports.loginVendor = async (req, res) => {
  const { email, password } = req.body;
  const user = await VendorUser.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = generateToken({
    userId: user._id,
    role: user.role,
    corporateId: user.corporateId,
    vendorId: user.vendorId,
    permissions: user.permissions
  });
  
  res.json({
    success: true,
    token,
    role: user.role
  });
};
