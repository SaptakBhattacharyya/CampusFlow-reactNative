const express = require("express");
const router = express.Router();
const {
  reportIssue,
  getMyReports,
  getAllCampusIssues,
  getIssueById,
} = require("../../controllers/user/userIssueController");
const { protect } = require("../../middlewares/authMiddleware");

// Protected route to fetch personal submitted reports
router.get("/my", protect, getMyReports);

// Public route to view all campus issues
router.get("/", getAllCampusIssues);

// Public route to view single issue
router.get("/:id", getIssueById);

// Protected/authenticated route to report a new issue
router.post("/", protect, reportIssue);

module.exports = router;
