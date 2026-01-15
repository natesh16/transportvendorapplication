exports.authorizeVendor =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Vendor role access denied"
      });
    }
    next();
  };
exports.vendorPermission =
  (permission) =>
  (req, res, next) => {
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({
        message: "Vendor permission denied"
      });
    }
    next();
  };