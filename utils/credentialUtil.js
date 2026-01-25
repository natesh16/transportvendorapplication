const crypto = require("crypto");
const bcrypt = require("bcryptjs");

/* ---------------------------------- */
/* 🔑 Generate Employee Login ID (≤12) */
/* ---------------------------------- */
const generateEmployeeLoginId = (
  corporateCode,
  firstName,
  dob
) => {
  if (!corporateCode|| !firstName || !dob) {
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
  return `E${corpPart}${namePart}${yearPart}`;
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

const validateLoginPassword = async (
  inputPassword,
  hashedPassword
) => {
  if (!inputPassword || !hashedPassword) {
    throw new Error("Password validation inputs missing");
  }

  return bcrypt.compare(inputPassword, hashedPassword);
};

module.exports = {
  validateLoginPassword
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

module.exports = {
  generateEmployeeCode,
  generateEmployeeLoginId,
  generateTempPassword,
  validateLoginPassword,validateLoginPassword
};
