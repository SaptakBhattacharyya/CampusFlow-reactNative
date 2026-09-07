const express = require("express");
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  deleteIssueMaster,
} = require("../../controllers/admin/adminController");
const { protect, authorizeRoles } = require("../../middlewares/authMiddleware");

// All Admin routes require JWT login and Admin role
router.use(protect);
router.use(authorizeRoles("Admin"));

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/role", updateUserRole);
router.delete("/issues/:id", deleteIssueMaster);

module.exports = router;
