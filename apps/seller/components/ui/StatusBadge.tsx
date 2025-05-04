import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { STATUS_COLORS } from "../../constants/statusColors";

type StatusBadgeProps = {
  status: keyof typeof STATUS_COLORS;
};
const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { t } = useTranslation();
  return (
    <View style={[styles.badge, { backgroundColor: STATUS_COLORS[status] }]}>
      <Text style={styles.text}>{t(status)}</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  text: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
export default StatusBadge;
