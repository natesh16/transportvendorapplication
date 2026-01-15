// config/corporateRoles.js
module.exports = {
  CORPORATE_SUPER_ADMIN: [
    "EMPLOYEE_READ",
    "EMPLOYEE_WRITE",
    "TRIP_READ",
    "TRIP_ASSIGN",
    "VENDOR_READ",
    "REPORT_VIEW",
    "BILLING_VIEW"
  ],

  CORPORATE_SUPERVISOR: [
    "EMPLOYEE_READ",
    "TRIP_READ",
    "TRIP_ASSIGN"
  ]
};
