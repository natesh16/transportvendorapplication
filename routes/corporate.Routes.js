const express = require("express");
const { protectSuperAdmin }=require('../middlewares/auth')
const { allowRoles } = require("../middlewares/auth");
const { createCorporate,createCorporateEmployee } = require("../controllers/corporate.controller");
const router = express.Router();

console.log("corporateprotect:", typeof corporateprotect);
console.log("allowRoles:", typeof allowRoles);
console.log("createCorporate:", typeof createCorporate);

// router.route("/creategem")
//     .post(protectSuperAdmin,createCorporate)
router.post("/create/corporateID", protectSuperAdmin, createCorporate);

router.route("/create/corporateLoginID")
    .post(protectSuperAdmin,createCorporateEmployee)
    // .get(getSuperAdmins);

module.exports = router;