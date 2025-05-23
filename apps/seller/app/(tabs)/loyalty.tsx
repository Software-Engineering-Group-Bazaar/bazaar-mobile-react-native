import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";

export default function LoyaltyScreen() {
  const { t, i18n } = useTranslation();

  const data = {
    totalIncome: 12500,
    paidToAdmin: 320,
    redeemedWithPoints: 480,
  };
  
  return (
    <View style={styles.summaryContainer}>
      <Text style={styles.title}>{t('Loyalty Program Report')}</Text>

      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.label}>Total Store Income</Text>
          <Text style={styles.value}>${data.totalIncome.toLocaleString()}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Paid to Admin (Points)</Text>
          <Text style={styles.value}>${data.paidToAdmin.toFixed(2)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Bought with Points</Text>
          <Text style={styles.value}>${data.redeemedWithPoints.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryContainer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  cardContainer: {
    flexDirection: "column",
    gap: 12,
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
});
