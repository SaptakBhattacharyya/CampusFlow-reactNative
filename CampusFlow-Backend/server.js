const express = require("express");
const cors = require("cors");
const issueRoutes = require("./src/routes/issueRoutes");
const authRoutes = require("./src/routes/authRoutes");
const userIssueRoutes = require("./src/routes/user/userIssueRoutes");
const supportRoutes = require("./src/routes/support/supportRoutes");
const adminRoutes = require("./src/routes/admin/adminRoutes");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db.js");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Universal / Backwards-compatible routes
app.use("/api/issues", issueRoutes);
app.use("/api/auth", authRoutes);

// Role-based routes with dedicated namespaces
app.use("/api/user/issues", userIssueRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/admin", adminRoutes);

connectDB();

app.get("/", (req, res) => {
  res.json({
    message: "CampusFlow Backend is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});