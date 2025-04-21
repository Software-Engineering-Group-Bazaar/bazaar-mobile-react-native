// app/(tabs)/orders/index.tsx
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  pricePerProduct: number;
  quantity: number;
}

type OrderStatus = 'requested' | 'confirmed' | 'ready' | 'sent' | 'delivered' | 'rejected';

interface Order {
  id: string;
  dateTime: string;
  buyerId: string;
  storeId: string;
  status: OrderStatus;
  isCanceled: boolean;
  totalPrice: number;
  items: OrderItem[];
}

const dummyOrders: Order[] = [
  {
    id: 'A123',
    dateTime: '2025-04-18T14:23:00Z',
    buyerId: 'B001',
    storeId: 'S01',
    status: 'requested',
    isCanceled: false,
    totalPrice: 45.5,
    items: [
      { id: '1', orderId: 'A123', productId: 'P001', pricePerProduct: 15.0, quantity: 2 },
      { id: '2', orderId: 'A123', productId: 'P002', pricePerProduct: 7.25, quantity: 1 },
    ],
  },
  {
    id: 'B456',
    dateTime: '2025-04-17T09:15:00Z',
    buyerId: 'B001',
    storeId: 'S02',
    status: 'ready',
    isCanceled: false,
    totalPrice: 120.0,
    items: [
      { id: '3', orderId: 'B456', productId: 'P010', pricePerProduct: 60.0, quantity: 2 },
    ],
  },
  {
    id: 'C789',
    dateTime: '2025-04-15T18:40:00Z',
    buyerId: 'B001',
    storeId: 'S03',
    status: 'delivered',
    isCanceled: false,
    totalPrice: 75.25,
    items: [
      { id: '4', orderId: 'C789', productId: 'P005', pricePerProduct: 25.25, quantity: 3 },
    ],
  },
];

const statusColors: Record<OrderStatus, string> = {
  requested: '#FBBF24',  // yellow
  confirmed: '#3B82F6',  // blue
  ready: '#10B981',      // green
  sent: '#6366F1',       // indigo
  delivered: '#059669',  // emerald
  rejected: '#EF4444',   // red
};

export default function OrdersScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {t('my_orders', 'Moje narudžbe')}
      </Text>
      <FlatList
        data={dummyOrders}
        keyExtractor={(o) => o.id}
        renderItem={({ item }) => {
          const color = statusColors[item.status];
          return (
            <View style={styles.card}>
              <Text style={styles.smallText}>
                {t('order_id', 'ID')}: <Text style={styles.bold}>{item.id}</Text>
              </Text>
              <Text style={styles.normalText}>
                {t('order_price', 'Cijena')}: <Text style={styles.bold}>{item.totalPrice.toFixed(2)} KM</Text>
              </Text>
              <Text style={styles.normalText}>
                {t('order_status', 'Status')}:{' '}
                <Text style={[styles.bold, { color }]}>
                  {t(`status_${item.status}`, item.status)}
                </Text>
              </Text>
              {item.isCanceled && (
                <Text style={styles.cancelled}>
                  {t('order_canceled', 'Otkazano')}
                </Text>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {t('orders_empty', 'Nema narudžbi za prikaz.')}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // gray-100
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
    color: '#6B7280', // gray-500
    marginBottom: 4,
  },
  normalText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#111827', // gray-900
  },
  bold: {
    fontWeight: '600',
  },
  cancelled: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626', // red-600
  },
  empty: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 40,
  },
});
