const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token from Bearer <token>
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const secret = process.env.JWT_SECRET || "your_jwt_secret_key_here";
      const decoded = jwt.verify(token, secret);

      // Find user by decoded ID, excluding password field
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User associated with this token no longer exists",
        });
      }

      return next();
    } catch (error) {
      console.error("JWT Verification error:", error.message);
      return res.status(401).json({
        success: false,
        message: "Not authorized, invalid or expired token",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    });
  }
};

/**
 * Role-based authorization middleware
 * Usage: authorizeRoles("Admin") or authorizeRoles("Support", "Admin")
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required before checking roles",
      });
    }

    // Normalize user role
    let currentRole = req.user.role || "User";
    if (currentRole === "Student" || currentRole === "Faculty") currentRole = "User";
    if (currentRole === "Staff") currentRole = "Support";

    // Admin has universal superuser access
    if (currentRole === "Admin") {
      return next();
    }

    // Check if role is in allowed roles
    if (roles.includes(currentRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Role '${currentRole}' is not authorized to access this resource.`,
    });
  };
};

module.exports = { protect, authorizeRoles };
