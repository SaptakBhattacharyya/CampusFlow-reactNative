const Issue = require("../../models/Issue");

// @desc    Get support queue tickets with status filter & metrics
// @route   GET /api/support/tickets
// @access  Private (Support & Admin only)
const getSupportTickets = async (req, res) => {
  try {
    const { status, category, priority, search } = req.query;
    const query = {};

    if (status && status !== "All") {
      query.status = { $regex: new RegExp(`^${status.trim()}$`, "i") };
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (priority && priority !== "All") {
      query.priority = priority;
    }

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { "location.address": { $regex: search.trim(), $options: "i" } },
        { reporterName: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const tickets = await Issue.find(query)
      .populate("reportedBy", "fullName email phone department")
      .populate("assignedTo", "fullName email")
      .sort({ createdAt: -1 });

    // Calculate queue metrics
    const allTickets = await Issue.find().select("status");
    const totalCount = allTickets.length;
    const pendingCount = allTickets.filter(
      (t) => (t.status || "").toLowerCase().trim() === "pending"
    ).length;
    const inProgressCount = allTickets.filter((t) => {
      const s = (t.status || "").toLowerCase().trim();
      return s === "in progress" || s === "in_progress";
    }).length;
    const resolvedCount = allTickets.filter(
      (t) => (t.status || "").toLowerCase().trim() === "resolved"
    ).length;

    return res.status(200).json({
      success: true,
      count: tickets.length,
      metrics: {
        total: totalCount,
        pending: pendingCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
      },
      tickets,
    });
  } catch (error) {
    console.error("getSupportTickets error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch support tickets",
    });
  }
};

// @desc    Update ticket status and add resolution remarks
// @route   PATCH /api/support/tickets/:id/status
// @access  Private (Support & Admin only)
const updateTicketStatus = async (req, res) => {
  try {
    const { status, resolutionNotes, priority } = req.body;
    const ticketId = req.params.id;

    const ticket = await Issue.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    if (status) {
      ticket.status = status;
    }
    if (priority) {
      ticket.priority = priority;
    }
    if (resolutionNotes !== undefined) {
      ticket.resolutionNotes = resolutionNotes;
    }

    ticket.statusUpdatedBy = req.user._id;
    ticket.statusUpdatedAt = new Date();

    // If changing to In Progress and not yet assigned, optionally assign to current support staff
    if (status === "In Progress" && !ticket.assignedTo) {
      ticket.assignedTo = req.user._id;
      ticket.assignedToName = req.user.fullName || "Support Staff";
    }

    await ticket.save();

    return res.status(200).json({
      success: true,
      message: `Ticket status updated to '${ticket.status}'`,
      ticket,
    });
  } catch (error) {
    console.error("updateTicketStatus error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update ticket status",
    });
  }
};

// @desc    Assign ticket to support member
// @route   PATCH /api/support/tickets/:id/assign
// @access  Private (Support & Admin only)
const assignTicket = async (req, res) => {
  try {
    const { assignedToId, assignedToName } = req.body;
    const ticketId = req.params.id;

    const ticket = await Issue.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    ticket.assignedTo = assignedToId || req.user._id;
    ticket.assignedToName = assignedToName || req.user.fullName || "Support Member";
    await ticket.save();

    return res.status(200).json({
      success: true,
      message: "Ticket assigned successfully",
      ticket,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to assign ticket",
    });
  }
};

module.exports = {
  getSupportTickets,
  updateTicketStatus,
  assignTicket,
};
