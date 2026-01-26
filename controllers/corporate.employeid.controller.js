const crypto = require("crypto");
const Employee = require("../models/corporate.employeeModel");
const Corporate = require("../models/corporate.Model");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/apperror");
const logger = require("../utils/logger");
const { getClientIp , getDeviceInfo }=require('../utils/getClientIp')
const bcrypt = require("bcryptjs");
const {
  generateEmployeeLoginId,
  generateTempPassword,
  generateEmployeeCode,validateLoginPassword
} = require("../utils/credentialUtil");
// controllers/employee.controller.js

/*=============CREATE EMPLOYEE==================*/
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

/*=============lOGIN EMPLOYEE==================*/
exports.employeeLogin = async (req, res) => {
  const { loginId, password } = req.body;
  /* ---------------------------------- */
  /* 🔍 Fetch Employee                  */
  /* ---------------------------------- */
  const employee = await Employee.findOne({ loginId })
    .select("+password +loginAttempts +lockUntil");

  if (!employee) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  }
  /* ---------------------------------- */
  /* 🔒 Account Lock Check              */
  /* ---------------------------------- */
  if (employee.isAccountLocked()) {
    return res.status(423).json({
      success: false,
      message: "Account is locked. Try again later."
    });
  }
  /* ---------------------------------- */
  /* 🔐 Password Validation             */
  /* ---------------------------------- */
  const isPasswordValid = await validateLoginPassword(
    password,
    employee.password
  );

  /* ---------------------------------- */
  /* 🌐 Client Info                     */
  /* ---------------------------------- */
  const ipAddress = getClientIp(req);
  const deviceInfo = getDeviceInfo(req);

  /* ---------------------------------- */
  /* ❌ Failed Login                    */
  /* ---------------------------------- */
  if (!isPasswordValid) {
    await handleFailedLogin(employee);
    employee.loginAudit.push({
      ipAddress,
      device: deviceInfo,
      success: false,
      attemptedAt: new Date()
    });
    await employee.save();
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
      ipAddress
    });
  }
  /* ---------------------------------- */
  /* ✅ Successful Login                */
  /* ---------------------------------- */
  employee.loginAttempts = 0;
  employee.lockUntil = undefined;
  employee.lastLoginAt = new Date();

  employee.loginAudit.push({
    ipAddress,
    device: deviceInfo,
    success: true,
    attemptedAt: new Date()
  });

  await employee.save();

  /* ---------------------------------- */
  /* 🔁 Force Password Change (Optional)*/
  /* ---------------------------------- */
  if (employee.mustChangePassword) {
    return res.status(200).json({
      success: true,
      mustChangePassword: true,
      employeeId: employee._id,
      ipAddress,
      device: deviceInfo
    });
  }

  /* ---------------------------------- */
  /* 🎉 Final Response                  */
  /* ---------------------------------- */
  res.status(200).json({
    success: true,
    employeeId: employee._id,
    lastLoginAt: employee.lastLoginAt,
    ipAddress,
    device: deviceInfo
  });
};

/*=============CHANGE EMPLOYEE PASSWORD==================*/

/**
 * @route   PATCH /api/employees/change-password
 * @desc    Change employee password
 * @access  Private (Employee)
 */

exports.changePassword  = asyncHandler(async (req, res) => {
  const log = req.log || logger;
  const { currentPassword, newPassword, confirmPassword } = req.body;
  /* ---------------- Validation ---------------- */
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new AppError(
      "Current password, new password and confirm password are required",
      400
    );
  }
  if (newPassword !== confirmPassword) {
    throw new AppError("New password and confirm password do not match", 400);
  }
  /* ---------------- Fetch Employee ---------------- */
  const employee = await Employee.findById(req.user.id).select("+password");
  if (!employee) {
    throw new AppError("Employee not found", 404);
  }
  /* ---------------- Verify Current Password ---------------- */
  const isMatch = await bcrypt.compare(
    currentPassword,
    employee.password
  );
  if (!isMatch) {
    log.warn("Invalid current password attempt", {
      employeeId: req.user.id
    });
    throw new AppError("Current password is incorrect", 401);
  }
  /* ---------------- Prevent Same Password ---------------- */
  const isSamePassword = await bcrypt.compare(
    newPassword,
    employee.password
  );
  if (isSamePassword) {
    throw new AppError(
      "New password must be different from current password",
      400
    );
  }
  /* ---------------- Update Password ---------------- */
  employee.password = await bcrypt.hash(newPassword, 12);
  employee.passwordChangedAt = new Date();
  employee.passwordExpiresAt = new Date(
    Date.now() + 90 * 24 * 60 * 60 * 1000 // 90 days
  );
  employee.mustChangePassword = false;
  await employee.save();
  log.info("Password changed successfully", {
    employeeId: employee._id
  });
  /* ---------------- Response ---------------- */
  res.status(200).json({
    success: true,
    message: "Password updated successfully"
  });
});

