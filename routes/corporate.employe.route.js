const express = require("express");
const router = express.Router();

const {
  createEmployee
} = require("../controllers/corporate.employeid.controller");
// const { protect } = require("../middlewares/auth");
const { protectCorporate } = require("../middlewares/corporate.Auth");
const { corporateRBAC } = require("../middlewares/corporateRbac");

router.route("/create/employee").post(protectCorporate,corporateRBAC,createEmployee);

module.exports = router;
