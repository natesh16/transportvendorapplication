exports.validateVehicleUpdate = (req, res, next) => {
  const { vehicleId } = req.params;
  const {
    vehicleType,
    fuelType,
    manufactureYear,
    seatingCapacity,
    status
  } = req.body;

  if (!vehicleId) {
    return res.status(400).json({ message: "vehicleId is required in params" });
  }

  const vehicleTypes = ["Sedan", "SUV", "Tempo", "Bus", "Others"];
  if (vehicleType && !vehicleTypes.includes(vehicleType)) {
    return res.status(400).json({ message: "Invalid vehicle type" });
  }

  const fuelTypes = ["Petrol", "Diesel", "CNG", "EV"];
  if (fuelType && !fuelTypes.includes(fuelType)) {
    return res.status(400).json({ message: "Invalid fuel type" });
  }

  const statuses = ["available", "assigned", "maintenance"];
  if (status && !statuses.includes(status)) {
    return res.status(400).json({ message: "Invalid vehicle status" });
  }

  if (manufactureYear && manufactureYear > new Date().getFullYear()) {
    return res.status(400).json({ message: "Invalid manufacture year" });
  }

  if (seatingCapacity && seatingCapacity <= 0) {
    return res.status(400).json({ message: "Invalid seating capacity" });
  }

  next();
};
