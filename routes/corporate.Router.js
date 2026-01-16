const express = require("express");
const {protectSuperAdmin}=require('../middlewares/auth')
const { createCorporate } = require("../controllers/corporate.controller");
const router = express.Router();
router.route("/create/corporateID")
    .post(protectSuperAdmin,createCorporate)
    // .get(getSuperAdmins);

module.exports = router;