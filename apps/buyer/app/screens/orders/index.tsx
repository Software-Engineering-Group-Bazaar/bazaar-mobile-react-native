// app/(tabs)/orders/index.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { baseURL, USE_DUMMY_DATA } from 'proba-package';

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
  storeId: number;
  status: string;
  time: string;
  total: number;
  orderItems: OrderItem[];
}

const DUMMY_ORDERS: Order[] = [
  { id: 'A123', time: '2025-04-18T14:23:00Z', buyerId: 'B001', storeId: 1, status: 'Requested', total: 6.2, orderItems: [{ id: '1', productId: '1', price: 2.5, quantity: 2 }, { id: '2', productId: '2', price: 1.2, quantity: 1 }] },
  { id: 'B456', time: '2025-04-17T09:15:00Z', buyerId: 'B001', storeId: 2, status: 'Ready', total: 5.0, orderItems: [{ id: '1', productId: '1', price: 2.5, quantity: 2 }] },
  { id: 'C789', time: '2025-04-15T18:40:00Z', buyerId: 'B001', storeId: 3, status: 'Delivered', total: 3.6, orderItems: [{ id: '2', productId: '2', price: 1.2, quantity: 3 }] },
];

const statusColors: Record<string, string> = {
  Requested: '#FBBF24',
  Confirmed: '#3B82F6',
  Ready: '#10B981',
  Sent: '#6366F1',
  Delivered: '#059669',
  Rejected: '#EF4444',
  Canceled: '#ff5e00',
};

export default function OrdersScreen() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        if (USE_DUMMY_DATA) {
          await new Promise(res => setTimeout(res, 1000));
          setOrders(DUMMY_ORDERS);
        } else {
          const token = await SecureStore.getItemAsync('auth_token');
          const res = await fetch(`${baseURL}/api/OrderBuyer/order`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error(`Status ${res.status}`);
          const data: Order[] = await res.json();

          const storesRes = await fetch(`${baseURL}/api/Stores`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          });
          if (!storesRes.ok) throw new Error(`Stores ${storesRes.status}`);
          const storesData: Store[] = await storesRes.json();
          const map: Record<string, string> = {};
          storesData.forEach(s => (map[s.id] = s.name));
          setStores(map);

          setOrders(data.reverse());
        }
      } catch (err) {
        console.error('Error loading orders:', err);
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
          keyExtractor={o => o.id}
          renderItem={({ item }) => {
            const color = statusColors[item.status] || '#000';
            return (
              <View style={styles.card}>
                <View style={styles.infoContainer}>
                  <Text style={styles.smallText}>
                    {t('order_id', 'ID')}: <Text style={styles.bold}>{item.id}</Text>
                  </Text>
                  <Text style={styles.normalText}>
                    {t('order_price', 'Cijena')}: <Text style={styles.bold}>{item.total.toFixed(2)} KM</Text>
                  </Text>
                  <Text style={styles.normalText}>
                    {t('order_status', 'Status')}: <Text style={[styles.bold, { color }]}>{t(`status_${item.status}`, item.status)}</Text>
                  </Text>
                  <Text style={styles.normalText}>
                    {t('order_store', 'Prodavnica')}: <Text style={styles.bold}>{stores[item.storeId] || item.storeId}</Text>
                  </Text>
                </View>

                {/* Review Button */}
                <TouchableOpacity
                  style={styles.reviewButton}
                  onPress={() =>
                    router.push({
                      pathname: './orders/review',
                      params: { orderId: item.id, storeId: item.storeId },
                    })
                  }
                >
                  <Ionicons name="star" size={20} color="#fff" />
                </TouchableOpacity>

                {/* Fully‐rounded Details Icon */}
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() =>
                    router.push({
                      pathname: './orders/details',
                      params: { orderId: item.id, storeId: item.storeId },
                    })
                  }
                >
                  <Ionicons name="help-circle-outline" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.empty}>{t('orders_empty', 'Nema narudžbi za prikaz.')}</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
  card: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    position: 'relative',           // needed for absolute children
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  infoContainer: { marginBottom: 8 },
  smallText: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  normalText: { fontSize: 16, color: '#111827', marginBottom: 4 },
  bold: { fontWeight: '600' },
  empty: { textAlign: 'center', color: '#6B7280', marginTop: 40 },

  reviewButton: {
    
   position: 'absolute',
    top: 50,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4E8D7C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },

  detailsButton: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4E8D7C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },

  buttonText: { color: '#FFF', fontSize: 14, fontWeight: '500' },
});
