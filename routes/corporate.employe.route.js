const express = require("express");
const router = express.Router();

const {
  createEmployee,employeeLogin
} = require("../controllers/corporate.employeid.controller");
const { corporateprotect,allowRoles } = require("../middlewares/auth");

router.post(
  "/create/employees",
  corporateprotect,
  allowRoles("CORPORATE_ADMIN", "CORPORATE_SUPERVISOR"),
  createEmployee
);

// router.post('/employe/login'),employeeLogin
router.route("/login").post(employeeLogin)

module.exports = router;
