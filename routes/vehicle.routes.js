const express = require("express");
const router = express.Router();

const { createVehicle,updateVehicleByVehicleId, getVehicles} = require("../controllers/vendor.vehicle.controller");
const { validateCreateVehicle } = require("../middlewares/validate.Vehicle");
const { validateVehicleUpdate } = require("../middlewares/validate.VehicleUpdate");

router.post("/createfleet", validateCreateVehicle, createVehicle);
router.put("/updatafleet/:vehicleId",validateVehicleUpdate,updateVehicleByVehicleId);
router.get("/getfleet/:vendorId",getVehicles);

module.exports = router;
