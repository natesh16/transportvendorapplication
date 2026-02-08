const jwt = require("jsonwebtoken");
module.exports = function sendToken(user, statusCode, res) {
  const token = jwt.sign(
    { id: user._id, role: "SUPER_ADMIN" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE } // 7 days
  );
  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production"
  };
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: "SUPER_ADMIN"
      }
    });
};