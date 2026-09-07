import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
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
import { getSupportTickets, updateTicketStatus } from "@/services/api";
import { ResolutionModal } from "@/components/support/ResolutionModal";

export default function SupportDesk() {
  const navigation = useNavigation();
  const router = useRouter();
  const { user, token, isSupport, updateUserProfile } = useAuth();

  const [activeFilter, setActiveFilter] = useState("All"); // "All" | "Pending" | "In Progress" | "Resolved"
  const [search, setSearch] = useState("");
  const [tickets, setTickets] = useState([]);
  const [metrics, setMetrics] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);

  // Resolution Modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTickets = useCallback(
    async (isRefresh = false) => {
      if (!token) {
        setLoading(false);
        setRefreshing(false);
        return;
      }
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setErrorMsg(null);
        const res = await getSupportTickets(
          {
            status: activeFilter === "All" ? "" : activeFilter,
            search: search.trim(),
          },
          token
        );

        if (res?.tickets) setTickets(res.tickets);
        if (res?.metrics) setMetrics(res.metrics);
      } catch (error) {
        console.error("fetchTickets error:", error);
        setErrorMsg(error.message || "Failed to fetch support tickets");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, activeFilter, search]
  );

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [fetchTickets])
  );

  const onRefresh = () => {
    fetchTickets(true);
  };

  const handleOpenModal = (ticket) => {
    setSelectedTicket(ticket);
    setModalVisible(true);
  };

  const handleUpdateStatus = async (ticketId, updateData) => {
    try {
      setIsSubmitting(true);
      await updateTicketStatus(ticketId, updateData, token);
      Alert.alert("Updated", `Ticket status updated to ${updateData.status}`);
      setModalVisible(false);
      fetchTickets();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitStatus = handleUpdateStatus;

  const handleQuickStart = async (ticketOrId) => {
    const ticketId = typeof ticketOrId === "object" ? ticketOrId?._id : ticketOrId;
    if (!ticketId) return;
    const ticketObj = tickets.find((t) => t._id === ticketId);
    try {
      await updateTicketStatus(
        ticketId,
        {
          status: "In Progress",
          resolutionNotes: ticketObj?.resolutionNotes || "Work started by support team.",
        },
        token
      );
      Alert.alert("Status Updated", "Issue marked as In Progress");
      fetchTickets();
    } catch (error) {
      Alert.alert("Error", error.message || "Could not update status");
    }
  };

  const handleQuickStartWork = handleQuickStart;

  const handleSwitchToSupport = async () => {
    try {
      setIsSwitchingRole(true);
      await updateUserProfile({ role: "Support" });
      Alert.alert("Role Updated", "You now have Support Team staff access.");
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to switch role");
    } finally {
      setIsSwitchingRole(false);
    }
  };

  // Security check for non-support team
  if (!isSupport) {
    return (
      <SafeAreaView edges={["top", "bottom", "left", "right"]} style={styles.safeArea}>
        <View style={styles.deniedContainer}>
          <View style={styles.deniedIconBox}>
            <Ionicons name="construct-outline" size={48} color="#1D7A78" />
          </View>
          <Text style={styles.deniedTitle}>Support Desk Restricted</Text>
          <Text style={styles.deniedSub}>
            This triage console is designated for Support Team staff. Your current role is{" "}
            <Text style={{ fontWeight: "700" }}>{user?.role || "User"}</Text>.
          </Text>

          <TouchableOpacity
            style={styles.switchRoleBtn}
            onPress={handleSwitchToSupport}
            disabled={isSwitchingRole}
          >
            {isSwitchingRole ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Ionicons name="swap-horizontal" size={18} color="#FFF" />
                <Text style={styles.switchRoleBtnText}>Switch to Support Role (Staff Access)</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace("/(drawer)/(tabs)")}
          >
            <Ionicons name="arrow-back" size={18} color="#1D7A78" />
            <Text style={styles.backBtnText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const filterTabs = [
    { id: "All", label: "All Tickets", count: metrics.total },
    { id: "Pending", label: "Pending", count: metrics.pending, color: "#E07A28" },
    { id: "In Progress", label: "In Progress", count: metrics.inProgress, color: "#123C4A" },
    { id: "Resolved", label: "Resolved", count: metrics.resolved, color: "#2EA885" },
  ];

  const getStatusBadge = (status) => {
    const s = (status || "Pending").toLowerCase().trim();
    if (s === "resolved") return { bg: "#E8F8F4", col: "#2EA885" };
    if (s === "in progress") return { bg: "#E8F5F4", col: "#123C4A" };
    return { bg: "#FFF5EC", col: "#E07A28" };
  };

  return (
    <SafeAreaView edges={["top", "bottom", "left", "right"]} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F8F7" />

      {/* Header */}
      <View style={styles.topHeader}>
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={styles.menuBtn}
          >
            <Ionicons name="menu-outline" size={24} color="#102A35" />
          </TouchableOpacity>

          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle}>Support Desk</Text>
            <View style={styles.supportBadge}>
              <Ionicons name="construct" size={12} color="#1D7A78" />
              <Text style={styles.supportBadgeText}>Support Team</Text>
            </View>
          </View>

          <TouchableOpacity onPress={onRefresh} style={styles.menuBtn}>
            <Ionicons name="refresh-outline" size={20} color="#102A35" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#7B9AA5" />
          <TextInput
            placeholder="Search tickets by title, location..."
            placeholderTextColor="#7B9AA5"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => fetchTickets()}
            returnKeyType="search"
            style={styles.searchInput}
          />
          {search ? (
            <TouchableOpacity onPress={() => { setSearch(""); fetchTickets(); }}>
              <Ionicons name="close-circle" size={18} color="#7B9AA5" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Tabs */}
        <FlatList
          horizontal
          data={filterTabs}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsList}
          renderItem={({ item }) => {
            const active = activeFilter === item.id;
            return (
              <TouchableOpacity
                style={[styles.filterPill, active && styles.filterPillActive]}
                onPress={() => setActiveFilter(item.id)}
              >
                <Text
                  style={[styles.filterPillText, active && styles.filterPillTextActive]}
                >
                  {item.label} ({item.count || 0})
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Ticket List */}
      {loading && !refreshing ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#1D7A78" />
          <Text style={styles.loadingText}>Loading assigned tickets...</Text>
        </View>
      ) : errorMsg ? (
        <View style={styles.centerBox}>
          <Ionicons name="alert-circle-outline" size={44} color="#D94848" />
          <Text style={styles.errorTitle}>Failed to Load Tickets</Text>
          <Text style={styles.errorSub}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchTickets()}>
            <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#1D7A78"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="shield-checkmark-outline" size={48} color="#55C6A9" />
              <Text style={styles.emptyTitle}>No Tickets Found</Text>
              <Text style={styles.emptySub}>
                {activeFilter === "All"
                  ? "Great job! There are no campus issues in the queue."
                  : `No tickets found with status: "${activeFilter}"`}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const statusTheme = getStatusBadge(item.status);
            const isPending = item.status?.toLowerCase() === "pending";

            return (
              <View style={styles.ticketCard}>
                {/* Category & Status */}
                <View style={styles.ticketHeader}>
                  <View style={styles.catBadge}>
                    <Ionicons name="pricetag-outline" size={12} color="#123C4A" />
                    <Text style={styles.catText}>{item.category || "General"}</Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: statusTheme.bg }]}>
                    <Text style={[styles.statusText, { color: statusTheme.col }]}>
                      {item.status || "Pending"}
                    </Text>
                  </View>
                </View>

                {/* Title & Desc */}
                <Text style={styles.ticketTitle}>{item.title}</Text>
                <Text style={styles.ticketDesc} numberOfLines={2}>
                  {item.description}
                </Text>

                {/* Meta details */}
                <View style={styles.metaBox}>
                  <View style={styles.metaRow}>
                    <Ionicons name="location-outline" size={13} color="#527986" />
                    <Text style={styles.metaText}>
                      {typeof item.location === "object"
                        ? item.location?.address || "Campus"
                        : item.location || "Campus"}
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Ionicons name="person-outline" size={13} color="#527986" />
                    <Text style={styles.metaText}>
                      Reporter: {item.reporterName || item.reporterEmail || "Student"}
                    </Text>
                  </View>
                  {item.priority ? (
                    <View style={styles.metaRow}>
                      <Ionicons name="flag-outline" size={13} color="#527986" />
                      <Text style={styles.metaText}>Priority: {item.priority}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Resolution notes preview if any */}
                {item.resolutionNotes ? (
                  <View style={styles.notesPreview}>
                    <Ionicons name="chatbox-ellipses-outline" size={14} color="#1D7A78" />
                    <Text style={styles.notesText} numberOfLines={2}>
                      <Text style={{ fontWeight: "700" }}>Latest update: </Text>
                      {item.resolutionNotes}
                    </Text>
                  </View>
                ) : null}

                {/* Action Buttons */}
                <View style={styles.ticketActions}>
                  {isPending ? (
                    <TouchableOpacity
                      style={styles.quickStartBtn}
                      onPress={() => handleQuickStart(item._id)}
                    >
                      <Ionicons name="play" size={14} color="#1D7A78" />
                      <Text style={styles.quickStartText}>Start Work</Text>
                    </TouchableOpacity>
                  ) : null}

                  <TouchableOpacity
                    style={styles.updateStatusBtn}
                    onPress={() => handleOpenModal(item)}
                  >
                    <Ionicons name="options-outline" size={15} color="#FFFFFF" />
                    <Text style={styles.updateStatusText}>Update Status</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Resolution & Status Update Modal */}
      <ResolutionModal
        visible={modalVisible}
        ticket={selectedTicket}
        onClose={() => setModalVisible(false)}
        onSubmitStatus={handleUpdateStatus}
        isSubmitting={isSubmitting}
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
    marginBottom: 10,
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
  supportBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E8F5F4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#9CD4D1",
  },
  supportBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1D7A78",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE8E5",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#102A35",
  },
  filterTabsList: {
    gap: 8,
    paddingBottom: 4,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE8E5",
  },
  filterPillActive: {
    backgroundColor: "#1D7A78",
    borderColor: "#1D7A78",
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#527986",
  },
  filterPillTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  ticketCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#DCE8E5",
    shadowColor: "rgba(18, 60, 74, 0.05)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  catBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E8F5F4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#123C4A",
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  ticketTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#102A35",
    marginBottom: 4,
  },
  ticketDesc: {
    fontSize: 12,
    color: "#527986",
    lineHeight: 16,
    marginBottom: 8,
  },
  metaBox: {
    backgroundColor: "#F4F8F7",
    borderRadius: 10,
    padding: 8,
    gap: 4,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    color: "#527986",
  },
  notesPreview: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: "#E8F5F4",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 11,
    color: "#1D7A78",
    flex: 1,
    lineHeight: 15,
  },
  ticketActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  quickStartBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E8F5F4",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  quickStartText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1D7A78",
  },
  updateStatusBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#1D7A78",
    paddingVertical: 8,
    borderRadius: 10,
  },
  updateStatusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: "#527986",
    fontWeight: "600",
  },
  emptyBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCE8E5",
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#102A35",
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: "#527986",
    marginTop: 4,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#102A35",
    marginTop: 8,
  },
  errorSub: {
    fontSize: 12,
    color: "#527986",
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1D7A78",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
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
    backgroundColor: "#E8F5F4",
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
  switchRoleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1D7A78",
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 12,
    marginBottom: 12,
  },
  switchRoleBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCE8E5",
  },
  backBtnText: {
    color: "#1D7A78",
    fontWeight: "700",
    fontSize: 14,
  },
});
