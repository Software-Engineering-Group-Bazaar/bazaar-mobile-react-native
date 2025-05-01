// screens/orders/review.tsx (ili screens/orders/review/index.tsx)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function DetailsScreen() {
    const { orderId, storeId } = useLocalSearchParams();
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Pregled Parametara Detalja</Text>
        <Text style={styles.infoText}>ID Narudžbe: {orderId}</Text>
        <Text style={styles.infoText}>ID Prodavnice: {storeId}</Text>
      </View>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F3F4F6',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#111827',
    textAlign: 'center',
  },
  infoText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#4B5563',
  },
});