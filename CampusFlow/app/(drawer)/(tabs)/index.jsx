import { View, Text, StyleSheet, ScrollView, FlatList, Image, ImageBackground, TouchableOpacity, Platform, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { getAllIssues } from "../../../services/api";
import { useAuth } from "@/context/AuthContext";
// const overviewData = [
//   { id: "1", count: "24", title: "Total Issues", subtitle: "All reported issues", icon: "clipboard-outline", color: "#2563EB", bg: "#EFF6FF" },
//   { id: "2", count: "08", title: "Pending", subtitle: "Awaiting action", icon: "hourglass-outline", color: "#EA580C", bg: "#FFF7ED" },
//   { id: "3", count: "10", title: "In Progress", subtitle: "Being worked on", icon: "sync-outline", color: "#7C3AED", bg: "#FAF5FF" },
//   { id: "4", count: "06", title: "Resolved", subtitle: "Successfully resolved", icon: "checkmark-circle-outline", color: "#16A34A", bg: "#F0FDF4" },
// ];

const priorityIssues = [
  { id: "1", title: "Projector not working", location: "Engineering Block • Room 204", supporters: "12 supporting", time: "2h ago" },
  { id: "2", title: "Water supply problem", location: "Hostel Block B", supporters: "8 supporting", time: "3h ago" },
  { id: "3", title: "Classroom lights not working", location: "Block C • Room 101", supporters: "7 supporting", time: "5h ago" },
];

const nearbyIssues = [
  { id: "1", title: "Broken Street Light", location: "Near Main Gate", distance: "350m ›" },
  { id: "2", title: "Water Leakage", location: "Hostel Block B", distance: "600m ›" },
  { id: "3", title: "Wi-Fi not working", location: "Library Building", distance: "750m ›" },
];

const supportedIssues = [
  { id: "1", title: "Classroom lights not working", count: "32 supports" },
  { id: "2", title: "Water shortage in Hostel B", count: "27 supports" },
  { id: "3", title: "Broken benches in Block C", count: "19 supports" },
];

const Home = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { user } = useAuth();
  const [overviewData, setOverviewData] = useState([
    { id: "1", count: "0", title: "Total Issues", subtitle: "All reported issues", icon: "clipboard-outline", color: "#1D7A78", bg: "#E8F5F4" },
    { id: "2", count: "0", title: "Pending", subtitle: "Awaiting action", icon: "hourglass-outline", color: "#E07A28", bg: "#FFF5EC" },
    { id: "3", count: "0", title: "In Progress", subtitle: "Being worked on", icon: "sync-outline", color: "#123C4A", bg: "#E8F5F4" },
    { id: "4", count: "0", title: "Resolved", subtitle: "Successfully resolved", icon: "checkmark-circle-outline", color: "#2EA885", bg: "#E8F8F4" },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllIssues();
        console.log("issues response:", data);
        const issuesList = Array.isArray(data) ? data : (data?.issues || []);
        
        const totalIssues = issuesList.length;
        const pendingIssues = issuesList.filter(
          (issue) => issue.status === "Pending" || issue.status?.toLowerCase() === "pending"
        ).length;
        const inProgressIssues = issuesList.filter(
          (issue) =>
            issue.status === "In Progress" ||
            issue.status?.toLowerCase() === "in progress" ||
            issue.status?.toLowerCase() === "in_progress"
        ).length;
        const resolvedIssues = issuesList.filter(
          (issue) => issue.status === "Resolved" || issue.status?.toLowerCase() === "resolved"
        ).length;

        setOverviewData([
          { id: "1", count: totalIssues.toString(), title: "Total Issues", subtitle: "All reported issues", icon: "clipboard-outline", color: "#1D7A78", bg: "#E8F5F4" },
          { id: "2", count: pendingIssues.toString(), title: "Pending", subtitle: "Awaiting action", icon: "hourglass-outline", color: "#E07A28", bg: "#FFF5EC" },
          { id: "3", count: inProgressIssues.toString(), title: "In Progress", subtitle: "Being worked on", icon: "sync-outline", color: "#123C4A", bg: "#E8F5F4" },
          { id: "4", count: resolvedIssues.toString(), title: "Resolved", subtitle: "Successfully resolved", icon: "checkmark-circle-outline", color: "#2EA885", bg: "#E8F8F4" },
        ]);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchData();
  }, []);
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* ================= PART 1: HEADER & GREETING ================= */}
        <ImageBackground source={require("@/assets/images/campus-bg.jpg")} style={styles.heroBg} imageStyle={styles.heroImg}>
          <View style={styles.heroOverlay}>
            <View style={styles.rowBetween}>
              <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.iconBtn}>
                <Ionicons name="menu-outline" size={26} color="#102A35" />
              </TouchableOpacity>
              <Image source={require("@/assets/images/logo.png")} style={styles.logo} />
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => router.push("/(drawer)/notifications")}
              >
                <Ionicons name="notifications-outline" size={24} color="#102A35" />
                <View style={styles.badge} />
              </TouchableOpacity>
            </View>

            <View style={styles.greetingRow}>
              <View style={styles.flex1}>
                <Text style={styles.greetingTitle}>
                  Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {user?.fullName ? user.fullName.split(" ")[0] : "Student"}!
                </Text>
                <Text style={styles.greetingSub}>Let's make our campus better today.</Text>
              </View>
              <View style={styles.locationCard}>
                <Ionicons name="location" size={18} color="#1D7A78" />
                <View style={styles.locationTextGroup}>
                  <Text style={styles.locationLabel}>Your Campus</Text>
                  <Text style={styles.locationValue} numberOfLines={1}>
                    {user?.university || "Campus Community"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.body}>
          {/* ================= PART 2: CAMPUS OVERVIEW ================= */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Campus Overview</Text>
            <TouchableOpacity><Text style={styles.linkText}>View analytics</Text></TouchableOpacity>
          </View>

          <FlatList
            horizontal
            data={overviewData}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.gap10}
            renderItem={({ item }) => (
              <View style={styles.overviewCard}>
                <View style={[styles.circleIcon, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <Text style={[styles.overviewNum, { color: item.color }]}>{item.count}</Text>
                <Text style={styles.overviewCardTitle}>{item.title}</Text>
                <Text style={styles.overviewCardSub}>{item.subtitle}</Text>
              </View>
            )}
          />

          {/* ================= PART 3: HIGH PRIORITY ISSUES ================= */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>High Priority Issues</Text>
            <TouchableOpacity><Text style={styles.linkText}>View all</Text></TouchableOpacity>
          </View>

          <FlatList
            horizontal
            data={priorityIssues}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.gap12}
            renderItem={({ item }) => (
              <View style={styles.priorityCard}>
                <View style={styles.priorityTop}>
                  <View style={styles.alertIconBg}>
                    <Ionicons name="alert" size={16} color="#D94848" />
                  </View>
                  <View style={styles.flex1}>
                    <Text style={styles.priorityTitle}>{item.title}</Text>
                    <Text style={styles.locationText}>{item.location}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#7B9AA5" />
                </View>
                <View style={styles.highBadge}>
                  <Text style={styles.highBadgeText}>High</Text>
                </View>
                <View style={styles.priorityFooter}>
                  <View style={styles.rowCenter}><Ionicons name="people-outline" size={13} color="#527986" /><Text style={styles.metaText}>{item.supporters}</Text></View>
                  <View style={styles.rowCenter}><Ionicons name="time-outline" size={13} color="#527986" /><Text style={styles.metaText}>{item.time}</Text></View>
                </View>
              </View>
            )}
          />

          {/* ================= PART 4: ISSUES LISTS & REPORT CTA ================= */}
          <View style={styles.listsContainer}>
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Issues Near You</Text>
                <TouchableOpacity><Text style={styles.linkText}>View all</Text></TouchableOpacity>
              </View>
              <View style={styles.cardBox}>
                <FlatList
                  data={nearbyIssues}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View style={styles.divider} />}
                  renderItem={({ item }) => (
                    <View style={styles.listItem}>
                      <View style={styles.greenIconBg}>
                        <Ionicons name="location" size={14} color="#1D7A78" />
                      </View>
                      <View style={styles.flex1}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text style={styles.locationText}>{item.location}</Text>
                      </View>
                      <Text style={styles.distText}>{item.distance}</Text>
                    </View>
                  )}
                />
              </View>
            </View>

            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Most Supported Issues</Text>
                <TouchableOpacity><Text style={styles.linkText}>View all</Text></TouchableOpacity>
              </View>
              <View style={styles.cardBox}>
                <FlatList
                  data={supportedIssues}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View style={styles.divider} />}
                  renderItem={({ item }) => (
                    <View style={styles.listItem}>
                      <View style={styles.orangeIconBg}>
                        <Ionicons name="flame" size={14} color="#E07A28" />
                      </View>
                      <Text style={[styles.itemTitle, styles.flex1]}>{item.title}</Text>
                      <Text style={styles.supportCount}>{item.count}</Text>
                    </View>
                  )}
                />
              </View>
            </View>
          </View>

          <View style={styles.ctaBanner}>
            <View style={styles.plusIconBg}>
              <Ionicons name="add" size={26} color="#FFF" />
            </View>
            <View style={styles.ctaTextContainer}>
              <Text style={styles.ctaTitle}>Report a Campus Issue</Text>
              <Text style={styles.ctaSub}>Help improve your campus by reporting issues.</Text>
            </View>
            <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push("/report")}>
              <Text style={styles.ctaBtnText}>Report Now</Text>
              <Ionicons name="arrow-forward" size={13} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F8F7" },
  scrollContent: { paddingBottom: 30 },
  heroBg: { width: "100%", paddingTop: 8 },
  heroImg: { opacity: 0.15 },
  heroOverlay: { paddingHorizontal: 16, paddingBottom: 16 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowCenter: { flexDirection: "row", alignItems: "center", gap: 4 },
  flex1: { flex: 1 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.9)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#DCE8E5" },
  logo: { width: 160, height: 38, resizeMode: "contain" },
  badge: { position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: "#D94848" },
  greetingTitle: { fontSize: 20, fontWeight: "800", color: "#102A35" },
  greetingSub: { fontSize: 13, color: "#527986", marginTop: 2, fontWeight: "500" },
  locationCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: "#DCE8E5", elevation: 2, maxWidth: 170 },
  locationTextGroup: { marginLeft: 6, flexShrink: 1 },
  locationLabel: { fontSize: 10, color: "#527986", fontWeight: "600" },
  locationValue: { fontSize: 11, fontWeight: "700", color: "#102A35" },
  body: { paddingHorizontal: 16, marginTop: 10 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#102A35" },
  linkText: { fontSize: 12, fontWeight: "600", color: "#1D7A78" },
  gap10: { gap: 10 },
  gap12: { gap: 12 },
  overviewCard: { width: 120, backgroundColor: "#FFF", borderRadius: 16, padding: 12, borderWidth: 1, borderColor: "#DCE8E5", elevation: 1 },
  circleIcon: { width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  overviewNum: { fontSize: 22, fontWeight: "800", marginBottom: 2 },
  overviewCardTitle: { fontSize: 13, fontWeight: "700", color: "#102A35" },
  overviewCardSub: { fontSize: 10, color: "#527986" },
  priorityCard: { width: 240, backgroundColor: "#FFF", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#DCE8E5", elevation: 1 },
  priorityTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  alertIconBg: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#FDF0F0", justifyContent: "center", alignItems: "center", marginRight: 10 },
  priorityTitle: { fontSize: 13, fontWeight: "700", color: "#102A35" },
  locationText: { fontSize: 11, color: "#527986", marginTop: 2 },
  highBadge: { alignSelf: "flex-start", backgroundColor: "#FDF0F0", borderColor: "#FECACA", borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginVertical: 8 },
  highBadgeText: { color: "#D94848", fontSize: 10, fontWeight: "700" },
  priorityFooter: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#DCE8E5", paddingTop: 8 },
  metaText: { fontSize: 11, color: "#527986" },
  listsContainer: { marginTop: 14, gap: 12 },
  cardBox: { backgroundColor: "#FFF", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 4, borderWidth: 1, borderColor: "#DCE8E5", elevation: 1 },
  listItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10 },
  greenIconBg: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#E8F8F4", justifyContent: "center", alignItems: "center", marginRight: 10 },
  orangeIconBg: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#FFF5EC", justifyContent: "center", alignItems: "center", marginRight: 10 },
  itemTitle: { fontSize: 13, fontWeight: "600", color: "#102A35" },
  distText: { fontSize: 12, fontWeight: "600", color: "#1D7A78" },
  supportCount: { fontSize: 12, color: "#527986" },
  divider: { height: 1, backgroundColor: "#DCE8E5" },
  ctaBanner: { flexDirection: "row", alignItems: "center", backgroundColor: "#E8F5F4", borderRadius: 16, padding: 12, marginTop: 16, borderWidth: 1, borderColor: "#DCE8E5" },
  plusIconBg: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#1D7A78", justifyContent: "center", alignItems: "center", marginRight: 10 },
  ctaTextContainer: { flex: 1, paddingRight: 6 },
  ctaTitle: { fontSize: 13, fontWeight: "700", color: "#102A35" },
  ctaSub: { fontSize: 11, color: "#527986" },
  ctaBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#1D7A78", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 4 },
  ctaBtnText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
});

export default Home;