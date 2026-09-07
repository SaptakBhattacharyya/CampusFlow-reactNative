const Issue = require("../models/Issue");

const createIssue = async (req, res) => {
  try {
    const issueData = { ...req.body };

    // Attach reporter details if authenticated
    if (req.user) {
      issueData.reportedBy = req.user._id;
      issueData.reporterName = req.user.fullName || "";
      issueData.reporterEmail = req.user.email || "";
      issueData.reporterPhone = req.user.phone || "";
    }

    const issue = await Issue.create(issueData);

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      issue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyIssues = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const issues = await Issue.find({
      $or: [
        { reportedBy: req.user._id },
        { reporterEmail: req.user.email?.toLowerCase().trim() },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    res.status(200).json({
      success: true,
      issue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateIssue = async (req, res) => {
  try {
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      issue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  createIssue,
  getMyIssues,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
};