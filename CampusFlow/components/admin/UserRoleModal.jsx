import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const UserRoleModal = ({
  visible,
  user,
  onClose,
  onSaveRole,
  isSaving,
}) => {
  if (!user) return null;

  const [selectedRole, setSelectedRole] = useState(user.role || "User");

  const roles = [
    {
      id: "User",
      label: "General User",
      desc: "Standard access: report issues, track my reports, browse campus feed",
      icon: "person-outline",
      color: "#1D7A78",
      bg: "#E8F5F4",
    },
    {
      id: "Support",
      label: "Support Team",
      desc: "Resolver access: triage queue, update status, write resolution notes",
      icon: "construct-outline",
      color: "#123C4A",
      bg: "#EAF3F6",
    },
    {
      id: "Admin",
      label: "Administrator",
      desc: "Superuser access: user management, master issue delete, full control",
      icon: "shield-checkmark-outline",
      color: "#D94848",
      bg: "#FEF2F2",
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="key-outline" size={22} color="#1D7A78" />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.title}>Assign User Role</Text>
              <Text style={styles.subTitle} numberOfLines={1}>
                {user.fullName || "User"} ({user.email})
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#527986" />
            </TouchableOpacity>
          </View>

          {/* Role options */}
          <View style={styles.optionsList}>
            {roles.map((item) => {
              const isSelected = selectedRole === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.roleCard,
                    isSelected && { borderColor: item.color, backgroundColor: item.bg },
                  ]}
                  onPress={() => setSelectedRole(item.id)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.roleIconBox,
                      { backgroundColor: isSelected ? item.color : "#E2ECE9" },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={18}
                      color={isSelected ? "#FFF" : "#527986"}
                    />
                  </View>
                  <View style={styles.flex1}>
                    <View style={styles.roleTitleRow}>
                      <Text
                        style={[
                          styles.roleLabel,
                          isSelected && { color: item.color, fontWeight: "800" },
                        ]}
                      >
                        {item.label}
                      </Text>
                      {isSelected && (
                        <View
                          style={[styles.activeDot, { backgroundColor: item.color }]}
                        />
                      )}
                    </View>
                    <Text style={styles.roleDesc}>{item.desc}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isSaving}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
              onPress={() => onSaveRole(user._id, selectedRole)}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={16} color="#55C6A9" />
                  <Text style={styles.saveBtnText}>Update Role</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    maxWidth: 420,
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
    fontSize: 17,
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
  optionsList: {
    gap: 10,
    marginVertical: 12,
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#DCE8E5",
    backgroundColor: "#F4F8F7",
    gap: 12,
  },
  roleIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  roleTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#102A35",
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  roleDesc: {
    fontSize: 11,
    color: "#527986",
    marginTop: 3,
    lineHeight: 15,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
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
