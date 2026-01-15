// middleware/corporateAuth.js
exports.authorizeCorporateRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied for your role"
      });
    }
    next();
  };
};
