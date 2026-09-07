const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
      default: "",
    },
    profilePic: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
      minlength: [6, "Password must be at least 6 characters"],
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    department: {
      type: String,
      trim: true,
      default: "General",
    },
    rollNumber: {
      type: String,
      trim: true,
      default: "",
    },
    year: {
      type: String,
      trim: true,
      default: "1st Year",
    },
    role: {
      type: String,
      enum: ["User", "Support", "Admin", "Student", "Faculty", "Staff"],
      default: "User",
      set: function (r) {
        if (r === "Student" || r === "Faculty") return "User";
        if (r === "Staff") return "Support";
        return r;
      },
    },
    university: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving to database
userSchema.pre("save", async function () {
  if (!this.password || !this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to verify password during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
