// screens/orders/details.tsx (ili screens/orders/details/index.tsx)
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { t } from 'i18next';
import CartItem from 'proba-package/cart-item/index';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
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

interface ProductCategory {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  productCategory: ProductCategory;
  retailPrice: number;
  wholesalePrice: number;
  weight?: number;
  weightUnit?: string;
  volume?: number;
  volumeUnit?: string;
  storeId: number;
  photos: string[];
  isActive: boolean;
  wholesaleThreshold?: number;
  quantity: number
}

// Dummy podaci
// const USE_DUMMY_DATA = true;

const DUMMY_ORDERS: Order[] = [
  {
    id: 'A123',
    time: '2025-04-18T14:23:00Z',
    buyerId: 'B001',
    storeId: 1,
    status: 'Requested',
    total: 6.20,
    orderItems: [
      { id: '1', productId: '1', price: 2.50, quantity: 2 },
      { id: '2', productId: '2', price: 1.20, quantity: 1 },
    ],
  },
  {
    id: 'B456',
    time: '2025-04-17T09:15:00Z',
    buyerId: 'B001',
    storeId: 2,
    status: 'Ready',
    total: 5.00, 
    orderItems: [
      { id: '1', productId: '1', price: 2.50, quantity: 2 },
    ],
  },
  {
    id: 'C789',
    time: '2025-04-15T18:40:00Z',
    buyerId: 'B001',
    storeId: 3,
    status: 'Delivered',
    total: 3.60,
    orderItems: [
      { id: '2', productId: '2', price: 1.20, quantity: 3 },
    ],
  },
];

