import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Image,
  TouchableOpacity,
  Platform,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, DrawerActions, useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { getAllIssues } from "../../services/api";

const normalizeStatus = (status) => {
  if (!status) return "Pending";
  const s = status.toLowerCase().replace(/_/g, " ").trim();
  if (s === "pending") return "Pending";
  if (s === "in progress" || s === "in-progress") return "In Progress";
  if (s === "resolved") return "Resolved";
  return status;
};

const getPriorityStyle = (priority) => {
  const p = (priority || "Medium").toLowerCase();
  if (p === "high") {
    return { bg: "#FEF2F2", col: "#DC2626" };
  }
  if (p === "low") {
    return { bg: "#F0FDF4", col: "#16A34A" };
  }
  return { bg: "#FFFBEB", col: "#D97706" }; // Medium
};

const getStatusStyle = (status) => {
  const norm = normalizeStatus(status);
  if (norm === "Resolved") {
    return { bg: "#F0FDF4", col: "#16A34A" };
  }
  if (norm === "In Progress") {
    return { bg: "#EFF6FF", col: "#2563EB" };
  }
  return { bg: "#FFF7ED", col: "#EA580C" }; // Pending
};

const formatTime = (timeStr, createdAt) => {
  const dateVal = createdAt || timeStr;
  if (!dateVal) return "Recently";
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return timeStr || "Recently";

  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const AllIssues = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState("recent"); // "recent" | "oldest" | "priority"

  const fetchIssues = async () => {
    try {
      const data = await getAllIssues();
      const list = Array.isArray(data) ? data : data?.issues || [];
      setIssues(list);
    } catch (error) {
      console.log("FETCH ERROR:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchIssues();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchIssues();
  };

  const toggleSort = () => {
    if (sortBy === "recent") setSortBy("oldest");
    else if (sortBy === "oldest") setSortBy("priority");
    else setSortBy("recent");
  };

  const sortLabel =
    sortBy === "recent"
      ? "Sort: Recent"
      : sortBy === "oldest"
      ? "Sort: Oldest"
      : "Sort: Priority";

  // Dynamic counts of actual problems from database
  const totalCount = issues.length;
  const pendingCount = issues.filter(
    (item) => normalizeStatus(item.status) === "Pending"
  ).length;
  const inProgressCount = issues.filter(
    (item) => normalizeStatus(item.status) === "In Progress"
  ).length;
  const resolvedCount = issues.filter(
    (item) => normalizeStatus(item.status) === "Resolved"
  ).length;

  const filterTabs = [
    { id: "All", label: "All", count: totalCount },
    { id: "Pending", label: "Pending", count: pendingCount },
    { id: "In Progress", label: "In Progress", count: inProgressCount },
    { id: "Resolved", label: "Resolved", count: resolvedCount },
  ];

  const filteredIssues = issues.filter((item) => {
    const locText =
      typeof item.location === "object" && item.location !== null
        ? item.location.address || ""
        : item.location || "";

    const matchesSearch =
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      locText.toLowerCase().includes(searchQuery.toLowerCase());

    const itemStatus = normalizeStatus(item.status);
    const matchesTab = activeTab === "All" || itemStatus === activeTab;

    return matchesSearch && matchesTab;
  });

  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (sortBy === "oldest") {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateA - dateB;
    }
    if (sortBy === "priority") {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const weightA = priorityWeight[(a.priority || "medium").toLowerCase()] || 0;
      const weightB = priorityWeight[(b.priority || "medium").toLowerCase()] || 0;
      return weightB - weightA;
    }
    // Default: recent (newest first)
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={styles.iconBtn}
        >
          <Ionicons name="menu-outline" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Image source={require("@/assets/images/logo.png")} style={styles.logo} />
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.push("/(drawer)/notifications")}
        >
          <Ionicons name="notifications-outline" size={22} color="#1E293B" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Title & Count Badge */}
      <View style={styles.titleRow}>
        <View style={styles.flex1}>
          <View style={styles.titleWithCount}>
            <Text style={styles.pageTitle}>All Issues</Text>
            <View style={styles.totalBadge}>
              <Text style={styles.totalBadgeText}>{totalCount}</Text>
            </View>
          </View>
          <Text style={styles.pageSub}>
            Track and explore all {totalCount} reported {totalCount === 1 ? "issue" : "issues"} across campus.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => {
            setActiveTab("All");
            setSearchQuery("");
            setSortBy("recent");
          }}
        >
          <Ionicons name="refresh-outline" size={15} color="#334155" />
          <Text style={styles.filterText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Summary Cards */}
      <View style={styles.statsRow}>
        <TouchableOpacity
          style={[styles.statCard, activeTab === "All" && styles.statCardActive]}
          onPress={() => setActiveTab("All")}
          activeOpacity={0.7}
        >
          <Text style={[styles.statNum, { color: "#2563EB" }]}>{totalCount}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statCard, activeTab === "Pending" && styles.statCardActive]}
          onPress={() => setActiveTab("Pending")}
          activeOpacity={0.7}
        >
          <Text style={[styles.statNum, { color: "#EA580C" }]}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statCard, activeTab === "In Progress" && styles.statCardActive]}
          onPress={() => setActiveTab("In Progress")}
          activeOpacity={0.7}
        >
          <Text style={[styles.statNum, { color: "#7C3AED" }]}>{inProgressCount}</Text>
          <Text style={styles.statLabel}>Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statCard, activeTab === "Resolved" && styles.statCardActive]}
          onPress={() => setActiveTab("Resolved")}
          activeOpacity={0.7}
        >
          <Text style={[styles.statNum, { color: "#16A34A" }]}>{resolvedCount}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </TouchableOpacity>
      </View>

      {/* Search & Sort */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={17} color="#94A3B8" />
          <TextInput
            placeholder="Search issues, locations, categories..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.sortBtn} onPress={toggleSort}>
          <Ionicons name="swap-vertical-outline" size={15} color="#334155" />
          <Text style={styles.sortText}>{sortLabel}</Text>
          <Ionicons name="chevron-down" size={13} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs with Dynamic Actual Counts */}
      <FlatList
        horizontal
        data={filterTabs}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsList}
        renderItem={({ item }) => {
          const isActive = activeTab === item.id;
          return (
            <TouchableOpacity
              onPress={() => setActiveTab(item.id)}
              style={[styles.tabPill, isActive && styles.activeTab]}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {item.label} ({item.count})
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Results Count Bar */}
      <View style={styles.resultsBar}>
        <Text style={styles.resultsText}>
          Showing <Text style={styles.resultsBold}>{sortedIssues.length}</Text> of{" "}
          <Text style={styles.resultsBold}>{totalCount}</Text> {totalCount === 1 ? "problem" : "problems"}
          {activeTab !== "All" ? ` in ${activeTab}` : ""}
        </Text>
        {(searchQuery.trim().length > 0 || activeTab !== "All") && (
          <TouchableOpacity
            onPress={() => {
              setActiveTab("All");
              setSearchQuery("");
            }}
          >
            <Text style={styles.clearFilterText}>Reset filter</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={["top", "bottom", "left", "right"]} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F8F7" />
      <View style={styles.container}>
        {loading && !refreshing ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#1D7A78" />
            <Text style={styles.loadingText}>Loading all issues...</Text>
          </View>
        ) : (
          <FlatList
            data={sortedIssues}
            keyExtractor={(item) => item.id || item._id}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#1D7A78"]}
                tintColor="#1D7A78"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Ionicons name="search-outline" size={36} color="#7B9AA5" />
                <Text style={styles.emptyTitle}>No issues found</Text>
                <Text style={styles.emptyText}>
                  {totalCount === 0
                    ? "No problems have been reported yet. Tap below to submit one!"
                    : "No problems match your current search or filter."}
                </Text>
                {(searchQuery.trim().length > 0 || activeTab !== "All") && (
                  <TouchableOpacity
                    style={styles.resetBtn}
                    onPress={() => {
                      setActiveTab("All");
                      setSearchQuery("");
                    }}
                  >
                    <Text style={styles.resetBtnText}>Clear filters</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
            renderItem={({ item, index }) => {
              const priorityStyle = getPriorityStyle(item.priority);
              const statusStyle = getStatusStyle(item.status);
              const formattedTime = formatTime(item.time, item.createdAt);
              const normStatus = normalizeStatus(item.status);
              const problemNumber = index + 1;

              return (
                <View style={styles.card}>
                  {/* Top Problem Header with Problem Number & Badges */}
                  <View style={styles.cardMetaHeader}>
                    <View style={styles.problemTag}>
                      <Ionicons name="alert-circle-outline" size={13} color="#123C4A" />
                      <Text style={styles.problemTagText}>Problem #{problemNumber}</Text>
                    </View>

                    <View style={styles.badgesRow}>
                      <View style={[styles.badgePill, { backgroundColor: priorityStyle.bg }]}>
                        <Text style={[styles.pillText, { color: priorityStyle.col }]}>
                          {item.priority || "Medium"}
                        </Text>
                      </View>
                      <View style={[styles.badgePill, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.pillText, { color: statusStyle.col }]}>
                          {normStatus}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Main Card Content */}
                  <View style={styles.cardTop}>
                    {item.image || item.uri ? (
                      <Image source={{ uri: item.image || item.uri }} style={styles.cardThumb} />
                    ) : (
                      <View style={styles.cardIcon}>
                        <Text style={styles.avatarText}>#{problemNumber}</Text>
                      </View>
                    )}

                    <View style={styles.flex1}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.title}
                      </Text>

                      <View style={styles.metaRow}>
                        <View style={styles.rowCenter}>
                          <Ionicons name="location-outline" size={13} color="#64748B" />
                          <Text style={styles.subText} numberOfLines={1}>
                            {typeof item.location === "object" && item.location !== null
                              ? item.location.address ||
                                `${item.location.latitude?.toFixed(4)}, ${item.location.longitude?.toFixed(4)}`
                              : item.location || "Campus Location"}
                          </Text>
                        </View>
                        <View style={styles.rowCenter}>
                          <Ionicons name="time-outline" size={12} color="#64748B" />
                          <Text style={styles.subText}>{formattedTime}</Text>
                        </View>
                      </View>

                      <Text style={styles.descText} numberOfLines={2}>
                        {item.description || item.desc || "No description provided."}
                      </Text>
                    </View>
                  </View>

                  {/* Card Footer with Category and Reference ID */}
                  <View style={styles.cardFooter}>
                    <View style={styles.rowCenter}>
                      <Ionicons name="pricetag-outline" size={13} color="#64748B" />
                      <Text style={styles.metaText}>{item.category || item.cat || "General"}</Text>
                    </View>
                    {item._id && (
                      <View style={styles.rowCenter}>
                        <Ionicons name="barcode-outline" size={13} color="#94A3B8" />
                        <Text style={styles.idText}>ID: #{item._id.slice(-6).toUpperCase()}</Text>
                      </View>
                    )}
                    <View style={styles.rowCenter}>
                      <Ionicons name="thumbs-up-outline" size={13} color="#64748B" />
                      <Text style={styles.metaText}>{item.supporters || "0 supporting"}</Text>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/(drawer)/(tabs)/report")}
          activeOpacity={0.8}
        >
          <View style={styles.fabIcon}>
            <Ionicons name="add" size={18} color="#102A35" />
          </View>
          <Text style={styles.fabText}>Report an Issue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F8F7" },
  container: { flex: 1 },
  listContent: { paddingBottom: 95 },
  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { fontSize: 13, color: "#527986", fontWeight: "600" },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCE8E5",
  },
  logo: { width: 150, height: 35, resizeMode: "contain" },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#D94848",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: "#FFF", fontSize: 9, fontWeight: "700" },

  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  flex1: { flex: 1 },
  titleWithCount: { flexDirection: "row", alignItems: "center", gap: 8 },
  pageTitle: { fontSize: 22, fontWeight: "800", color: "#102A35" },
  totalBadge: {
    backgroundColor: "#E8F5F4",
    borderWidth: 1,
    borderColor: "#9CD4D1",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  totalBadgeText: { fontSize: 13, fontWeight: "800", color: "#1D7A78" },
  pageSub: { fontSize: 12, color: "#527986", marginTop: 2 },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DCE8E5",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  filterText: { fontSize: 12, fontWeight: "600", color: "#102A35" },

  statsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  statCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingVertical: 9,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCE8E5",
  },
  statCardActive: {
    borderColor: "#1D7A78",
    borderWidth: 1.5,
    backgroundColor: "#E8F5F4",
  },
  statNum: { fontSize: 17, fontWeight: "800" },
  statLabel: { fontSize: 10.5, color: "#527986", fontWeight: "600", marginTop: 1 },

  searchRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DCE8E5",
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
    gap: 6,
  },
  searchInput: { flex: 1, fontSize: 12.5, color: "#102A35", paddingVertical: 0 },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DCE8E5",
    borderRadius: 12,
    paddingHorizontal: 9,
    height: 40,
    gap: 4,
  },
  sortText: { fontSize: 11.5, fontWeight: "600", color: "#102A35" },

  tabsList: { gap: 8, paddingVertical: 2 },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DCE8E5",
  },
  activeTab: { backgroundColor: "#1D7A78", borderColor: "#1D7A78" },
  tabText: { fontSize: 12, fontWeight: "600", color: "#527986" },
  activeTabText: { color: "#FFF" },

  resultsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  resultsText: { fontSize: 12, color: "#527986" },
  resultsBold: { fontWeight: "700", color: "#102A35" },
  clearFilterText: { fontSize: 12, fontWeight: "600", color: "#1D7A78" },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#DCE8E5",
    elevation: 1,
    shadowColor: "rgba(18, 60, 74, 0.05)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
  },
  cardMetaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F8F7",
  },
  problemTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5F4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: "#DCE8E5",
  },
  problemTagText: { fontSize: 11, fontWeight: "700", color: "#123C4A" },
  badgesRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  badgePill: { paddingHorizontal: 7, paddingVertical: 2.5, borderRadius: 5 },
  pillText: { fontSize: 10, fontWeight: "700" },

  cardTop: { flexDirection: "row", alignItems: "flex-start" },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#E8F5F4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#DCE8E5",
  },
  cardThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#F4F8F7",
    borderWidth: 1,
    borderColor: "#DCE8E5",
  },
  avatarText: { fontSize: 14, fontWeight: "800", color: "#123C4A" },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#102A35", marginBottom: 4 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 2,
  },
  rowCenter: { flexDirection: "row", alignItems: "center", gap: 4 },
  subText: { fontSize: 11, color: "#527986", flexShrink: 1 },
  descText: { fontSize: 12, color: "#527986", lineHeight: 16, marginTop: 6 },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F4F8F7",
  },
  metaText: { fontSize: 11, color: "#527986" },
  idText: { fontSize: 10.5, color: "#7B9AA5", fontWeight: "600" },

  emptyBox: { alignItems: "center", justifyContent: "center", paddingVertical: 45, gap: 8, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#102A35", marginTop: 4 },
  emptyText: { fontSize: 12.5, color: "#7B9AA5", textAlign: "center", lineHeight: 18 },
  resetBtn: {
    marginTop: 8,
    backgroundColor: "#1D7A78",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resetBtnText: { color: "#FFF", fontSize: 12, fontWeight: "600" },

  fab: {
    position: "absolute",
    bottom: 20,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1D7A78",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 25,
    gap: 8,
    elevation: 4,
    shadowColor: "rgba(18, 60, 74, 0.2)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  fabIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#55C6A9",
    justifyContent: "center",
    alignItems: "center",
  },
  fabText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
});

export default AllIssues;