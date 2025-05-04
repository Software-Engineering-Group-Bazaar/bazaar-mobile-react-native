import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { STATUS_COLORS } from "../../constants/statusColors";
import { useTranslation } from "react-i18next";

type StatusButtonsProps = {
  statuses: string[];
  onChange: (newStatus: string) => void;
  disabled?: boolean;
};
const StatusButtons: React.FC<StatusButtonsProps> = ({ statuses, onChange, disabled }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      {statuses.map((status) => (
        <TouchableOpacity
          key={status}
          
          style={[styles.button, { backgroundColor: STATUS_COLORS[status as keyof typeof STATUS_COLORS]          }]}
          onPress={() => onChange(status)}
          disabled={disabled}
        >
          <Text style={styles.text}>{t(status)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
});
export default StatusButtons;
