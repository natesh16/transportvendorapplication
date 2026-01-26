const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
// const { createCorporate } = require("../controllers/corporate.controller");
const { restrictTo } = require("../middlewares/rbac");

const {
  createSuperAdmin,
  loginSuperAdmin,
  // getAllSuperAdmins,
  // getSuperAdmins,
  // getSuperAdminById,
  // updateSuperAdmin,
  // deleteSuperAdmin
} = require("../controllers/superAdmin.controller");
router.route("/create/superadmin")
  .post(createSuperAdmin)

// router.route("/Admin&details/superadmin").get(protect,restrictTo("SUPER_ADMIN"),getAllSuperAdmins);
router.route("/login/superadmin").post(loginSuperAdmin);

// router.get(
//   "/Admin&details/superadmin",
//   protect,
//   restrictTo("SUPER_ADMIN"),
//   getAllSuperAdmins
// );

// router.route("/:id")
//   .get(getSuperAdminById)
//   .put(updateSuperAdmin)
//   .delete(deleteSuperAdmin);

module.exports = router;
