/**
 * Corporate RBAC Middleware
 * @param {String} permission - e.g. "employee.create"
 */
exports.corporateRBAC = (permission) => {
  return (req, res, next) => {
    const user = req.corporateUser;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Corporate authentication required"
      });
    }

    // CORPORATE_ADMIN → full access shortcut (optional)
    if (user.role === "CORPORATE_ADMIN") {
      return next();
    }

    const permissionNames = user.permissions.map(
      (p) => p.name
    );

    if (!permissionNames.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: "Permission denied"
      });
    }

    next();
  };
};
