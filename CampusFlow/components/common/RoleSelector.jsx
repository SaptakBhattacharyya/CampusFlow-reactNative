import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const RoleSelector = ({ selectedRole, onSelectRole, title = "Select Access Role" }) => {
  const roles = [
    {
      id: "User",
      label: "General User",
      subtitle: "Student / Faculty",
      icon: "person-outline",
      activeIcon: "person",
      color: "#1D7A78",
      bg: "#E8F8F4",
      borderColor: "#55C6A9",
    },
    {
      id: "Support",
      label: "Support Team",
      subtitle: "Staff / Resolver",
      icon: "construct-outline",
      activeIcon: "construct",
      color: "#123C4A",
      bg: "#E8F5F4",
      borderColor: "#1D7A78",
    },
    {
      id: "Admin",
      label: "Administrator",
      subtitle: "Full System Control",
      icon: "shield-checkmark-outline",
      activeIcon: "shield-checkmark",
      color: "#D94848",
      bg: "#FDF0F0",
      borderColor: "#FECACA",
    },
  ];

  return (
    <View style={styles.container}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <View style={styles.rolesRow}>
        {roles.map((item) => {
          const isSelected = selectedRole === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.rolePill,
                isSelected && {
                  backgroundColor: item.bg,
                  borderColor: item.borderColor,
                  borderWidth: 1.5,
                },
              ]}
              onPress={() => onSelectRole(item.id)}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: isSelected ? item.color : "#F4F8F7" },
                ]}
              >
                <Ionicons
                  name={isSelected ? item.activeIcon : item.icon}
                  size={16}
                  color={isSelected ? (item.id === "User" ? "#FFFFFF" : "#FFFFFF") : "#527986"}
                />
              </View>
              <Text
                style={[
                  styles.roleLabel,
                  isSelected && { color: item.color, fontWeight: "800" },
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
              <Text style={styles.roleSub} numberOfLines={1}>
                {item.subtitle}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#527986",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  rolesRow: {
    flexDirection: "row",
    gap: 8,
  },
  rolePill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCE8E5",
    backgroundColor: "#FFFFFF",
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#102A35",
    textAlign: "center",
  },
  roleSub: {
    fontSize: 9.5,
    color: "#527986",
    marginTop: 2,
    textAlign: "center",
  },
});
