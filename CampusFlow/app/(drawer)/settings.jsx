import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Switch, Image, TouchableOpacity, Alert, Platform, StatusBar, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

const Settings = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Settings State Toggles
  const [pushNotifs, setPushNotifs] = useState(true);
  const [statusUpdates, setStatusUpdates] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [anonymousReport, setAnonymousReport] = useState(false);

  const handleClearCache = () => {
    Alert.alert("Clear Cache", "Are you sure you want to clear temporary cached data?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: () => Alert.alert("Success", "Cache cleared successfully!") },
    ]);
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

  return (
    <SafeAreaView edges={["top", "bottom", "left", "right"]} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F8F7" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.iconBtn}>
            <Ionicons name="menu-outline" size={24} color="#123C4A" />
          </TouchableOpacity>
          <Image source={require("@/assets/images/logo.png")} style={styles.logo} />
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/(drawer)/notifications")}>
            <Ionicons name="notifications-outline" size={22} color="#123C4A" />
            <View style={styles.badge}><Text style={styles.badgeText}>3</Text></View>
          </TouchableOpacity>
        </View>

        {/* Page Title */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Settings</Text>
          <Text style={styles.pageSub}>Manage your app preferences and account settings.</Text>
        </View>

        {/* Profile Card Summary */}
        <TouchableOpacity style={styles.profileBanner} onPress={() => router.push("/(drawer)/(tabs)/profile")} activeOpacity={0.8}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.fullName ? user.fullName.trim().slice(0, 2).toUpperCase() : "CF"}
            </Text>
          </View>
          <View style={styles.flex1}>
            <Text style={styles.profileName}>
              {user?.fullName || "CampusFlow User"}
            </Text>
            <Text style={styles.profileEmail}>
              {user?.email || "No email"} {user?.department ? `• ${user.department}` : ""}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#7B9AA5" />
        </TouchableOpacity>

        {/* Section 1: Notifications */}
        <Text style={styles.sectionHeader}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDesc}>Receive real-time alerts on your device</Text>
            </View>
            <Switch value={pushNotifs} onValueChange={setPushNotifs} trackColor={{ false: "#DCE8E5", true: "#55C6A9" }} />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingTitle}>Issue Status Updates</Text>
              <Text style={styles.settingDesc}>Get notified when your issue status changes</Text>
            </View>
            <Switch value={statusUpdates} onValueChange={setStatusUpdates} trackColor={{ false: "#DCE8E5", true: "#55C6A9" }} />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingTitle}>Weekly Campus Digest</Text>
              <Text style={styles.settingDesc}>Weekly summary of top resolved issues</Text>
            </View>
            <Switch value={weeklyDigest} onValueChange={setWeeklyDigest} trackColor={{ false: "#DCE8E5", true: "#55C6A9" }} />
          </View>
        </View>

        {/* Section 2: Preferences & Privacy */}
        <Text style={styles.sectionHeader}>Preferences & Privacy</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingTitle}>Anonymous Reporting</Text>
              <Text style={styles.settingDesc}>Hide your name on public issue posts</Text>
            </View>
            <Switch value={anonymousReport} onValueChange={setAnonymousReport} trackColor={{ false: "#DCE8E5", true: "#55C6A9" }} />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRowBtn} onPress={handleClearCache}>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingTitle}>Clear App Cache</Text>
              <Text style={styles.settingDesc}>Free up temporary storage</Text>
            </View>
            <Ionicons name="trash-outline" size={18} color="#527986" />
          </TouchableOpacity>
        </View>

        {/* Section 3: About & Legal */}
        <Text style={styles.sectionHeader}>About</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingRowBtn} onPress={() => router.push("/(drawer)/help-support")}>
            <Text style={styles.settingTitle}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={16} color="#7B9AA5" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingRowBtn}>
            <Text style={styles.settingTitle}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color="#7B9AA5" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <View style={styles.settingRowBtn}>
            <Text style={styles.settingTitle}>App Version</Text>
            <Text style={styles.versionText}>1.0.0 (Build 42)</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color="#D94848" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ================= LOGOUT CONFIRMATION MODAL ================= */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconBox}>
              <Ionicons name="log-out-outline" size={28} color="#D94848" />
            </View>
            <Text style={styles.modalTitle}>Log Out</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to log out of CampusFlow?
            </Text>

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
  safeArea: { flex: 1, backgroundColor: "#F4F8F7" },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 8, paddingBottom: 10 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#DCE8E5" },
  logo: { width: 150, height: 35, resizeMode: "contain" },
  badge: { position: "absolute", top: 2, right: 2, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: "#D94848", justifyContent: "center", alignItems: "center", paddingHorizontal: 3 },
  badgeText: { color: "#FFF", fontSize: 9, fontWeight: "700" },
  titleSection: { marginVertical: 12 },
  pageTitle: { fontSize: 22, fontWeight: "800", color: "#102A35" },
  pageSub: { fontSize: 12, color: "#527986", marginTop: 2 },
  profileBanner: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "#DCE8E5", marginBottom: 14, gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#1D7A78", justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  flex1: { flex: 1 },
  profileName: { fontSize: 14, fontWeight: "700", color: "#102A35" },
  profileEmail: { fontSize: 11.5, color: "#527986", marginTop: 2 },
  sectionHeader: { fontSize: 13, fontWeight: "700", color: "#527986", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 10, marginBottom: 8, marginLeft: 2 },
  card: { backgroundColor: "#FFF", borderRadius: 14, borderWidth: 1, borderColor: "#DCE8E5", overflow: "hidden", marginBottom: 12 },
  settingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12 },
  settingRowBtn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 13 },
  settingTextGroup: { flex: 1, paddingRight: 10 },
  settingTitle: { fontSize: 13.5, fontWeight: "600", color: "#102A35" },
  settingDesc: { fontSize: 11.5, color: "#527986", marginTop: 2 },
  divider: { height: 1, backgroundColor: "#F0F5F4" },
  versionText: { fontSize: 12, color: "#7B9AA5", fontWeight: "500" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA", paddingVertical: 12, borderRadius: 12, gap: 6, marginTop: 8 },
  logoutText: { color: "#D94848", fontSize: 13.5, fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(18, 60, 74, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#123C4A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#DCE8E5",
  },
  modalIconBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#102A35",
  },
  modalMessage: {
    fontSize: 13,
    color: "#527986",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 22,
    lineHeight: 18,
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F4F8F7",
    borderWidth: 1,
    borderColor: "#DCE8E5",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#527986",
  },
  modalLogoutBtn: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#D94848",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: "#D94848",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  modalLogoutText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default Settings;
