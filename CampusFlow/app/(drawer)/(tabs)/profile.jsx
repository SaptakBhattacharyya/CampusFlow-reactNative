import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  ImageBackground,
  TouchableOpacity,
  Platform,
  StatusBar,
  Modal,
  Alert,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, DrawerActions, useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { getMyReports, getAllIssues } from "@/services/api";

const Profile = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const {
    user,
    role,
    isAdmin,
    isSupport,
    isGeneralUser,
    updateUserProfile,
    refreshUser,
    logout,
    token,
  } = useAuth();

  // State management
  const [reports, setReports] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    department: "",
    rollNumber: "",
    year: "",
    university: "",
  });

  // Fetch live reports and user profile
  const fetchProfileAndStats = async () => {
    try {
      if (token) {
        refreshUser().catch(() => {});
      }

      let list = [];
      if (token) {
        try {
          const res = await getMyReports(token);
          if (res?.issues) {
            list = res.issues;
          }
        } catch (err) {
          console.log("getMyReports in profile:", err.message);
        }
      }

      // Fallback: match by email or userId
      if (list.length === 0 && user?.email) {
        const allRes = await getAllIssues().catch(() => null);
        const allList = Array.isArray(allRes) ? allRes : allRes?.issues || [];
        list = allList.filter(
          (item) =>
            item.reporterEmail?.toLowerCase().trim() === user.email?.toLowerCase().trim() ||
            item.reportedBy === user?._id
        );
      }

      setReports(list);
    } catch (err) {
      console.error("Error fetching stats in profile:", err);
    } finally {
      setLoadingStats(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfileAndStats();
  }, [token, user?.email]);

  useFocusEffect(
    useCallback(() => {
      fetchProfileAndStats();
    }, [token, user?.email])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileAndStats();
  };

  // Open Edit Profile Modal and prefill with current real user data
  const handleOpenEditModal = () => {
    setEditForm({
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      department: user?.department || "",
      rollNumber: user?.rollNumber || "",
      year: user?.year || "1st Year",
      university: user?.university || "",
    });
    setShowEditModal(true);
  };

  // Save updated profile to backend and local storage
  const handleSaveProfile = async () => {
    if (!editForm.fullName.trim()) {
      Alert.alert("Validation Error", "Full Name cannot be empty.");
      return;
    }

    try {
      setSavingProfile(true);
      await updateUserProfile(editForm);
      setShowEditModal(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (err) {
      Alert.alert("Update Failed", err.message || "Could not update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      await logout();
      router.replace("/login");
    } catch (e) {
      router.replace("/login");
    }
  };

  // Determine role theme
  const getRoleTheme = () => {
    if (isAdmin) {
      return {
        label: "Administrator",
        icon: "shield-checkmark",
        color: "#D94848",
        bg: "#FDF0F0",
        border: "#FECACA",
      };
    }
    if (isSupport) {
      return {
        label: "Support Team",
        icon: "construct",
        color: "#1D7A78",
        bg: "#E8F5F4",
        border: "#9CD4D1",
      };
    }
    return {
      label: "General User",
      icon: "person",
      color: "#123C4A",
      bg: "#E8F8F4",
      border: "#55C6A9",
    };
  };

  const roleTheme = getRoleTheme();

  // Dynamic calculations for real stats
  const totalReportedCount = reports.length;
  const pendingCount = reports.filter(
    (r) => (r.status || "").toLowerCase() === "pending"
  ).length;
  const inProgressCount = reports.filter(
    (r) =>
      (r.status || "").toLowerCase() === "in progress" ||
      (r.status || "").toLowerCase() === "in_progress"
  ).length;
  const resolvedCount = reports.filter(
    (r) => (r.status || "").toLowerCase() === "resolved"
  ).length;

  const dynamicActivityStats = [
    {
      id: "1",
      count: totalReportedCount.toString(),
      title: "Issues Reported",
      icon: "document-text-outline",
      color: "#1D7A78",
      bg: "#E8F5F4",
    },
    {
      id: "2",
      count: pendingCount.toString(),
      title: "Pending Action",
      icon: "time-outline",
      color: "#E07A28",
      bg: "#FFF5EC",
    },
    {
      id: "3",
      count: inProgressCount.toString(),
      title: "In Progress",
      icon: "sync-outline",
      color: "#123C4A",
      bg: "#E8F8F4",
    },
    {
      id: "4",
      count: resolvedCount.toString(),
      title: "Resolved",
      icon: "checkmark-circle-outline",
      color: "#2EA885",
      bg: "#E8F8F4",
    },
  ];

  // Dynamic menu items with real counts
  const profileMenuItems = [
    ...(isAdmin
      ? [
          {
            id: "admin",
            title: "Admin Console",
            subtitle: "User management & system controls",
            icon: "shield-checkmark-outline",
            color: "#DC2626",
            route: "/(drawer)/admin",
          },
        ]
      : []),
    ...(isSupport
      ? [
          {
            id: "support",
            title: "Support Desk",
            subtitle: "Triage tickets & resolve campus issues",
            icon: "construct-outline",
            color: "#2563EB",
            route: "/(drawer)/support",
          },
        ]
      : []),
    {
      id: "my-reports",
      title: "My Reports",
      subtitle:
        totalReportedCount > 0
          ? `${totalReportedCount} reported ${totalReportedCount === 1 ? "issue" : "issues"} tracked`
          : "View status of issues you reported",
      icon: "document-text-outline",
      color: "#2563EB",
      route: "/(drawer)/my-reports",
      badgeCount: totalReportedCount > 0 ? totalReportedCount : null,
    },
    {
      id: "all-issues",
      title: "All Campus Issues",
      subtitle: "Browse all reported campus issues",
      icon: "list-outline",
      color: "#2563EB",
      route: "/(drawer)/allIssues",
    },
    {
      id: "notifications",
      title: "Notifications",
      subtitle: "Stay updated on your issues",
      icon: "notifications-outline",
      color: "#2563EB",
      route: "/(drawer)/notifications",
    },
    {
      id: "settings",
      title: "Account Settings",
      subtitle: "Manage your account details",
      icon: "settings-outline",
      color: "#2563EB",
      route: "/(drawer)/settings",
    },
    {
      id: "help",
      title: "Help & Support",
      subtitle: "FAQs, guides and contact us",
      icon: "help-circle-outline",
      color: "#2563EB",
      route: "/(drawer)/help-support",
    },
  ];

  // Member since date formatting
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1D7A78"]}
            tintColor="#1D7A78"
          />
        }
      >
        {/* Header */}
        <ImageBackground
          source={require("@/assets/images/campus-bg-report.jpg")}
          style={styles.heroBg}
          imageStyle={styles.heroImg}
        >
          <View style={styles.heroOverlay}>
            <View style={styles.rowBetween}>
              <TouchableOpacity
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                style={styles.iconBtn}
              >
                <Ionicons name="menu-outline" size={26} color="#1E293B" />
              </TouchableOpacity>
              <Image source={require("@/assets/images/logo.png")} style={styles.logo} />
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => router.push("/(drawer)/notifications")}
              >
                <Ionicons name="notifications-outline" size={24} color="#1E293B" />
                <View style={styles.badge} />
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>

        {/* Profile Card */}
        <View style={styles.body}>
          <View style={styles.profileCard}>
            <View style={styles.profileTopRow}>
              {/* Avatar with Initials fallback & Edit Trigger */}
              <TouchableOpacity
                style={styles.avatarWrapper}
                onPress={handleOpenEditModal}
                activeOpacity={0.8}
              >
                <View style={styles.avatarCircle}>
                  {user?.profilePic ? (
                    <Image
                      source={{ uri: user.profilePic }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Text style={[styles.avatarInitials, { color: roleTheme.color }]}>
                      {user?.fullName
                        ? user.fullName.trim().slice(0, 2).toUpperCase()
                        : "CF"}
                    </Text>
                  )}
                </View>
                <View style={[styles.editBadge, { backgroundColor: roleTheme.color }]}>
                  <Ionicons name="pencil" size={11} color="#FFF" />
                </View>
              </TouchableOpacity>

              <View style={styles.profileInfo}>
                <View style={styles.rowBetween}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {user?.fullName || "CampusFlow User"}
                  </Text>
                  <TouchableOpacity
                    style={styles.editPillBtn}
                    onPress={handleOpenEditModal}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="create-outline" size={13} color="#1D7A78" />
                    <Text style={styles.editPillText}>Edit</Text>
                  </TouchableOpacity>
                </View>

                {/* Role Badge */}
                <View
                  style={[
                    styles.roleBadge,
                    { backgroundColor: roleTheme.bg, borderColor: roleTheme.border },
                  ]}
                >
                  <Ionicons name={roleTheme.icon} size={13} color={roleTheme.color} />
                  <Text style={[styles.roleBadgeText, { color: roleTheme.color }]}>
                    {roleTheme.label}
                  </Text>
                </View>

                <View style={styles.infoMetaList}>
                  <View style={styles.metaLine}>
                    <Ionicons name="mail-outline" size={13} color="#64748B" />
                    <Text style={styles.metaLineText} numberOfLines={1}>
                      {user?.email || "No email available"}
                    </Text>
                  </View>
                  <View style={styles.metaLine}>
                    <Ionicons name="call-outline" size={13} color="#64748B" />
                    <Text style={styles.metaLineText}>
                      {user?.phone ? user.phone : "Phone not added"}
                    </Text>
                  </View>
                  <View style={styles.metaLine}>
                    <Ionicons name="location-outline" size={13} color="#64748B" />
                    <Text style={styles.metaLineText} numberOfLines={1}>
                      {user?.university || "Campus Community"}
                    </Text>
                  </View>
                  {memberSince && (
                    <View style={styles.metaLine}>
                      <Ionicons name="calendar-outline" size={13} color="#64748B" />
                      <Text style={styles.metaLineText}>
                        Member since {memberSince}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Academic & Staff Details Row */}
            <View style={styles.academicRow}>
              <View style={styles.academicCol}>
                <View style={styles.academicIconBox}>
                  <Ionicons name="business-outline" size={16} color="#2563EB" />
                </View>
                <Text style={styles.academicLabel}>Department</Text>
                <Text style={styles.academicVal} numberOfLines={1}>
                  {user?.department || "General"}
                </Text>
              </View>

              <View style={styles.verticalLine} />

              <View style={styles.academicCol}>
                <View style={styles.academicIconBox}>
                  <Ionicons name="card-outline" size={16} color="#2563EB" />
                </View>
                <Text style={styles.academicLabel}>ID / Roll</Text>
                <Text style={styles.academicVal} numberOfLines={1}>
                  {user?.rollNumber || "Not Set"}
                </Text>
              </View>

              <View style={styles.verticalLine} />

              <View style={styles.academicCol}>
                <View style={styles.academicIconBox}>
                  <Ionicons name="school-outline" size={16} color="#2563EB" />
                </View>
                <Text style={styles.academicLabel}>Year</Text>
                <Text style={styles.academicVal} numberOfLines={1}>
                  {user?.year || "1st Year"}
                </Text>
              </View>
            </View>
          </View>

          {/* Dedicated Console Shortcuts */}
          {isAdmin && (
            <TouchableOpacity
              style={styles.adminBannerBtn}
              onPress={() => router.push("/(drawer)/admin")}
            >
              <View style={styles.adminBannerLeft}>
                <View style={styles.adminBannerIcon}>
                  <Ionicons name="shield-checkmark" size={20} color="#DC2626" />
                </View>
                <View>
                  <Text style={styles.adminBannerTitle}>Open Admin Console</Text>
                  <Text style={styles.adminBannerSub}>Manage users, roles & platform issues</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#DC2626" />
            </TouchableOpacity>
          )}

          {isSupport && (
            <TouchableOpacity
              style={styles.supportBannerBtn}
              onPress={() => router.push("/(drawer)/support")}
            >
              <View style={styles.supportBannerLeft}>
                <View style={styles.supportBannerIcon}>
                  <Ionicons name="construct" size={20} color="#2563EB" />
                </View>
                <View>
                  <Text style={styles.supportBannerTitle}>Open Support Desk</Text>
                  <Text style={styles.supportBannerSub}>Triage & resolve campus complaints</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#2563EB" />
            </TouchableOpacity>
          )}

          {/* Real Activity Overview Section */}
          <View style={styles.sectionHeader}>
            <View style={styles.rowCenter}>
              <Text style={styles.sectionTitle}>My Activity Overview</Text>
              {loadingStats && (
                <ActivityIndicator size="small" color="#1D7A78" style={{ marginLeft: 8 }} />
              )}
            </View>
            <TouchableOpacity onPress={() => router.push("/(drawer)/my-reports")}>
              <Text style={styles.linkText}>View Reports ›</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            data={dynamicActivityStats}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.gap10}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.statCard}
                onPress={() => router.push("/(drawer)/my-reports")}
                activeOpacity={0.8}
              >
                <View style={[styles.statIconBox, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon} size={18} color={item.color} />
                </View>
                <Text style={styles.statCount}>{item.count}</Text>
                <Text style={styles.statLabel}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />

          {/* Action Menu List */}
          <View style={styles.menuContainer}>
            <FlatList
              data={profileMenuItems}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => item.route && router.push(item.route)}
                >
                  <View
                    style={[
                      styles.menuIconBox,
                      { backgroundColor: `${item.color || "#2563EB"}15` },
                    ]}
                  >
                    <Ionicons name={item.icon} size={18} color={item.color || "#2563EB"} />
                  </View>
                  <View style={styles.flex1}>
                    <View style={styles.menuTitleRow}>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                      {item.badgeCount ? (
                        <View style={styles.menuCountBadge}>
                          <Text style={styles.menuCountBadgeText}>{item.badgeCount}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.menuSub}>{item.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ================= EDIT PROFILE MODAL ================= */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModalCard}>
            <View style={styles.editModalHeader}>
              <View>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <Text style={styles.editModalSub}>Update your real campus credentials</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                style={styles.modalCloseBtnCircle}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.editModalScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="person-outline" size={18} color="#7B9AA5" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter full name"
                    placeholderTextColor="#94A3B8"
                    value={editForm.fullName}
                    onChangeText={(val) => setEditForm((prev) => ({ ...prev, fullName: val }))}
                  />
                </View>
              </View>

              {/* Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="call-outline" size={18} color="#7B9AA5" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter phone number"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    value={editForm.phone}
                    onChangeText={(val) => setEditForm((prev) => ({ ...prev, phone: val }))}
                  />
                </View>
              </View>

              {/* Department */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Department</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="business-outline" size={18} color="#7B9AA5" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Computer Science, Mechanical"
                    placeholderTextColor="#94A3B8"
                    value={editForm.department}
                    onChangeText={(val) => setEditForm((prev) => ({ ...prev, department: val }))}
                  />
                </View>
              </View>

              {/* Roll Number / ID */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ID / Roll Number</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="card-outline" size={18} color="#7B9AA5" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 21CS042"
                    placeholderTextColor="#94A3B8"
                    value={editForm.rollNumber}
                    onChangeText={(val) => setEditForm((prev) => ({ ...prev, rollNumber: val }))}
                  />
                </View>
              </View>

              {/* Academic Year */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Academic Year</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="school-outline" size={18} color="#7B9AA5" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 1st Year, 2nd Year, Final Year"
                    placeholderTextColor="#94A3B8"
                    value={editForm.year}
                    onChangeText={(val) => setEditForm((prev) => ({ ...prev, year: val }))}
                  />
                </View>
              </View>

              {/* University */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>University / Campus</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="location-outline" size={18} color="#7B9AA5" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Main Campus, Delhi University"
                    placeholderTextColor="#94A3B8"
                    value={editForm.university}
                    onChangeText={(val) => setEditForm((prev) => ({ ...prev, university: val }))}
                  />
                </View>
              </View>

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowEditModal(false)}
                  disabled={savingProfile}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveBtn, savingProfile && { opacity: 0.7 }]}
                  onPress={handleSaveProfile}
                  disabled={savingProfile}
                  activeOpacity={0.8}
                >
                  {savingProfile ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
                      <Text style={styles.saveBtnText}>Save Changes</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================= LOGOUT CONFIRMATION MODAL ================= */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconBox}>
              <Ionicons name="log-out-outline" size={28} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>Log Out</Text>
            <Text style={styles.modalMessage}>Are you sure you want to log out of CampusFlow?</Text>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalLogoutBtn}
                onPress={confirmLogout}
                activeOpacity={0.8}
              >
                <Ionicons name="log-out-outline" size={16} color="#FFF" />
                <Text style={styles.modalLogoutText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { paddingBottom: 40 },
  heroBg: { width: "100%", height: 160 },
  heroImg: { resizeMode: "cover" },
  heroOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: { width: 140, height: 32, resizeMode: "contain" },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  body: { paddingHorizontal: 16, marginTop: -50 },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DCE8E5",
    shadowColor: "rgba(18, 60, 74, 0.06)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  profileTopRow: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  avatarWrapper: { position: "relative" },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#E8F5F4",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 38,
  },
  avatarInitials: {
    fontSize: 26,
    fontWeight: "800",
  },
  editBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileInfo: { flex: 1 },
  userName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#102A35",
    flex: 1,
  },
  editPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#E8F5F4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 6,
  },
  editPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1D7A78",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 6,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  infoMetaList: { gap: 3 },
  metaLine: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaLineText: { fontSize: 11.5, color: "#527986" },
  academicRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#DCE8E5",
  },
  academicCol: { flex: 1, alignItems: "center" },
  academicIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#E8F5F4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  academicLabel: { fontSize: 10.5, color: "#527986", fontWeight: "600" },
  academicVal: { fontSize: 12, fontWeight: "700", color: "#102A35", marginTop: 2 },
  verticalLine: { width: 1, height: 36, backgroundColor: "#DCE8E5" },
  adminBannerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FDF0F0",
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: "#FECACA",
  },
  adminBannerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  adminBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  adminBannerTitle: { fontSize: 14, fontWeight: "800", color: "#D94848" },
  adminBannerSub: { fontSize: 11, color: "#B91C1C", marginTop: 1 },
  supportBannerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E8F5F4",
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: "#9CD4D1",
  },
  supportBannerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  supportBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#DCE8E5",
    alignItems: "center",
    justifyContent: "center",
  },
  supportBannerTitle: { fontSize: 14, fontWeight: "800", color: "#1D7A78" },
  supportBannerSub: { fontSize: 11, color: "#123C4A", marginTop: 1 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: "#102A35" },
  linkText: { fontSize: 12, color: "#1D7A78", fontWeight: "700" },
  gap10: { gap: 10 },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    width: 120,
    borderWidth: 1,
    borderColor: "#DCE8E5",
  },
  statIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statCount: { fontSize: 18, fontWeight: "800", color: "#102A35" },
  statLabel: { fontSize: 11, color: "#527986", fontWeight: "600", marginTop: 2 },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#DCE8E5",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  flex1: { flex: 1 },
  menuTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuTitle: { fontSize: 14, fontWeight: "700", color: "#102A35" },
  menuCountBadge: {
    backgroundColor: "#E8F5F4",
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#9CD4D1",
  },
  menuCountBadgeText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#1D7A78",
  },
  menuSub: { fontSize: 11, color: "#527986", marginTop: 1 },
  divider: { height: 1, backgroundColor: "#DCE8E5", marginHorizontal: 14 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  logoutText: { fontSize: 14, fontWeight: "700", color: "#D94848" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(18, 60, 74, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#102A35" },
  modalIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FDF0F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  modalMessage: { fontSize: 13, color: "#527986", textAlign: "center", marginVertical: 8 },
  modalButtonRow: { flexDirection: "row", gap: 10, width: "100%", marginTop: 16 },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DCE8E5",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: { fontSize: 14, fontWeight: "600", color: "#527986" },
  modalLogoutBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#D94848",
    paddingVertical: 12,
    borderRadius: 10,
  },
  modalLogoutText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },

  // Edit Profile Modal Styles
  editModalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxWidth: 380,
    maxHeight: "85%",
  },
  editModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  editModalSub: {
    fontSize: 12,
    color: "#527986",
    marginTop: 2,
  },
  modalCloseBtnCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  editModalScroll: {
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#102A35",
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#DCE8E5",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 42,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: "#102A35",
    paddingVertical: 0,
  },
  saveBtn: {
    flex: 1.4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#1D7A78",
    paddingVertical: 12,
    borderRadius: 10,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default Profile;