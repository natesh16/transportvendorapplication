const crypto = require("crypto");

/* ---------------------------------- */
/* 🔑 Generate Employee Login ID        */
/* ---------------------------------- */
exports.generateEmployeeLoginId = (
  corporateCode,
  firstName,
  dob
) => {
  const namePart = firstName
    .replace(/\s+/g, "")
    .toUpperCase()
    .substring(0, 6);

  const year = new Date(dob)
    .getFullYear()
    .toString()
    .slice(-2);

  return `EMP-${corporateCode}-${namePart}${year}`;
};

/* ---------------------------------- */
/* 🔐 Generate Temporary Password      */
/* ---------------------------------- */
exports.generateTempPassword = (
  firstName,
  dob
) => {
  const cleanName = firstName
    .replace(/\s+/g, "")
    .toLowerCase()
    .substring(0, 4);

  const date = new Date(dob);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");

  return `${cleanName}${dd}${mm}@A1`;
};

const generateEmployeeCode = (
  corporateCode,
  firstName,
  lastName = ""
) => {
  if (!corporateCode || !firstName) {
    throw new Error("Corporate code and first name are required");
  }

  /* 🧹 Normalize Name */
  const namePart = `${firstName}${lastName}`
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .substring(0, 6);

  /* 🔐 Random Suffix (collision-safe) */
  const randomPart = crypto
    .randomBytes(2)
    .toString("hex")
    .toUpperCase();

  return `EMP-${corporateCode}-${namePart}-${randomPart}`;
};

module.exports = {
  generateEmployeeCode
};