const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Helper to generate JWT token
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || "your_jwt_secret_key_here";
  return jwt.sign({ id }, secret, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      department,
      rollNumber,
      year,
      role,
      university,
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide full name, email, and password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Create user
    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone ? phone.trim() : "",
      department: department ? department.trim() : "General",
      rollNumber: rollNumber ? rollNumber.trim() : "",
      year: year ? year.trim() : "1st Year",
      role: role || "User",
      university: university ? university.trim() : "",
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        department: user.department,
        rollNumber: user.rollNumber,
        year: user.year,
        role: user.role,
        university: user.university,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error during registration",
    });
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter both email and password",
      });
    }

    // Check user exists
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Apply declared role if provided
    if (role && ["User", "Support", "Admin"].includes(role)) {
      user.role = role;
      await user.save();
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        department: user.department,
        rollNumber: user.rollNumber,
        year: user.year,
        role: user.role,
        university: user.university,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error during login",
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private (JWT Protected)
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("getMe error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};

// @desc    Google OAuth login or register
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
  try {
    const { email, fullName, googleId, profilePic, role } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required for Google authentication",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    if (user) {
      let modified = false;
      if (!user.googleId && googleId) {
        user.googleId = googleId;
        modified = true;
      }
      if (!user.profilePic && profilePic) {
        user.profilePic = profilePic;
        modified = true;
      }
      if (role && ["User", "Support", "Admin"].includes(role)) {
        user.role = role;
        modified = true;
      }
      if (modified) {
        await user.save();
      }
    } else {
      user = await User.create({
        fullName: (fullName || "Campus User").trim(),
        email: cleanEmail,
        authProvider: "google",
        googleId: googleId || "",
        profilePic: profilePic || "",
        role: role && ["User", "Support", "Admin"].includes(role) ? role : "User",
        department: "",
        rollNumber: "",
        year: "1st Year",
        university: "",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Google authentication successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        department: user.department,
        rollNumber: user.rollNumber,
        year: user.year,
        role: user.role,
        university: user.university,
        profilePic: user.profilePic,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Google Auth error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error during Google authentication",
    });
  }
};

// @desc    Update current logged-in user profile
// @route   PUT /api/auth/profile
// @access  Private (JWT Protected)
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { fullName, phone, department, rollNumber, year, university, profilePic, role } = req.body;

    if (fullName !== undefined && fullName.trim()) user.fullName = fullName.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (department !== undefined) user.department = department.trim();
    if (rollNumber !== undefined) user.rollNumber = rollNumber.trim();
    if (year !== undefined) user.year = year.trim();
    if (university !== undefined) user.university = university.trim();
    if (profilePic !== undefined) user.profilePic = profilePic.trim();
    if (role && ["User", "Support", "Admin", "Student", "Faculty", "Staff"].includes(role)) {
      user.role = role;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        department: user.department,
        rollNumber: user.rollNumber,
        year: user.year,
        role: user.role,
        university: user.university,
        profilePic: user.profilePic,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while updating profile",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  googleAuth,
  updateProfile,
};
