const express = require("express");
const router = express.Router();

const {
  createEmployee
} = require("../controllers/corporate.employeid.controller");
const { corporateprotect,allowRoles } = require("../middlewares/auth");

router.post(
  "/create/employees",
  corporateprotect,
  allowRoles("CORPORATE_ADMIN", "CORPORATE_SUPERVISOR"),
  createEmployee
);

module.exports = router;
