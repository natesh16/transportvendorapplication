const mongoose = require("mongoose");
exports.validateCreateVehicle = (req, res, next) => {
  const {
    vendorId,
    vehicleNumber,
    vehicleType,
    fuelType,
    manufactureYear,
    seatingCapacity
  } = req.body;
//   if (!vendorId || !mongoose.Types.ObjectId.isValid(vendorId)) {
//     return res.status(400).json({ message: "Valid vendorId is required" });
//   }
  if (!vehicleNumber) {
    return res.status(400).json({ message: "Vehicle number is required" });
  }
  const allowedVehicleTypes = ["Sedan", "SUV", "Tempo", "Bus", "Others"];
  if (vehicleType && !allowedVehicleTypes.includes(vehicleType)) {
    return res.status(400).json({ message: "Invalid vehicle type" });
  }
  const allowedFuelTypes = ["Petrol", "Diesel", "CNG", "EV"];
  if (fuelType && !allowedFuelTypes.includes(fuelType)) {
    return res.status(400).json({ message: "Invalid fuel type" });
  }
  if (manufactureYear && manufactureYear > new Date().getFullYear()) {
    return res.status(400).json({ message: "Invalid manufacture year" });
  }
  if (seatingCapacity && seatingCapacity <= 0) {
    return res.status(400).json({ message: "Invalid seating capacity" });
  }
  next();
};
