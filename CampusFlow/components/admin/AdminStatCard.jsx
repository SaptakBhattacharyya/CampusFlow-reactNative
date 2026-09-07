import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const AdminStatCard = ({ title, value, icon, color, bg, subtitle }) => {
  return (
    <View style={[styles.card, { borderColor: `${color}30` }]}>
      <View style={styles.topRow}>
        <View style={[styles.iconContainer, { backgroundColor: bg }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={[styles.value, { color }]}>{value}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    flex: 1,
    minWidth: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 10,
    shadowColor: "#123C4A",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  value: {
    fontSize: 22,
    fontWeight: "800",
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: "#102A35",
  },
  subtitle: {
    fontSize: 11,
    color: "#527986",
    marginTop: 2,
  },
});
