import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

type FontAwesome5IconName = React.ComponentProps<typeof FontAwesome5>["name"];

interface InfoCardProps {
  icon: FontAwesome5IconName;
  title: string;
  text: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ icon, title, text }) => {
  return (
    <View style={styles.infoBox}>
      <FontAwesome5 name={icon} size={18} color="#4E8D7C" />
      <Text style={styles.label}>{title}:</Text>
      <Text style={styles.value}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  infoBox: {
    width: "100%",
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 5,
  },
  value: {
    fontSize: 16,
    color: "#4E8D7C",
    marginTop: 3,
  },
});
