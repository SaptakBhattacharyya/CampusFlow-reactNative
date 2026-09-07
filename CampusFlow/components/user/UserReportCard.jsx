import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const getStatusTheme = (status) => {
  const s = (status || "Pending").toLowerCase().replace(/_/g, " ").trim();
  if (s === "resolved") {
    return { bg: "#EBF9F5", col: "#1D7A78", border: "#BFEADB", icon: "checkmark-circle" };
  }
  if (s === "in progress") {
    return { bg: "#EAF3F6", col: "#123C4A", border: "#C8DDE3", icon: "sync" };
  }
  return { bg: "#FFF7ED", col: "#EA580C", border: "#FED7AA", icon: "hourglass" };
};

const getPriorityTheme = (priority) => {
  const p = (priority || "Medium").toLowerCase();
  if (p === "high") return { bg: "#FEF2F2", col: "#D94848" };
  if (p === "low") return { bg: "#EBF9F5", col: "#1D7A78" };
  return { bg: "#FFF7ED", col: "#D97706" };
};

export const UserReportCard = ({ report, onPress }) => {
  const statusTheme = getStatusTheme(report.status);
  const priorityTheme = getPriorityTheme(report.priority);

  const locationText =
    typeof report.location === "object" && report.location !== null
      ? report.location.address || "Campus"
      : report.location || "Campus";

  const formattedDate = report.createdAt
    ? new Date(report.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Recently";

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => onPress && onPress(report)}
    >
      {/* Top Header */}
      <View style={styles.topRow}>
        <View style={styles.categoryBadge}>
          <Ionicons name="pricetag-outline" size={12} color="#527986" />
          <Text style={styles.categoryText}>{report.category || "General"}</Text>
        </View>

        <View style={styles.badges}>
          <View style={[styles.pill, { backgroundColor: priorityTheme.bg }]}>
            <Text style={[styles.pillText, { color: priorityTheme.col }]}>
              {report.priority || "Medium"}
            </Text>
          </View>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: statusTheme.bg, borderColor: statusTheme.border },
            ]}
          >
            <Ionicons name={statusTheme.icon} size={11} color={statusTheme.col} />
            <Text style={[styles.statusText, { color: statusTheme.col }]}>
              {report.status || "Pending"}
            </Text>
          </View>
        </View>
      </View>

      {/* Main Title & Image */}
      <View style={styles.contentRow}>
        {report.image ? (
          <Image source={{ uri: report.image }} style={styles.thumbnail} />
        ) : null}
        <View style={styles.flex1}>
          <Text style={styles.title} numberOfLines={2}>
            {report.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {report.description}
          </Text>
        </View>
      </View>

      {/* Location & Time */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="location-outline" size={13} color="#527986" />
          <Text style={styles.metaText} numberOfLines={1}>
            {locationText}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={13} color="#527986" />
          <Text style={styles.metaText}>{formattedDate}</Text>
        </View>
      </View>

      {/* Resolution Notes preview if any */}
      {report.resolutionNotes ? (
        <View style={styles.resolutionBox}>
          <Ionicons name="information-circle" size={14} color="#1D7A78" />
          <Text style={styles.resolutionText} numberOfLines={2}>
            <Text style={{ fontWeight: "700" }}>Support update: </Text>
            {report.resolutionNotes}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#DCE8E5",
    shadowColor: "#123C4A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F4F8F7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCE8E5",
  },
  categoryText: {
    fontSize: 11,
    color: "#527986",
    fontWeight: "600",
  },
  badges: {
    flexDirection: "row",
    gap: 6,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  contentRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#F4F8F7",
  },
  flex1: { flex: 1 },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#102A35",
    marginBottom: 3,
  },
  description: {
    fontSize: 12,
    color: "#527986",
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F5F4",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: "#527986",
  },
  resolutionBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: "#E8F5F4",
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#C6E8E2",
  },
  resolutionText: {
    fontSize: 11,
    color: "#123C4A",
    flex: 1,
    lineHeight: 15,
  },
});
