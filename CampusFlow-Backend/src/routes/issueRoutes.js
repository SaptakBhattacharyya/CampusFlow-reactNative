const express = require("express");
const {
  createIssue,
  getMyIssues,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
} = require("../controllers/issueController");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

// Public / General routes
router.get("/", getAllIssues);
router.get("/my", protect, getMyIssues);
router.get("/:id", getIssueById);

// Protected routes
router.post("/", protect, createIssue);

// Support & Admin status updates
router.patch("/:id", protect, authorizeRoles("Support", "Admin"), updateIssue);

// Admin-only deletion
router.delete("/:id", protect, authorizeRoles("Admin"), deleteIssue);

module.exports = router;