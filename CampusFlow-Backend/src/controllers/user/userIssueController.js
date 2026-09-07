const Issue = require("../../models/Issue");

// @desc    Report a new issue (General User)
// @route   POST /api/user/issues or POST /api/issues
// @access  Private (JWT Protected)
const reportIssue = async (req, res) => {
  try {
    const { title, description, category, priority, location, image } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and category are required",
      });
    }

    const newIssueData = {
      title,
      description,
      category,
      priority: priority || "Medium",
      location: location || {},
      image: image || "",
      status: "Pending",
    };

    // If user is authenticated, attach reporter details
    if (req.user) {
      newIssueData.reportedBy = req.user._id;
      newIssueData.reporterName = req.user.fullName || "";
      newIssueData.reporterEmail = req.user.email || "";
      newIssueData.reporterPhone = req.user.phone || "";
    }

    const issue = await Issue.create(newIssueData);

    return res.status(201).json({
      success: true,
      message: "Issue reported successfully",
      issue,
    });
  } catch (error) {
    console.error("Error reporting issue:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit issue",
    });
  }
};

// @desc    Get current user's submitted issues (My Reports)
// @route   GET /api/user/issues/my
// @access  Private (JWT Protected)
const getMyReports = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Match by user ObjectId or email
    const issues = await Issue.find({
      $or: [
        { reportedBy: req.user._id },
        { reporterEmail: req.user.email?.toLowerCase().trim() },
      ],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    console.error("Error fetching my reports:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch your reports",
    });
  }
};

// @desc    Get all campus issues (Public / General User Feed)
// @route   GET /api/user/issues
// @access  Public
const getAllCampusIssues = async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    console.error("Error fetching issues:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch issues",
    });
  }
};

// @desc    Get single issue details
// @route   GET /api/user/issues/:id
// @access  Public
const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate("reportedBy", "fullName email phone department")
      .populate("assignedTo", "fullName email");

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    return res.status(200).json({
      success: true,
      issue,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve issue",
    });
  }
};

module.exports = {
  reportIssue,
  getMyReports,
  getAllCampusIssues,
  getIssueById,
};
