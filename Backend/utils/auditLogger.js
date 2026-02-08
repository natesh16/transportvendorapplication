const fs = require("fs");
const path = require("path");

const auditLogPath = path.join("logs", "audit.log");

exports.auditLog = ({ action, entity, entityId, performedBy, meta }) => {
  const log = {
    timestamp: new Date().toISOString(),
    action,
    entity,
    entityId,
    performedBy,
    meta
  };

  fs.appendFileSync(auditLogPath, JSON.stringify(log) + "\n");
};
