const ApiError = require("../utils/ApiError");

/**
 * Allows:
 * - Vendor Admin (own vendor)
 * - Supervisor (own vendor)
 * - Super Admin (all vendors)
 */
module.exports = (req, res, next) => {
  const { role, vendorId: loggedVendorId } = req.user;
  const { vendorId } = req.params;

  if (role === "SUPER_ADMIN") return next();

  if (!loggedVendorId || loggedVendorId !== vendorId) {
    return next(new ApiError(403, "Vendor access denied"));
  }

  next();
};
