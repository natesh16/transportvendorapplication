const express = require("express");
const { protect } = require("../middlewares/auth");
const { createCorporate } = require("../controllers/corporate.controller");
const {
  createSuperAdmin,
  getSuperAdmins,
  getSuperAdminById,
  updateSuperAdmin,
  deleteSuperAdmin
} = require("../controllers/superAdmin.controller");
const router = express.Router();
router.route("/create/superadmin")
  .post(createSuperAdmin)
  .get(getSuperAdmins);

router.route("/create/corporateID")
  .post(protect,createCorporate)
  // .get(getSuperAdmins);
  

router.route("/:id")
  .get(getSuperAdminById)
  .put(updateSuperAdmin)
  .delete(deleteSuperAdmin);

module.exports = router;
