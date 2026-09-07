import React, { useEffect, useState, useCallback } from "react";
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
import { getMyReports, getAllIssues } from "../../services/api";
import { useAuth } from "@/context/AuthContext";
import { UserReportCard } from "@/components/user/UserReportCard";

const filterTabs = ["All", "Pending", "In Progress", "Resolved"];

const MyReports = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { user, token } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      let list = [];

      if (token) {
        try {
          const res = await getMyReports(token);
          if (res?.issues) list = res.issues;
        } catch (err) {
          console.log("getMyReports fallback:", err.message);
        }
      }

      // If token not present or endpoint returned empty, filter by user email if available
      if (list.length === 0 && user?.email) {
        const allRes = await getAllIssues().catch(() => null);
        const allList = Array.isArray(allRes) ? allRes : allRes?.issues || [];
        list = allList.filter(
          (item) =>
            item.reporterEmail?.toLowerCase().trim() === user.email.toLowerCase().trim() ||
            item.reportedBy === user._id
        );
      }

      setReports(list);
    } catch (error) {
      console.log("MY REPORTS ERROR:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const filteredReports = reports.filter((item) => {
    const locationText =
      typeof item.location === "object" && item.location !== null
        ? item.location.address || ""
        : item.location || "";

    const matchesSearch =
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (locationText && locationText.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const itemStatus = item.status || "Pending";
    const matchesTab =
      activeTab === "All" ||
      itemStatus.toLowerCase() === activeTab.toLowerCase();

    return matchesSearch && matchesTab;
  });

  const pendingCount = reports.filter(
    (r) => (r.status || "").toLowerCase() === "pending"
  ).length;
  const inProgressCount = reports.filter(
    (r) => (r.status || "").toLowerCase() === "in progress"
  ).length;
  const resolvedCount = reports.filter(
    (r) => (r.status || "").toLowerCase() === "resolved"
  ).length;

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

      {/* Title */}
      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>My Reports</Text>
        <Text style={styles.pageSub}>
          Track the real-time status and resolution of issues you reported.
        </Text>
      </View>

      {/* Stats Summary Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: "#1D7A78" }]}>{reports.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: "#E07A28" }]}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: "#123C4A" }]}>{inProgressCount}</Text>
          <Text style={styles.statLabel}>Progress</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: "#2EA885" }]}>{resolvedCount}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={17} color="#7B9AA5" />
        <TextInput
          placeholder="Search your reports by title, category, venue..."
          placeholderTextColor="#7B9AA5"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={16} color="#7B9AA5" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <FlatList
        horizontal
        data={filterTabs}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsList}
        renderItem={({ item }) => {
          const isActive = activeTab === item;
          return (
            <TouchableOpacity
              onPress={() => setActiveTab(item)}
              style={[styles.tabPill, isActive && styles.activeTab]}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );

  return (
    <SafeAreaView edges={["top", "bottom", "left", "right"]} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F8F7" />
      <View style={styles.container}>
        {loading && !refreshing ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#1D7A78" />
            <Text style={styles.loadingText}>Loading your reports...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredReports}
            keyExtractor={(item, index) => item.id || item._id || index.toString()}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#1D7A78"]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Ionicons name="document-text-outline" size={40} color="#7B9AA5" />
                <Text style={styles.emptyTitle}>No personal reports yet</Text>
                <Text style={styles.emptySub}>
                  You haven't submitted any complaints matching this filter. Notice an issue on campus? Report it below!
                </Text>
                <TouchableOpacity
                  style={styles.emptyBtn}
                  onPress={() => router.push("/(drawer)/(tabs)/report")}
                >
                  <Ionicons name="add" size={16} color="#55C6A9" />
                  <Text style={styles.emptyBtnText}>Report an Issue</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item }) => (
              <View style={{ marginHorizontal: 16 }}>
                <UserReportCard report={item} />
              </View>
            )}
          />
        )}

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/(drawer)/(tabs)/report")}
        >
          <View style={styles.fabIcon}>
            <Ionicons name="add" size={18} color="#123C4A" />
          </View>
          <Text style={styles.fabText}>Report New Issue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F8F7" },
  container: { flex: 1 },
  listContent: { paddingBottom: 85 },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: "#527986",
    fontWeight: "600",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
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
  titleSection: { marginBottom: 14 },
  pageTitle: { fontSize: 22, fontWeight: "800", color: "#102A35" },
  pageSub: { fontSize: 12, color: "#527986", marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  statCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCE8E5",
  },
  statNum: { fontSize: 18, fontWeight: "800" },
  statLabel: {
    fontSize: 11,
    color: "#527986",
    fontWeight: "600",
    marginTop: 1,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DCE8E5",
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 42,
    gap: 6,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 12.5, color: "#102A35", paddingVertical: 0 },
  tabsList: { gap: 8, paddingVertical: 2 },
  tabPill: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DCE8E5",
  },
  activeTab: { backgroundColor: "#1D7A78", borderColor: "#1D7A78" },
  tabText: { fontSize: 12, fontWeight: "600", color: "#527986" },
  activeTabText: { color: "#FFF" },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#102A35", marginTop: 8 },
  emptySub: { fontSize: 12.5, color: "#527986", textAlign: "center", lineHeight: 18 },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1D7A78",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  emptyBtnText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
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
    shadowColor: "#123C4A",
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

export default MyReports;
