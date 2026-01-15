const Vehicle = require("../model/fleet.Models");
const AppError = require("../utils/apperror");
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

/**
 * @desc   Update vehicle using vehicleId
 * @route  PUT /api/vehicles/:vehicleId
 * @access Private
 */

exports.updateVehicleByVehicleId = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;
  // Find vehicle using vehicleId (NOT _id)
  const vehicle = await Vehicle.findOne({ vehicleId });
  if (!vehicle) {
  return AppError("Vehicle not found",404);
  // return res.status(404).json({ message: "Vehicle not found" });
  }
  // Prevent duplicate vehicleNumber update
  if (
    req.body.vehicleNumber &&
    req.body.vehicleNumber !== vehicle.vehicleNumber
  ) {
    const exists = await Vehicle.findOne({
      vehicleNumber: req.body.vehicleNumber
    });
    if (exists) {
      return res.status(409).json({
        message: "Vehicle number already exists"
      });
    }
  }
  const allowedUpdates = [
    "vehicleNumber",
    "vehicleType",
    "model",
    "manufactureYear",
    "seatingCapacity",
    "fuelType",
    "status"
  ];
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      vehicle[field] = req.body[field];
    }
  });
  await vehicle.save();
  res.status(200).json({
    success: true,
    message: "Vehicle updated successfully",
    data: vehicle
  });
});

/**
 * @desc Get Vendor Vehicles
 */
exports.getVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({
    vendorId: req.user.vendorId,
    isActive: true
  }).sort("-createdAt");

  res.json({ success: true, count: vehicles.length, data: vehicles });
});


/**
 * @desc Get Vehicle by vehicleId
 */
exports.getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOne({
    vehicleId: req.params.vehicleId,
    vendorId: req.user.vendorId
  });

  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found" });
  }

  res.json({ success: true, data: vehicle });
});

/**
 * @desc Update Vehicle Status
 */
exports.updateVehicleStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const vehicle = await Vehicle.findOneAndUpdate(
    { vehicleId: req.params.vehicleId },
    { status },
    { new: true }
  );

  res.json({ success: true, data: vehicle });
});

/**
 * @desc Get Available Vehicles
 */
exports.getAvailableVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({
    vendorId: req.user.vendorId,
    status: "available",
    isActive: true
  });

  res.json({ success: true, data: vehicles });
});