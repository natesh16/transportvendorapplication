const crypto = require("crypto");
const Employee = require("../models/corporate.employeeModel");
const Corporate = require("../models/corporate.Model");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/apperror");
const logger = require("../utils/logger");

/* ---------------------------------- */
/* 🔐 Helpers                          */
/* ---------------------------------- */
const generateEmployeeCode = (corporateCode, firstName, lastName = "") => {
  const namePart = (firstName + lastName)
    .replace(/\s+/g, "")
    .toUpperCase()
    .substring(0, 12);

  const random = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `EMP-${corporateCode}-${namePart}-${random}`;
};

/* ---------------------------------- */
/* 👤 Create Employee                  */
/* ---------------------------------- */
exports.createEmployee = asyncHandler(async (req, res) => {
  const log = req.log || logger;

  log.info("Create Employee API called");

  /* 🔐 Role Guard */
  if (
    !req.user ||
    !["CORPORATE_ADMIN", "CORPORATE_SUPERVISOR"].includes(req.user.role)
  ) {
    log.warn("Unauthorized role attempting to create employee", {
      role: req.user?.role
    });
    throw new AppError(
      "Only Corporate Admin or Supervisor can create employees",
      403
    );
  }

  const {
    name,
    email,
    phone,
    department,
    designation,
    employmentType,
    joiningDate,
    gender
  } = req.body;

  log.debug("Employee input received", {
    email,
    phone,
    department,
    designation
  });

  if (!name?.firstName || !employmentType || !joiningDate) {
    log.warn("Missing required employee fields", { body: req.body });
    throw new AppError("Required employee fields are missing", 400);
  }

  /* 🏢 Get Corporate */
  const corporate = await Corporate.findById(req.user.corporateId);
  if (!corporate) {
    log.error("Corporate not found", {
      corporateId: req.user.corporateId
    });
    throw new AppError("Corporate not found", 404);
  }

  log.debug("Corporate validated", {
    corporateId: corporate._id,
    corporateCode: corporate.corporateCode
  });

  /* 🆔 Generate Employee Code */
  const employeeCode = generateEmployeeCode(
    corporate.corporateCode,
    name.firstName,
    name.lastName
  );

  log.debug("Generated employee code", { employeeCode });

  /* 🚫 Duplicate Protection */
  const exists = await Employee.findOne({
    corporateId: corporate._id,
    $or: [{ email }, { phone }],
    isDeleted: false
  });

  if (exists) {
    log.warn("Duplicate employee detected", {
      email,
      phone,
      employeeId: exists._id
    });
    throw new AppError(
      "Employee with same email or phone already exists",
      409
    );
  }

  /* ✅ Create Employee */
  const employee = await Employee.create({
    corporateId: corporate._id,
    employeeCode,
    name,
    email,
    phone,
    gender,
    department,
    designation,
    employmentType,
    joiningDate,
    createdBy: req.user._id
  });

  log.info("Employee created successfully", {
    employeeId: employee._id,
    employeeCode: employee.employeeCode
  });

  res.status(201).json({
    success: true,
    message: "Employee created successfully",
    data: {
      id: employee._id,
      employeeCode: employee.employeeCode,
      name: employee.name,
      department: employee.department,
      designation: employee.designation
    }
  });
});
