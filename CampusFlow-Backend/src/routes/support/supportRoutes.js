const express = require("express");
const router = express.Router();
const {
  getSupportTickets,
  updateTicketStatus,
  assignTicket,
} = require("../../controllers/support/supportController");
const { protect, authorizeRoles } = require("../../middlewares/authMiddleware");

// All support routes require JWT login and Support or Admin role
router.use(protect);
router.use(authorizeRoles("Support", "Admin"));

router.get("/tickets", getSupportTickets);
router.patch("/tickets/:id/status", updateTicketStatus);
router.patch("/tickets/:id/assign", assignTicket);

module.exports = router;
