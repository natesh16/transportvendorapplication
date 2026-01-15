exports.authorize =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access Denied"
      });
    }
    next();
  };
exports.checkPermission =
  (permission) =>
  (req, res, next) => {
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({
        message: "Permission Denied"
      });
    }
    next();
  };
