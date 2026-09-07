const User = require("../../models/User");
const Issue = require("../../models/Issue");

// @desc    Get overall platform statistics (KPIs & Metrics)
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const generalUsersCount = await User.countDocuments({
      role: { $in: ["User", "Student", "Faculty"] },
    });
    const supportTeamCount = await User.countDocuments({
      role: { $in: ["Support", "Staff"] },
    });
    const adminCount = await User.countDocuments({ role: "Admin" });

    const totalIssues = await Issue.countDocuments();
    const pendingIssues = await Issue.countDocuments({
      status: { $in: ["Pending", "pending"] },
    });
    const inProgressIssues = await Issue.countDocuments({
      status: { $in: ["In Progress", "in progress", "in_progress"] },
    });
    const resolvedIssues = await Issue.countDocuments({
      status: { $in: ["Resolved", "resolved"] },
    });

    const resolutionRate =
      totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

    // Recent 5 issues for audit log
    const recentIssues = await Issue.find()
      .select("title category status priority createdAt reporterName")
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          generalUsers: generalUsersCount,
          supportTeam: supportTeamCount,
          admins: adminCount,
        },
        issues: {
          total: totalIssues,
          pending: pendingIssues,
          inProgress: inProgressIssues,
          resolved: resolvedIssues,
          resolutionRate: `${resolutionRate}%`,
        },
        recentIssues,
      },
    });
  } catch (error) {
    console.error("getAdminStats error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch platform statistics",
    });
  }
};

// @desc    Get all users list with search & role filter
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    const query = {};

    if (role && role !== "All") {
      if (role === "User") {
        query.role = { $in: ["User", "Student", "Faculty"] };
      } else if (role === "Support") {
        query.role = { $in: ["Support", "Staff"] };
      } else {
        query.role = role;
      }
    }

    if (search && search.trim()) {
      query.$or = [
        { fullName: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
        { department: { $regex: search.trim(), $options: "i" } },
        { rollNumber: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    // Map each user and normalize role presentation
    const normalizedUsers = users.map((u) => {
      let roleLabel = u.role || "User";
      if (roleLabel === "Student" || roleLabel === "Faculty") roleLabel = "User";
      if (roleLabel === "Staff") roleLabel = "Support";
      return {
        _id: u._id,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        department: u.department,
        rollNumber: u.rollNumber,
        year: u.year,
        role: roleLabel,
        university: u.university,
        authProvider: u.authProvider,
        createdAt: u.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      count: normalizedUsers.length,
      users: normalizedUsers,
    });
  } catch (error) {
    console.error("getAllUsers error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch users",
    });
  }
};

// @desc    Update a user's role (Promote/Demote)
// @route   PATCH /api/admin/users/:id/role
// @access  Private (Admin only)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const targetUserId = req.params.id;

    const allowedRoles = ["User", "Support", "Admin"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role '${role}'. Allowed roles: ${allowedRoles.join(", ")}`,
      });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User '${user.fullName}' role updated to '${role}' successfully`,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("updateUserRole error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update user role",
    });
  }
};

// @desc    Master delete issue (Admin exclusive)
// @route   DELETE /api/admin/issues/:id
// @access  Private (Admin only)
const deleteIssueMaster = async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Issue permanently deleted by Administrator",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete issue",
    });
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  deleteIssueMaster,
};
