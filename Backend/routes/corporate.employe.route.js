const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const { bulkUploadEmployees } = require("../controllers/employeeBulkUpload.controller");
const { uploadExcel } = require("../middlewares/uploadMiddleware");
const protect = require("../middlewares/auth");
const  corporateprotect  = require("../middlewares/auth");
const { allowRoles }  = require("../middlewares/rbac");
// const { restrictTo } = require("../middewares/rbac");

const {
  createEmployee,
  employeeLogin,
  changePassword

} = require("../controllers/corporate.employeid.controller");

router.post(
  "/create/employees",
  corporateprotect,
  allowRoles("CORPORATE_ADMIN", "CORPORATE_SUPERVISOR"),
  createEmployee
);
// router.post('/employe/login'),employeeLogin
router.route("/login").post(employeeLogin)
router.post(
  "/bulk-upload",
  protect,
  allowRoles("CORPORATE_ADMIN", "CORPORATE_SUPERVISOR"),
  uploadExcel.single("file"),
  bulkUploadEmployees
);
/*==================EMPLOYE PASSWORD =============*/
/**
 * @route   PATCH /api/employees/change-password
 * @desc    Change employee password
 * @access  Private (Employee)
 */
router.patch(
  "/change-password",
  protect,
  allowRoles(
    "EMPLOYEE",
    "CORPORATE_ADMIN",
    "CORPORATE_SUPERVISOR"
  ),
  changePassword
);


/*==================BULK EMPLOYEE PUSH=============*/
router.post(
  "/bulk-upload",
  corporateprotect,
  allowRoles("CORPORATE_ADMIN", "CORPORATE_SUPERVISOR"),
  uploadExcel.single("file"),
  bulkUploadEmployees
);
router.get(
  "/bulk-upload/status/:jobId",
  corporateprotect,
  asyncHandler(async (req, res) => {
    const job = await BulkUploadJob.findById(req.params.jobId);
    res.json({ success: true, data: job });
  })
);

module.exports = router;
