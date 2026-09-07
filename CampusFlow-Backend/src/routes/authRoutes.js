const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  googleAuth,
  updateProfile,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

// Public endpoints
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);

// Protected endpoints
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

module.exports = router;
