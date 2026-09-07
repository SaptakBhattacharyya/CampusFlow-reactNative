import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Platform, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { useRouter } from "expo-router";

const initialNotifications = [
  {
    id: "1",
    type: "support",
    title: "Your report has been updated",
    message: "The engineering team has started working on the projector issue.",
    time: "2 min ago",
    read: false,
  },
  {
    id: "2",
    type: "comment",
    title: "New comment on your post",
    message: "Raj commented: 'I support this issue. It needs immediate attention.'",
    time: "15 min ago",
    read: false,
  },
  {
    id: "3",
    type: "status",
    title: "Issue resolved",
    message: "The water leakage in Hostel B has been resolved by the maintenance team.",
    time: "1h ago",
    read: true,
  },
  {
    id: "4",
    type: "support",
    title: "10 people support your report",
    message: "Your report on classroom lights has gained 10 supporters.",
    time: "3h ago",
    read: true,
  },
  {
    id: "5",
    type: "promotion",
    title: "Campus cleanliness drive",
    message: "Join the cleanliness drive this Saturday at 8 AM. Free breakfast for volunteers!",
    time: "1d ago",
    read: true,
  },
];

const Notifications = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIconConfig = (type) => {
    switch (type) {
      case "promotion":
        return { name: "megaphone-outline", color: "#1D7A78", bg: "#E8F5F4" };
      case "comment":
        return { name: "chatbubble-outline", color: "#E07A28", bg: "#FFF7ED" };
      case "status":
        return { name: "checkmark-circle-outline", color: "#2EA885", bg: "#EBF9F5" };
      default:
        return { name: "alert-circle-outline", color: "#123C4A", bg: "#EAF3F6" };
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView edges={["top", "bottom", "left", "right"]} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F8F7" />
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={styles.iconBtn}
          >
            <Ionicons name="menu-outline" size={24} color="#123C4A" />
          </TouchableOpacity>
          <Image source={require("@/assets/images/logo.png")} style={styles.logo} />
          <TouchableOpacity style={styles.iconBtn} onPress={markAllAsRead}>
            <Ionicons name="checkmark-done-outline" size={22} color="#123C4A" />
          </TouchableOpacity>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.flex1}>
            <Text style={styles.pageTitle}>Notifications</Text>
            <Text style={styles.pageSub}>Stay updated with your campus activities.</Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} style={styles.markReadBtn}>
              <Text style={styles.markReadText}>Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notifications List */}
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const iconConfig = getIconConfig(item.type);
            return (
              <TouchableOpacity
                style={[styles.card, !item.read && styles.unreadCard]}
                activeOpacity={0.7}
                onPress={() => {
                  setNotifications((prev) =>
                    prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
                  );
                }}
              >
                <View style={[styles.iconBg, { backgroundColor: iconConfig.bg }]}>
                  <Ionicons name={iconConfig.name} size={22} color={iconConfig.color} />
                </View>

                <View style={styles.contentContainer}>
                  <View style={styles.rowBetween}>
                    <Text style={[styles.cardTitle, !item.read && styles.unreadTitle]}>
                      {item.title}
                    </Text>
                    {!item.read && <View style={styles.dot} />}
                  </View>
                  <Text style={styles.cardMessage} numberOfLines={2}>
                    {item.message}
                  </Text>
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F8F7" },
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
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
  titleSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  flex1: { flex: 1 },
  pageTitle: { fontSize: 24, fontWeight: "800", color: "#102A35" },
  pageSub: { fontSize: 13, color: "#527986", marginTop: 2 },
  markReadBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  markReadText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1D7A78",
  },
  listContent: { padding: 16, gap: 10 },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 14,
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: "#DCE8E5",
    shadowColor: "#123C4A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  unreadCard: {
    backgroundColor: "#F8FBFA",
    borderColor: "#BFEADB",
  },
  iconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: { flex: 1 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: { fontSize: 14, fontWeight: "600", color: "#102A35", flex: 1, paddingRight: 6 },
  unreadTitle: { fontWeight: "700", color: "#102A35" },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#55C6A9" },
  cardMessage: { fontSize: 12.5, color: "#527986", lineHeight: 17 },
  timeText: { fontSize: 11, color: "#7B9AA5", marginTop: 6, fontWeight: "500" },
});

export default Notifications;
