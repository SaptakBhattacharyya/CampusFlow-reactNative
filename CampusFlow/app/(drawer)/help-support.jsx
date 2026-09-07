import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Image, TouchableOpacity, Linking, Alert, Platform, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { useRouter } from "expo-router";

const faqData = [
  {
    id: "1",
    q: "How do I report a new campus issue?",
    a: "Tap the '+ Report' tab or the floating action button on any screen, select a category, add title & description, and submit.",
  },
  {
    id: "2",
    q: "How long does it take for issues to be resolved?",
    a: "High-priority issues (water, electricity) are inspected within 2-4 hours. General maintenance requests take 24-48 hours.",
  },
  {
    id: "3",
    q: "How does the issue support system work?",
    a: "Students can upvote/support existing issues. Issues with higher community support are escalated automatically to campus authorities.",
  },
  {
    id: "4",
    q: "Where can I track my submitted issues?",
    a: "Open the Drawer Menu and tap 'My Reports' to see live status updates (Pending, In Progress, Resolved).",
  },
];

const contactChannels = [
  { id: "1", title: "Campus Helpline", sub: "+91 674 2725113", icon: "call", color: "#1D7A78", bg: "#E8F5F4", action: () => Linking.openURL("tel:+916742725113") },
  { id: "2", title: "Email Support", sub: "support@campusflow.edu", icon: "mail", color: "#123C4A", bg: "#EAF3F6", action: () => Linking.openURL("mailto:support@campusflow.edu") },
  { id: "3", title: "Control Room", sub: "Admin Block • Room 102", icon: "location", color: "#2EA885", bg: "#EBF9F5", action: () => {} },
  { id: "4", title: "Emergency SOS", sub: "24/7 Security Desk", icon: "shield-checkmark", color: "#D94848", bg: "#FEF2F2", action: () => Linking.openURL("tel:112") },
];

const HelpSupport = () => {
  const navigation = useNavigation();
  const router = useRouter();

  const [expandedFaq, setExpandedFaq] = useState("1");
  const [feedbackSubject, setFeedbackSubject] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const toggleFaq = (id) => {
    setExpandedFaq((prev) => (prev === id ? null : id));
  };

  const handleSendFeedback = () => {
    if (!feedbackMsg.trim()) {
      Alert.alert("Required", "Please enter your message before sending.");
      return;
    }
    Alert.alert("Message Sent", "Thank you! The campus support team will get back to you shortly.");
    setFeedbackSubject("");
    setFeedbackMsg("");
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

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Help & Support</Text>
          <Text style={styles.pageSub}>Find answers or get in touch with campus support.</Text>
        </View>

        {/* Emergency Hotline Banner */}
        <View style={styles.emergencyBanner}>
          <View style={styles.emergencyIconBg}>
            <Ionicons name="warning" size={20} color="#D94848" />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.emergencyTitle}>Campus Emergency?</Text>
            <Text style={styles.emergencySub}>For urgent safety, fire or medical emergencies.</Text>
          </View>
          <TouchableOpacity style={styles.emergencyBtn} onPress={() => Linking.openURL("tel:112")}>
            <Text style={styles.emergencyBtnText}>Call SOS</Text>
          </TouchableOpacity>
        </View>

        {/* Support Channels Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Contact Channels</Text>
        </View>
        <View style={styles.channelsGrid}>
          {contactChannels.map((item) => (
            <TouchableOpacity key={item.id} style={styles.channelCard} onPress={item.action} activeOpacity={0.7}>
              <View style={[styles.channelIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.channelTitle}>{item.title}</Text>
              <Text style={styles.channelSub} numberOfLines={1}>{item.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQs Accordion */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        </View>
        <View style={styles.faqContainer}>
          {faqData.map((faq) => {
            const isExpanded = expandedFaq === faq.id;
            return (
              <TouchableOpacity
                key={faq.id}
                style={[styles.faqCard, isExpanded && styles.faqCardExpanded]}
                onPress={() => toggleFaq(faq.id)}
                activeOpacity={0.8}
              >
                <View style={styles.faqQuestionRow}>
                  <Text style={styles.faqQuestion}>{faq.q}</Text>
                  <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color="#7B9AA5" />
                </View>
                {isExpanded && <Text style={styles.faqAnswer}>{faq.a}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Send Us a Message Form */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Send Support a Message</Text>
        </View>
        <View style={styles.formCard}>
          <TextInput
            placeholder="Subject (e.g. App issue, feedback)"
            placeholderTextColor="#7B9AA5"
            value={feedbackSubject}
            onChangeText={setFeedbackSubject}
            style={styles.input}
          />
          <TextInput
            placeholder="Describe your question or issue in detail..."
            placeholderTextColor="#7B9AA5"
            value={feedbackMsg}
            onChangeText={setFeedbackMsg}
            multiline
            numberOfLines={4}
            style={[styles.input, styles.textArea]}
          />
          <TouchableOpacity style={styles.submitBtn} onPress={handleSendFeedback} activeOpacity={0.8}>
            <Ionicons name="paper-plane-outline" size={16} color="#55C6A9" />
            <Text style={styles.submitBtnText}>Submit Message</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
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
  emergencyBanner: { flexDirection: "row", alignItems: "center", backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA", borderRadius: 14, padding: 12, marginBottom: 14 },
  emergencyIconBg: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FEE2E2", justifyContent: "center", alignItems: "center", marginRight: 10 },
  flex1: { flex: 1 },
  emergencyTitle: { fontSize: 13, fontWeight: "700", color: "#991B1B" },
  emergencySub: { fontSize: 11, color: "#B91C1C", marginTop: 1 },
  emergencyBtn: { backgroundColor: "#D94848", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  emergencyBtnText: { color: "#FFF", fontSize: 11.5, fontWeight: "700" },
  sectionHeader: { marginVertical: 8 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#102A35" },
  channelsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  channelCard: { width: "48%", backgroundColor: "#FFF", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "#DCE8E5" },
  channelIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  channelTitle: { fontSize: 13, fontWeight: "700", color: "#102A35" },
  channelSub: { fontSize: 11, color: "#527986", marginTop: 2 },
  faqContainer: { gap: 8, marginBottom: 14 },
  faqCard: { backgroundColor: "#FFF", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#DCE8E5" },
  faqCardExpanded: { borderColor: "#1D7A78" },
  faqQuestionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  faqQuestion: { fontSize: 13, fontWeight: "600", color: "#102A35", flex: 1, paddingRight: 8 },
  faqAnswer: { fontSize: 12, color: "#527986", marginTop: 8, lineHeight: 17, borderTopWidth: 1, borderTopColor: "#F0F5F4", paddingTop: 6 },
  formCard: { backgroundColor: "#FFF", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#DCE8E5", gap: 10 },
  input: { backgroundColor: "#F4F8F7", borderWidth: 1, borderColor: "#DCE8E5", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 12.5, color: "#102A35" },
  textArea: { height: 80, textAlignVertical: "top" },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#1D7A78", paddingVertical: 10, borderRadius: 10, gap: 6 },
  submitBtnText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
});

export default HelpSupport;
