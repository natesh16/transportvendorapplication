const crypto = require("crypto");
const Employee = require("../models/corporate.employeeModel");
const Corporate = require("../models/corporate.Model");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/apperror");
const logger = require("../utils/logger");
const bcrypt = require("bcryptjs");
const {
  generateEmployeeLoginId,
  generateTempPassword,
  generateEmployeeCode
} = require("../utils/credentialUtil");
// controllers/employee.controller.js

exports.createEmployee = asyncHandler(async (req, res) => {
  const log = req.log || logger;

  log.info("Create Employee API called");
  const corporateId = req.user?.corporateId;
const {
    name,
    dateOfBirth,
    email,
    phone,
    department,
    designation,
    employmentType,
    joiningDate,
    location,
    shift
  } = req.body;

  log.debug("Employee input received", {
    email,
    phone,
    department,
    designation
  });
 if (!name?.firstName || !dateOfBirth || !joiningDate) {
    throw new AppError(
      "Name, Date of Birth and Joining Date are required",
      400
    );
  }

  /* 🏢 Corporate */
 
const corporate = await Corporate.findById(corporateId).select("corporateCode").lean();

if (!corporate) {
  throw new AppError("Corporate not found", 404);
}
/* 🔢 Generate Codes */
  const employeeCode = generateEmployeeCode(
     corporate.corporateCode,
    name.firstName
  );

  const loginId = generateEmployeeLoginId(
    corporate.corporateCode,
    name.firstName,
    dateOfBirth
  );

  const tempPassword = generateTempPassword(
    name.firstName,
    dateOfBirth
  );

  log.info("Employee credentials generated", {
    employeeCode,
    loginId
  });

  const hashedPassword = await bcrypt.hash(tempPassword, 12);

  /* 💾 Create Employee */
  const employee = await Employee.create({
    corporateId: req.user.corporateId,
    employeeCode,
    loginId,
    password: hashedPassword,
    passwordChangedAt: new Date(),
    passwordExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    mustChangePassword: true,
    name,
    dateOfBirth,
    email,
    phone,
    department,
    designation,
    employmentType,
    joiningDate,
    location,
    shift,
    createdBy: req.user._id
  });

  log.info("Employee created successfully", {
    employeeId: employee._id
  });

res.status(201).json({
  success: true,
  message: "Employee created successfully",
  data: {
    employeeId: employee._id,
    employeeCode: employee.employeeCode,
    loginId: employee.loginId,
    mustChangePassword: employee.mustChangePassword,
    passwordExpiresAt: employee.passwordExpiresAt
  },
  credentials: {
    tempPassword // ⚠️ send only on create
  }
});
});
