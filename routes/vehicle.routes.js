const express = require("express");
const router = express.Router();

const { createVehicle } = require("../controllers/vehicle.controller");
const { validateCreateVehicle } = require("../middlewares/validateVehicle");

router.post("/", validateCreateVehicle, createVehicle);

module.exports = router;
