const Vehicle = require("../model/fleetModels");
const asyncHandler = require("../utils/asyncHandler");
const { v4: uuidv4 } = require("uuid");

/**
 * @desc   Create a new vehicle
 * @route  POST /api/vehicles
 * @access Private
 */
exports.createVehicle = asyncHandler(async (req, res) => {
  const {
    vendorId,
    vehicleNumber,
    vehicleType,
    model,
    manufactureYear,
    seatingCapacity,
    fuelType,
    status
  } = req.body;

  // Check duplicate vehicle number
  const existingVehicle = await Vehicle.findOne({ vehicleNumber });
  if (existingVehicle) {
    return res.status(409).json({ message: "Vehicle already exists" });
  }

  const vehicle = await Vehicle.create({
    vendorId,
    vehicleNumber,
    vehicleId: `VEH-${uuidv4().slice(0, 8).toUpperCase()}`,
    vehicleType,
    model,
    manufactureYear,
    seatingCapacity,
    fuelType,
    status
  });

  res.status(201).json({
    success: true,
    message: "Vehicle created successfully",
    data: vehicle
  });
});
