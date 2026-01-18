const express = require("express");
const {protectSuperAdmin}=require('../middlewares/auth')
const { createCorporate,createCorporateEmployee } = require("../controllers/corporate.controller");
const router = express.Router();
router.route("/create/corporateID")
    .post(protectSuperAdmin,createCorporate)
router.route("/create/corporateLoginID")
    .post(protectSuperAdmin,createCorporateEmployee)
    // .get(getSuperAdmins);

module.exports = router;