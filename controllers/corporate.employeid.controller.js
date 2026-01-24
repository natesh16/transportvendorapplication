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
exports.createEmployee = asyncHandler(async (req, res) => {
  /* 🔐 Role Guard */
  if (
    !req.user ||
    !["CORPORATE_ADMIN", "CORPORATE_SUPERVISOR"].includes(
      req.user.role
    )
  ) {
    throw new AppError("Unauthorized", 403);
  }
  const { corporateId, id: createdBy } = req.user;
  const {
    name,
    email,
    phone,
    department,
    designation,
    employmentType,
    joiningDate,
    gender,
    dateOfBirth
  } = req.body;
  if (!name?.firstName || !dateOfBirth || !joiningDate) {
    throw new AppError(
      "Name, Date of Birth and Joining Date are required",
      400
    );
  }
  /* 🏢 Corporate */
  const corporate = await Corporate.findById(corporateId).select(
    "corporateCode"
  );
  if (!corporate) {
    throw new AppError("Corporate not found", 404);
  }
  /* 🔑 Generate Credentials */
  const loginId = generateEmployeeLoginId(
    corporate.corporateCode,
    name.firstName,
    dateOfBirth
  );
  const tempPassword = generateTempPassword(
    name.firstName,
    dateOfBirth
  );
  const hashedPassword = await bcrypt.hash(tempPassword, 12);
  /* 🆔 Employee Code */
  const employeeCode = generateEmployeeCode(
    corporate.corporateCode,
    name.firstName
  );
  /* 💾 Save */
  const employee = await Employee.create({
    corporateId,
    employeeCode,
    loginId,
    password: hashedPassword,
    mustChangePassword: true,
    name,
    email,
    phone,
    department,
    designation,
    employmentType,
    joiningDate,
    gender,
    dateOfBirth,
    createdBy
  });
  /* ✅ Response */
  res.status(201).json({
    success: true,
    message: "Employee created successfully",
    data: {
      employeeCode: employee.employeeCode,
      loginId: employee.loginId,
      tempPassword // 🔐 show only once
    }
  });
});

