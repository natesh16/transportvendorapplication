module.exports.generateCorporateLoginId = ({
  corporateId,
  role,
  sequence
}) => {
  const roleCode =
    role === "CORPORATE_ADMIN" ? "ADMIN" : "SUP";

  return `CORP-${corporateId
    .toString()
    .slice(-6)
    .toUpperCase()}-${roleCode}-${sequence
    .toString()
    .padStart(3, "0")}`;
};