const express = require("express");
const router = express.Router();

/* Controllers */
const {
  loginCorporateUser
} = require("../controllers/corporateAuth.User.controller");

/**
 * @route   POST /api/v1/corporate/auth/login
 * @desc    Corporate User Login
 * @access  Public
 */
router.post("/login", loginCorporateUser);

module.exports = router;
