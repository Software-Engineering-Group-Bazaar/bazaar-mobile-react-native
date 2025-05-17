// components/ui/cards/BuyerInfoCard.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = {
  buyerUsername: string;
  onMessagePress: () => void;
  t: (key: string) => string;
};

export const BuyerInfoCard: React.FC<Props> = ({ buyerUsername, onMessagePress, t }) => (
  <View style={styles.container}>
    <Text style={styles.label}>
      {t("buyer")}: <Text style={{ fontWeight: "400" }}>{buyerUsername}</Text>
    </Text>
    <TouchableOpacity style={styles.button} onPress={onMessagePress}>
      <Text style={styles.buttonText}>{t("send_message")}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 10,
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flexShrink: 1,
    marginRight: 8,
  },
  button: {
    backgroundColor: "#4E8D7C",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});