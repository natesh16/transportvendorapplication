const express = require("express");
const router = express.Router();
const upload = require("../utils/excelUpload");
const {
  bulkUploadEmployees
} = require("../controllers/employeeBulkUpload.controller");
router.post(
  "/bulk-upload",
  upload.single("file"),
  bulkUploadEmployees
);

module.exports = router;