const DUMMY_PRODUCTS: Product[] = [
  { id: 1, name: 'Mlijeko 1L', productCategory: { id: 1, name: 'Mliječni proizvodi' }, retailPrice: 2.50, wholesalePrice: 2.20, storeId: 123, photos: ['https://via.placeholder.com/300/ADD8E6/000000?Text=Mlijeko'], isActive: true, wholesaleThreshold: 10, quantity: 15 },
  { id: 2, name: 'Hljeb', productCategory: { id: 2, name: 'Pekarski proizvodi' }, retailPrice: 1.20, wholesalePrice: 1.00, storeId: 123, photos: ['https://via.placeholder.com/300/F0E68C/000000?Text=Hljeb'], isActive: true, quantity: 10 },
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

const DUMMY_STORES: Store[] = [
  { id: 1, name: 'Supermarket A', address: 'Adresa A', isActive: true, categoryid: 1 },
  { id: 2, name: 'Lokalna trgovina B', address: 'Adresa B', isActive: true, categoryid: 2 },
  { id: 3, name: 'Online Shop C', address: 'Adresa C', isActive: true, categoryid: 3 },
];

export default function DetailsScreen() {
   const { orderId, storeId } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailedOrderItems, setDetailedOrderItems] = useState<({ product: Product | undefined } & OrderItem)[]>([]);
  const [storeName, setStoreName] = useState<string | null>(null);

  const handleProductPress = (product: Product, quantity: number) => {
    router.push(`./productDetails/${product.id}?quantity=${quantity}`);
  };

  useEffect(() => {
    async function fetchStoreName(storeId: number) {
      if (USE_DUMMY_DATA) {
        const store = DUMMY_STORES.find(s => s.id === storeId);
        setStoreName(store?.name || t('store_not_found', 'Trgovina nije pronađena'));
      } else {
        try {
          const authToken = await SecureStore.getItemAsync('auth_token');
          const storesResponse = await fetch(baseURL + `/api/Stores`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            }
          });
          if (!storesResponse.ok) {
            const errorBody = await storesResponse.text();
            console.error(`Stores fetch error: ${storesResponse.status}, message: ${errorBody}`);
            setStoreName(t('store_info_error', 'Greška pri dohvaćanju informacija o trgovini'));
            return;
          }
          const storesData: Store[] = await storesResponse.json();
          const store = storesData.find(s => s.id === storeId);
          setStoreName(store?.name || t('store_not_found', 'Trgovina nije pronađena'));
        } catch (e) {
          console.error('Greška pri dohvaćanju imena trgovine:', e);
          setStoreName(t('store_info_error', 'Greška pri dohvaćanju informacija o trgovini'));
        }
      }
    }

    async function fetchOrderDetails() {
      setLoading(true);
      setError(null);
      try {
        if (USE_DUMMY_DATA) {
          const dummyOrder = DUMMY_ORDERS.find((o) => o.id === orderId);
          if (dummyOrder) {
            setOrder(dummyOrder);
            const detailedItems = dummyOrder.orderItems.map((item) => ({
              ...item,
              product: DUMMY_PRODUCTS.find((p) => p.id.toString() === item.productId),
            }));
            setDetailedOrderItems(detailedItems);
            fetchStoreName(dummyOrder.storeId);
          } else {
            setError(t('order_not_found', 'Narudžba nije pronađena.'));
          }
        } else {
          const authToken = await SecureStore.getItemAsync('auth_token');
          const orderResponse = await fetch(baseURL + `/api/OrderBuyer/order/${orderId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            }
          });

          if (!orderResponse.ok) {
            throw new Error(`Greška pri dohvaćanju narudžbe: ${orderResponse.status}`);
          }
          const orderData = (await orderResponse.json()) as Order;
          setOrder(orderData);

          // detalji peoizvoda za svaki order item iz ordera
          const detailedItems = await Promise.all(
            orderData.orderItems.map(async (item) => {
              try {
          const authToken = await SecureStore.getItemAsync('auth_token');
          const productResponse = await fetch(
                  baseURL + `/api/Catalog/products/${item.productId}`, {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${authToken}`
                    }
                  }
                );
                if (!productResponse.ok) {
                  console.warn(`Nije pronađen proizvod sa ID: ${item.productId}`);
                  return { ...item, product: undefined };
                }
                const productData = (await productResponse.json()) as Product;
                return { ...item, product: productData };
              } catch (e) {
                console.error(`Greška pri dohvaćanju proizvoda sa ID: ${item.productId}`, e);
                return { ...item, product: undefined };
              }
            })
          );
          setDetailedOrderItems(detailedItems);
          fetchStoreName(orderData.storeId);
        }
      } catch (e: any) {
        console.error('Greška pri dohvaćanju detalja narudžbe:', e);
        setError(t('order_details_error', 'Došlo je do greške pri dohvaćanju detalja narudžbe.'));
      } finally {
        setLoading(false);
      }
    }

    fetchOrderDetails();
  }, [orderId]);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <Text>{t('order_not_found', 'Narudžba nije pronađena.')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>{t('order_details')}</Text>

      <View style={styles.detailItem}>
        <Text style={styles.label}>{t('order_id')}:</Text>
        <Text style={styles.value}>{order.id}</Text>
      </View>

      {/* Ostali detalji narudžbe */}
      <View style={styles.detailItem}>
        <Text style={styles.label}>{t('date_time')}:</Text>
        <Text style={styles.value}>{new Date(order.time).toLocaleString()}</Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.label}>{t('store')}:</Text>
        <Text style={styles.value}>{storeName}</Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.label}>{t('status')}:</Text>
        <Text style={{ ...styles.value, color: statusColors[order.status] || 'black' }}>
          {order.status}
        </Text>
      </View>

      <Text style={[styles.title, styles.itemsTitle]}>{t('ordered_items')}</Text>
      {detailedOrderItems.map((item) => (
        <CartItem
        key={item.id}
        product={item.product!}
        quantity={item.quantity}
        isSwipeable={false}
        onPress={() => handleProductPress(item.product!, item.quantity)} 
      />
      ))}

      {order?.total !== undefined && (
      <View style={styles.totalPriceContainer}>
        <Text style={styles.totalPriceLabel}>{t('total_price')}:</Text>
        <Text style={styles.totalPriceValue}>{order.total.toFixed(2)} KM</Text>
      </View>
    )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#111827',
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4e8d7c',
    marginRight: 10,
    minWidth: 100,
  },
  value: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  itemsTitle: {
    marginTop: 30,
    marginBottom: 15,
    fontSize: 20,
  },
  totalPriceContainer: {
    marginTop: 10,
    marginBottom: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPriceLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalPriceValue: {
    fontSize: 18,
    color: 'green',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});