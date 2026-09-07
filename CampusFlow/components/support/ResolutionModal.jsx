import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const ResolutionModal = ({
  visible,
  ticket,
  onClose,
  onSubmitStatus,
  isSubmitting,
}) => {
  if (!ticket) return null;

  const [status, setStatus] = useState(ticket.status || "Pending");
  const [priority, setPriority] = useState(ticket.priority || "Medium");
  const [notes, setNotes] = useState(ticket.resolutionNotes || "");

  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status || "Pending");
      setPriority(ticket.priority || "Medium");
      setNotes(ticket.resolutionNotes || "");
    }
  }, [ticket]);

  const statusOptions = [
    { id: "Pending", label: "Pending", color: "#E07A28", bg: "#FFF7ED" },
    { id: "In Progress", label: "In Progress", color: "#123C4A", bg: "#EAF3F6" },
    { id: "Resolved", label: "Resolved", color: "#1D7A78", bg: "#EBF9F5" },
  ];

  const priorityOptions = ["Low", "Medium", "High"];

  const handleSave = () => {
    onSubmitStatus(ticket._id, {
      status,
      priority,
      resolutionNotes: notes.trim(),
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="construct-outline" size={22} color="#1D7A78" />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.title}>Update Ticket Status</Text>
              <Text style={styles.subTitle} numberOfLines={1}>
                {ticket.title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#527986" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Status Picker */}
            <Text style={styles.fieldLabel}>Status</Text>
            <View style={styles.pillRow}>
              {statusOptions.map((opt) => {
                const active = status === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.statusPill,
                      active && { backgroundColor: opt.bg, borderColor: opt.color },
                    ]}
                    onPress={() => setStatus(opt.id)}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: active ? opt.color : "#7B9AA5" },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusPillText,
                        active && { color: opt.color, fontWeight: "700" },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Priority Picker */}
            <Text style={styles.fieldLabel}>Priority</Text>
            <View style={styles.pillRow}>
              {priorityOptions.map((p) => {
                const active = priority === p;
                return (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityPill,
                      active && styles.activePriorityPill,
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <Text
                      style={[
                        styles.priorityPillText,
                        active && styles.activePriorityText,
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Resolution Notes Input */}
            <Text style={styles.fieldLabel}>Resolution Remarks / Action Taken</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="e.g. Electrician assigned to inspect switchboard. Replaced damaged wire."
              placeholderTextColor="#7B9AA5"
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
            />

            {/* Reporter Information */}
            <View style={styles.reporterCard}>
              <Text style={styles.reporterHeading}>Reported By</Text>
              <Text style={styles.reporterDetails}>
                {ticket.reporterName || "Campus User"} {ticket.reporterEmail ? `(${ticket.reporterEmail})` : ""}
              </Text>
              {ticket.reporterPhone ? (
                <Text style={styles.reporterDetails}>Phone: {ticket.reporterPhone}</Text>
              ) : null}
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, isSubmitting && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={17} color="#55C6A9" />
                  <Text style={styles.saveBtnText}>Save Status</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(18, 60, 74, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxWidth: 440,
    maxHeight: "85%",
    shadowColor: "#123C4A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#DCE8E5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#E8F5F4",
    justifyContent: "center",
    alignItems: "center",
  },
  flex1: { flex: 1 },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#102A35",
  },
  subTitle: {
    fontSize: 12,
    color: "#527986",
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#102A35",
    marginTop: 12,
    marginBottom: 6,
  },
  pillRow: {
    flexDirection: "row",
    gap: 8,
  },
  statusPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#DCE8E5",
    backgroundColor: "#F4F8F7",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#527986",
  },
  priorityPill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DCE8E5",
    backgroundColor: "#F4F8F7",
  },
  activePriorityPill: {
    backgroundColor: "#123C4A",
    borderColor: "#123C4A",
  },
  priorityPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#527986",
  },
  activePriorityText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#DCE8E5",
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: "#102A35",
    textAlignVertical: "top",
    minHeight: 80,
    backgroundColor: "#F4F8F7",
  },
  reporterCard: {
    backgroundColor: "#F4F8F7",
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#DCE8E5",
  },
  reporterHeading: {
    fontSize: 11,
    fontWeight: "700",
    color: "#527986",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  reporterDetails: {
    fontSize: 12,
    color: "#102A35",
    fontWeight: "500",
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCE8E5",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#527986",
  },
  saveBtn: {
    flex: 2,
    flexDirection: "row",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#1D7A78",
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
