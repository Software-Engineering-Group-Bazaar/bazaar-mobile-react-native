// app/(tabs)/orders/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';

interface Store {
  id: number;
  name: string;
  address: string;
  description?: string;
  isActive: boolean;
  categoryid: number;
  logoUrl?: string;
}

interface OrderItem {
  id: string;
  productId: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  buyerId: string;
  storeId: string;
  status: string;
  time: string;
  total: number;
  orderItems: OrderItem[];
}

const USE_DUMMY_DATA = true;

const DUMMY_ORDERS: Order[] = [
  {
    id: 'A123',
    time: '2025-04-18T14:23:00Z',
    buyerId: 'B001',
    storeId: 'S01',
    status: 'requested',
    total: 45.5,
    orderItems: [
      { id: '1', productId: 'P001', price: 15.0, quantity: 2 },
      { id: '2', productId: 'P002', price: 7.25, quantity: 1 },
    ],
  },
  {
    id: 'B456',
    time: '2025-04-17T09:15:00Z',
    buyerId: 'B001',
    storeId: 'S02',
    status: 'ready',
    total: 120.0,
    orderItems: [
      { id: '3', productId: 'P010', price: 60.0, quantity: 2 },
    ],
  },
  {
    id: 'C789',
    time: '2025-04-15T18:40:00Z',
    buyerId: 'B001',
    storeId: 'S03',
    status: 'delivered',
    total: 75.25,
    orderItems: [
      { id: '4', productId: 'P005', price: 25.25, quantity: 3 },
    ],
  },
];

const statusColors: Record<string, string> = {
  "Requested": '#FBBF24',
  "Confirmed": '#3B82F6',
  "Ready": '#10B981',
  "Sent": '#6366F1',
  "Delivered": '#059669',
  "Rejected": '#EF4444',
  "Canceled": '#ff5e00'
};

export default function OrdersScreen() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        if (USE_DUMMY_DATA) {
          // Simulacija kašnjenja
          await new Promise((res) => setTimeout(res, 1000));
          setOrders(DUMMY_ORDERS);
        } else {
          const authToken = await SecureStore.getItemAsync('auth_token');
          const response = await fetch(`https://bazaar-system.duckdns.org/api/OrderBuyer/order`, {
            // Dodaj method i headers ako je potrebno (posebno Authorization)
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}` // Odkomentariši ako API zahteva token
            }
          });
          if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody}`);
          }
          // Ovdje ide API poziv kad ne koristiš dummy podatke
          // const response = await fetch('https://your-api/orders');
          const data : Order[] = await response.json();

          const storesResponse = await fetch(`https://bazaar-system.duckdns.org/api/Stores`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            }
          });
          if (!storesResponse.ok) {
            const errorBody = await storesResponse.text();
            throw new Error(`Stores fetch error: ${storesResponse.status}, message: ${errorBody}`);
          }
          const storesData: Store[] = await storesResponse.json();
          const storeMap: Record<string, string> = {};
          storesData.forEach((store) => {
            storeMap[store.id] = store.name;
          });
          setStores(storeMap);

          setOrders(data.reverse());
        }
      } catch (err) {
        console.error('Greška pri učitavanju narudžbi:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          renderItem={({ item }) => {
            const color = statusColors[item.status];
            return (
              <View style={styles.card}>
                <Text style={styles.smallText}>
                  {t('order_id', 'ID')}: <Text style={styles.bold}>{item.id}</Text>
                </Text>
                <Text style={styles.normalText}>
                  {t('order_price', 'Cijena')}: <Text style={styles.bold}>{item.total.toFixed(2)} KM</Text>
                </Text>
                <Text style={styles.normalText}>
                  {t('order_status', 'Status')}:{' '}
                  <Text style={[styles.bold, { color }]}>
                    {t(`status_${item.status}`, item.status)}
                  </Text>
                </Text>
                <Text style={styles.normalText}>
                  {t('order_store', 'Prodavnica')}: <Text style={styles.bold}>
                    {stores[item.storeId] || item.storeId}
                  </Text>
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {t('orders_empty', 'Nema narudžbi za prikaz.')}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  smallText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  normalText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#111827',
  },
  bold: {
    fontWeight: '600',
  },
  cancelled: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  empty: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 40,
  },
});
