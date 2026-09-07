import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, DrawerActions, useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import {
  getAdminStats,
  getAdminUsers,
  updateUserRole,
  adminDeleteIssue,
  getAllIssues,
} from "@/services/api";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { UserRoleModal } from "@/components/admin/UserRoleModal";

export default function AdminConsole() {
  const navigation = useNavigation();
  const router = useRouter();
  const { user, token, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState("users"); // "users" | "issues"
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filters
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("All");
  const [issueSearch, setIssueSearch] = useState("");

  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [isSavingRole, setIsSavingRole] = useState(false);

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [statsRes, usersRes, issuesRes] = await Promise.all([
        getAdminStats(token).catch(() => null),
        getAdminUsers({ search: userSearch, role: userRoleFilter }, token).catch(() => null),
        getAllIssues().catch(() => null),
      ]);

      if (statsRes?.stats) setStats(statsRes.stats);
      if (usersRes?.users) setUsers(usersRes.users);
      if (issuesRes) {
        const list = Array.isArray(issuesRes) ? issuesRes : issuesRes?.issues || [];
        setIssues(list);
      }
    } catch (error) {
      console.error("Admin fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userRoleFilter]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleOpenRoleModal = (targetUser) => {
    setSelectedUser(targetUser);
    setRoleModalVisible(true);
  };

  const handleSaveRole = async (userId, newRole) => {
    try {
      setIsSavingRole(true);
      await updateUserRole(userId, newRole, token);
      Alert.alert("Success", `User role updated to ${newRole}`);
      setRoleModalVisible(false);
      fetchData();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to update user role");
    } finally {
      setIsSavingRole(false);
    }
  };

  const handleDeleteIssue = (issueId, issueTitle) => {
    Alert.alert(
      "Confirm Master Deletion",
      `Are you sure you want to permanently delete issue "${issueTitle}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Permanently",
          style: "destructive",
          onPress: async () => {
            try {
              await adminDeleteIssue(issueId, token);
              Alert.alert("Deleted", "Issue permanently removed from system.");
              fetchData();
            } catch (err) {
              Alert.alert("Error", err.message || "Failed to delete issue");
            }
          },
        },
      ]
    );
  };

  // Filter users by search
  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    const matchSearch =
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q));
    return matchSearch;
  });

  // Filter issues by search
  const filteredIssues = issues.filter((i) => {
    const q = issueSearch.toLowerCase();
    return (
      (i.title && i.title.toLowerCase().includes(q)) ||
      (i.category && i.category.toLowerCase().includes(q)) ||
      (i.description && i.description.toLowerCase().includes(q))
    );
  });

  // Security guard for non-admins
  if (!isAdmin) {
    return (
      <SafeAreaView edges={["top", "bottom", "left", "right"]} style={styles.safeArea}>
        <View style={styles.deniedContainer}>
          <View style={styles.deniedIconBox}>
            <Ionicons name="lock-closed" size={48} color="#EF4444" />
          </View>
          <Text style={styles.deniedTitle}>Admin Access Restricted</Text>
          <Text style={styles.deniedSub}>
            This control center is restricted to Platform Administrators. Your current role is{" "}
            <Text style={{ fontWeight: "700" }}>{user?.role || "User"}</Text>.
          </Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace("/(drawer)/(tabs)")}
          >
            <Ionicons name="arrow-back" size={18} color="#FFF" />
            <Text style={styles.backBtnText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const rolePills = ["All", "User", "Support", "Admin"];

  return (
    <SafeAreaView edges={["top", "bottom", "left", "right"]} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.topHeader}>
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={styles.menuBtn}
          >
            <Ionicons name="menu-outline" size={24} color="#1E293B" />
          </TouchableOpacity>

          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle}>Admin Console</Text>
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#DC2626" />
              <Text style={styles.adminBadgeText}>Superuser</Text>
            </View>
          </View>

          <TouchableOpacity onPress={onRefresh} style={styles.menuBtn}>
            <Ionicons name="refresh-outline" size={20} color="#1E293B" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1D7A78"]}
          />
        }
      >
        {/* KPI Stats Section */}
        <Text style={styles.sectionHeading}>Platform Overview</Text>
        <View style={styles.statsGrid}>
          <AdminStatCard
            title="Total Users"
            value={stats?.users?.total || users.length}
            icon="people-outline"
            color="#1D7A78"
            bg="#E8F5F4"
            subtitle={`${stats?.users?.generalUsers || 0} Users • ${stats?.users?.supportTeam || 0} Support`}
          />
          <AdminStatCard
            title="Complaints"
            value={stats?.issues?.total || issues.length}
            icon="clipboard-outline"
            color="#123C4A"
            bg="#EAF3F6"
            subtitle={`${stats?.issues?.pending || 0} Pending`}
          />
        </View>
        <View style={styles.statsGrid}>
          <AdminStatCard
            title="Resolved Rate"
            value={stats?.issues?.resolutionRate || "0%"}
            icon="checkmark-done-circle-outline"
            color="#2EA885"
            bg="#EBF9F5"
            subtitle={`${stats?.issues?.resolved || 0} Resolved`}
          />
          <AdminStatCard
            title="Admins"
            value={stats?.users?.admins || 1}
            icon="shield-outline"
            color="#D94848"
            bg="#FEF2F2"
            subtitle="Full Control"
          />
        </View>

        {/* Tab Selector */}
        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === "users" && styles.segmentBtnActive]}
            onPress={() => setActiveTab("users")}
          >
            <Ionicons
              name="people"
              size={16}
              color={activeTab === "users" ? "#FFF" : "#527986"}
            />
            <Text
              style={[
                styles.segmentText,
                activeTab === "users" && styles.segmentTextActive,
              ]}
            >
              User Management ({users.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === "issues" && styles.segmentBtnActive]}
            onPress={() => setActiveTab("issues")}
          >
            <Ionicons
              name="warning"
              size={16}
              color={activeTab === "issues" ? "#FFF" : "#527986"}
            />
            <Text
              style={[
                styles.segmentText,
                activeTab === "issues" && styles.segmentTextActive,
              ]}
            >
              Master Issues ({issues.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= TAB 1: USERS MANAGEMENT ================= */}
        {activeTab === "users" ? (
          <View>
            {/* Search Box */}
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color="#7B9AA5" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, email, department..."
                placeholderTextColor="#7B9AA5"
                value={userSearch}
                onChangeText={setUserSearch}
              />
              {userSearch.length > 0 && (
                <TouchableOpacity onPress={() => setUserSearch("")}>
                  <Ionicons name="close-circle" size={16} color="#7B9AA5" />
                </TouchableOpacity>
              )}
            </View>

            {/* Role Filter Pills */}
            <View style={styles.pillsRow}>
              {rolePills.map((r) => {
                const active = userRoleFilter === r;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[styles.rolePill, active && styles.rolePillActive]}
                    onPress={() => setUserRoleFilter(r)}
                  >
                    <Text
                      style={[styles.rolePillText, active && styles.rolePillTextActive]}
                    >
                      {r === "User" ? "General Users" : r === "Support" ? "Support Team" : r}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Users List */}
            {loading && !refreshing ? (
              <ActivityIndicator size="small" color="#1D7A78" style={{ margin: 20 }} />
            ) : filteredUsers.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="person-outline" size={32} color="#7B9AA5" />
                <Text style={styles.emptyTitle}>No users found</Text>
                <Text style={styles.emptyDesc}>Try adjusting your search or role filter.</Text>
              </View>
            ) : (
              filteredUsers.map((u) => {
                const userRole = u.role || "User";
                const isItemAdmin = userRole === "Admin";
                const isItemSupport = userRole === "Support";

                const badgeBg = isItemAdmin
                  ? "#FEF2F2"
                  : isItemSupport
                  ? "#EAF3F6"
                  : "#E8F5F4";
                const badgeCol = isItemAdmin
                  ? "#D94848"
                  : isItemSupport
                  ? "#123C4A"
                  : "#1D7A78";

                return (
                  <View key={u._id} style={styles.userCard}>
                    <View style={styles.userLeft}>
                      <View
                        style={[
                          styles.userAvatar,
                          { backgroundColor: isItemAdmin ? "#FEE2E2" : "#E2ECE9" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.avatarInitials,
                            { color: isItemAdmin ? "#D94848" : "#123C4A" },
                          ]}
                        >
                          {u.fullName ? u.fullName.slice(0, 2).toUpperCase() : "U"}
                        </Text>
                      </View>
                      <View style={styles.userInfo}>
                        <Text style={styles.userName}>{u.fullName || "User"}</Text>
                        <Text style={styles.userEmail}>{u.email}</Text>
                        <Text style={styles.userDept}>
                          {u.department || "General"} {u.rollNumber ? `• ${u.rollNumber}` : ""}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.userRight}>
                      <View style={[styles.roleBadge, { backgroundColor: badgeBg }]}>
                        <Text style={[styles.roleBadgeText, { color: badgeCol }]}>
                          {userRole === "User" ? "General User" : userRole}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.changeRoleBtn}
                        onPress={() => handleOpenRoleModal(u)}
                      >
                        <Ionicons name="create-outline" size={13} color="#1D7A78" />
                        <Text style={styles.changeRoleText}>Change Role</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        ) : (
          /* ================= TAB 2: MASTER ISSUES AUDIT ================= */
          <View>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color="#94A3B8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search all issues by title, category..."
                placeholderTextColor="#94A3B8"
                value={issueSearch}
                onChangeText={setIssueSearch}
              />
              {issueSearch.length > 0 && (
                <TouchableOpacity onPress={() => setIssueSearch("")}>
                  <Ionicons name="close-circle" size={16} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            {filteredIssues.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="alert-circle-outline" size={32} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No issues found</Text>
              </View>
            ) : (
              filteredIssues.map((issue) => (
                <View key={issue._id} style={styles.issueAuditCard}>
                  <View style={styles.issueTopRow}>
                    <View style={styles.issueCatBadge}>
                      <Text style={styles.issueCatText}>{issue.category || "General"}</Text>
                    </View>
                    <View style={styles.issueStatusPill}>
                      <Text style={styles.issueStatusText}>{issue.status || "Pending"}</Text>
                    </View>
                  </View>

                  <Text style={styles.issueTitle}>{issue.title}</Text>
                  <Text style={styles.issueDesc} numberOfLines={2}>
                    {issue.description}
                  </Text>

                  <View style={styles.issueBottomRow}>
                    <Text style={styles.reporterLabel}>
                      Reported by:{" "}
                      <Text style={{ fontWeight: "700" }}>
                        {issue.reporterName || "Campus User"}
                      </Text>
                    </Text>

                    <TouchableOpacity
                      style={styles.deleteIssueBtn}
                      onPress={() => handleDeleteIssue(issue._id, issue.title)}
                    >
                      <Ionicons name="trash-outline" size={14} color="#EF4444" />
                      <Text style={styles.deleteIssueText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Role Assignment Modal */}
      <UserRoleModal
        visible={roleModalVisible}
        user={selectedUser}
        onClose={() => setRoleModalVisible(false)}
        onSaveRole={handleSaveRole}
        isSaving={isSavingRole}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F8F7" },
  topHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#DCE8E5",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F4F8F7",
    borderWidth: 1,
    borderColor: "#DCE8E5",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#102A35",
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FDF0F0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  adminBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#D94848",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: "#527986",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  tabSelector: {
    flexDirection: "row",
    backgroundColor: "#DCE8E5",
    padding: 4,
    borderRadius: 14,
    marginVertical: 14,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: "#1D7A78",
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#527986",
  },
  segmentTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE8E5",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#102A35",
  },
  pillsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  rolePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE8E5",
  },
  rolePillActive: {
    backgroundColor: "#1D7A78",
    borderColor: "#1D7A78",
  },
  rolePillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#527986",
  },
  rolePillTextActive: {
    color: "#FFFFFF",
  },
  userCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCE8E5",
  },
  userLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 15,
    fontWeight: "800",
  },
  userInfo: { flex: 1 },
  userName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#102A35",
  },
  userEmail: {
    fontSize: 11,
    color: "#527986",
    marginTop: 1,
  },
  userDept: {
    fontSize: 10,
    color: "#7B9AA5",
    marginTop: 2,
  },
  userRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  changeRoleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#E8F5F4",
  },
  changeRoleText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1D7A78",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCE8E5",
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#527986",
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 12,
    color: "#7B9AA5",
    marginTop: 2,
  },
  issueAuditCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#DCE8E5",
  },
  issueTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  issueCatBadge: {
    backgroundColor: "#E8F5F4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  issueCatText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#123C4A",
  },
  issueStatusPill: {
    backgroundColor: "#FFF5EC",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  issueStatusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#E07A28",
  },
  issueTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#102A35",
    marginBottom: 4,
  },
  issueDesc: {
    fontSize: 12,
    color: "#527986",
    lineHeight: 16,
    marginBottom: 8,
  },
  issueBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#DCE8E5",
  },
  reporterLabel: {
    fontSize: 11,
    color: "#527986",
  },
  deleteIssueBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FDF0F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deleteIssueText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#D94848",
  },
  deniedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  deniedIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#FDF0F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  deniedTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#102A35",
    marginBottom: 8,
  },
  deniedSub: {
    fontSize: 13,
    color: "#527986",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1D7A78",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});
