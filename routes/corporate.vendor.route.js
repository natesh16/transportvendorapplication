const express = require("express");
const router = express.Router();
const  corporateprotect  = require("../middlewares/auth");
const {createTransportVendor}=require('../controllers/transportVendor.controller')

// const protect = require("../middlewares/auth");
// const { allowRoles }  = require("../middlewares/rbac");
// router.post(
//   "/vendors",
//   corporateprotect, // ✅ reads JWT from cookie
//   createTransportVendor
// );

router.route('/vendors').post( 
  corporateprotect,
  createTransportVendor)

module.exports = router;
