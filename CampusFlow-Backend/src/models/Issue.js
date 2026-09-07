const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },

    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },

    image: {
      type: String,
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reporterName: {
      type: String,
      default: "",
    },
    reporterEmail: {
      type: String,
      default: "",
    },
    reporterPhone: {
      type: String,
      default: "",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedToName: {
      type: String,
      default: "",
    },

    resolutionNotes: {
      type: String,
      default: "",
    },
    statusUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    statusUpdatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Issue", issueSchema);