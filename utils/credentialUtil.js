const crypto = require("crypto");
const bcrypt = require("bcryptjs");
/**
 * 🔐 Generate Corporate Login ID
 * Format:
 * CORP-<LAST6_CORPORATE_ID>-<ROLE_CODE>-<SEQUENCE>
 *
 * Example:
 * CORP-E8DD99-ADMIN-001
 */
const generateCorporateLoginId = ({
  corporateId,
  role,
  sequence
}) => {
  /* ---------------- Validation Guards ---------------- */
  if (!corporateId) {
    throw new Error("corporateId is required");
  }
  if (
    !role ||
    !["CORPORATE_ADMIN", "CORPORATE_SUPERVISOR"].includes(role)
  ) {
    throw new Error(
      "role must be CORPORATE_ADMIN or CORPORATE_SUPERVISOR"
    );
  }
  if (
    sequence === undefined ||
    sequence === null ||
    Number.isNaN(Number(sequence))
  ) {
    throw new Error("sequence must be a valid number");
  }
  /* ---------------- Role Mapping ---------------- */
  const roleCode =
    role === "CORPORATE_ADMIN"
      ? "ADMIN"
      : "SUP";
  /* ---------------- Formatting ---------------- */
  const corpSuffix = corporateId
    .toString()
    .slice(-6)
    .toUpperCase();
  const seq = Number(sequence)
    .toString()
    .padStart(3, "0");
  /* ---------------- Result ---------------- */
  return `${corpSuffix}-${roleCode}-${seq}`;
};
/* ---------------------------------- */
/* 🔑 Generate Employee Login ID (≤12) */
/* ---------------------------------- */
const generateEmployeeLoginId = (
  corporateCode,
  firstName,
  dob
) => {
  if (!corporateCode || !firstName || !dob) {
    throw new Error("corporateCode, firstName, and dob are required");
  }
  /* 🏢 Corporate Part (max 3) */
  const corpPart = String(corporateCode)
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .substring(0, 3);
  /* 👤 Name Part (max 5) */
  const namePart = String(firstName)
    .replace(/\s+/g, "")
    .toUpperCase()
    .substring(0, 5);
  /* 📅 DOB Year (2 digits) */
  const date = new Date(dob);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid DOB");
  }
  const yearPart = date
    .getFullYear()
    .toString()
    .slice(-2);
  /* 🔐 Final Login ID (≤ 12 chars) */
  return `${corpPart}${namePart}${yearPart}`;
};
/* ---------------------------------- */
/* 🔐 Generate Temporary Password      */
/* ---------------------------------- */
const generateTempPassword = (firstName, dob) => {
  if (!firstName || !dob) {
    throw new Error("firstName and dob are required");
  }
  const cleanName = String(firstName)
    .replace(/\s+/g, "")
    .toLowerCase()
    .substring(0, 4);
  const date = new Date(dob);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid DOB");
  }
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${cleanName}${dd}${mm}@A1`;
};
/* ---------------------------------- */
/* 🆔 Generate Employee Code           */
/* ---------------------------------- */
const generateEmployeeCode = (
  corporateCode,
  firstName,
  lastName = ""
) => {
  if (!corporateCode || !firstName) {
    throw new Error("Corporate code and first name are required");
  }
  const namePart = `${firstName}${lastName}`
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .substring(0, 6);
  const randomPart = crypto
    .randomBytes(2)
    .toString("hex")
    .toUpperCase();
  return `EMP-${corporateCode}-${namePart}-${randomPart}`;
};
/* ---------------------------------- */
/* 🔐 Validate Password for Login      */
/* ---------------------------------- */
const validateLoginPassword = async (
  candidatePassword,
  hashedPassword
) => {
  if (!candidatePassword || !hashedPassword) {
    throw new Error("Password validation inputs are required");
  }
  return bcrypt.compare(candidatePassword, hashedPassword);
};
const handleFailedLogin = async (
  employee,
  {
    maxAttempts = 5,
    lockMinutes = 30
  } = {}
) => {
  employee.loginAttempts = (employee.loginAttempts || 0) + 1;

  if (employee.loginAttempts >= maxAttempts) {
    employee.lockUntil = Date.now() + lockMinutes * 60 * 1000;
  }

  await employee.save();
};

module.exports = {
  generateEmployeeCode,
  generateEmployeeLoginId,
  generateTempPassword,
  validateLoginPassword,
  handleFailedLogin,
  generateCorporateLoginId
};
