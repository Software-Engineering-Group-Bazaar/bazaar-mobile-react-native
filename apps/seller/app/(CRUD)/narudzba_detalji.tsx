import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  RefreshControl,
 } from 'react-native';
 import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
 import { useTranslation } from 'react-i18next';
 import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
 import React, { useState, useEffect } from 'react';
 import api from '../api/defaultApi';
 import SetHeaderRight from '../../components/ui/NavHeader';
 
 const OrderStatusEnum = [
  'Requested',
  'Confirmed',
  'Rejected',
  'Ready',
  'Sent',
  'Delivered',
  'Cancelled',
 ] as const;
 
 
 type OrderStatus = typeof OrderStatusEnum[number];
 
 
 const STATUS_COLORS: Record<OrderStatus, string> = {
  Requested: '#D4A373',
  Confirmed: '#68abad',
  Ready: '#A5A58D',
  Sent: '#B07BAC',
  Delivered: '#81B29A',
  Rejected: '#D94F4F',
  Cancelled: '#B4B4B4',
 };
 
 
 const getNextStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
  switch (currentStatus) {
    case 'Requested':
      return ['Confirmed', 'Rejected'];
    case 'Confirmed':
      return ['Ready', 'Rejected'];
    case 'Ready':
      return ['Sent', 'Rejected'];
    case 'Sent':
      return ['Delivered'];
    default:
      return [];
  }
 };
 
 
 function getTimeAgo(timestamp: string, t: (key: string, options?: any) => string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t('just now');
  if (minutes < 60) return t('min ago', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('h ago', { count: hours });
  const days = Math.floor(hours / 24);
  return t('d ago', { count: days });
 }
 
 
 export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [order, setOrder] = useState<{
    id: number;
    status: OrderStatus;
    time: string;
    total: number;
    items: {
      id: number;
      productId: number;
      quantity: number;
      price: number;
      productName: string;
      productImageUrl: string;
    }[];
  } | null>(null);
 
 
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
 
 
  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/Order/${id}`);
      const fetchedOrder = res.data;
      const enrichedItems = await Promise.all(
        fetchedOrder.orderItems.map(async (item: any) => {
          const productRes = await api.get(`/Catalog/products/${item.productId}`);
          return {
            ...item,
            productName: productRes.data.name,
            productImageUrl: productRes.data.photos?.[0],
          };
        })
      );
      setOrder({
        id: fetchedOrder.id,
        time: fetchedOrder.time,
        status: OrderStatusEnum[fetchedOrder.status],
        total: fetchedOrder.total,
        items: enrichedItems,
      });
    } catch (err) {
      Alert.alert(t('Error'), t('Failed to fetch order'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
 
 
  useEffect(() => {
    fetchOrder();
  }, [id]);
 
 
  const onRefresh = () => {
    setRefreshing(true);
    fetchOrder();
  };
 
 
  const handleStatusChange = (newStatus: OrderStatus) => {
    Alert.alert(t('Confirm Status Change'), t('Are you sure you want to change the order status?'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Yes'),
        onPress: async () => {
          try {
            setLoading(true);
            await api.put(`/Order/update/status/${id}`, { newStatus });
            setOrder((prev) => prev ? { ...prev, status: newStatus } : prev);
          } catch (err) {
            Alert.alert(t('Error'), t('Failed to update status'));
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };
 
 
  const handleDelete = () => {
    Alert.alert(t('Confirm Deletion'), t('Are you sure you want to delete this order?'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await api.delete(`/Order/${id}`);
            router.back();
          } catch (err) {
            Alert.alert(t('Error'), t('Failed to delete order'));
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };
 
 
  if (!order) {
    return (
      <View style={styles.container}>
        <Text style={styles.orderId}>{t('Order not found')}</Text>
      </View>
    );
  }
 
 
  return (
    <View style={styles.rootWrapper}>
      <SetHeaderRight title={t("add_a_product")} />
      <Stack.Screen options={{ title: t('order_overview'), headerTitleAlign: 'center' }} />
 
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleDelete} style={{ marginRight: 8 }}>
          <MaterialIcons name="delete" size={28} color="#e57373" />
        </TouchableOpacity>
        <Text style={styles.orderId}>{t('Order')} #{order.id}</Text>
        <View style={{ flex: 1 }} />
        <View style={styles.languageAndStatusWrapper}>
          <TouchableOpacity
            onPress={() => i18n.changeLanguage(i18n.language === 'en' ? 'bs' : 'en')}
            style={styles.languageButton}
          >
            <FontAwesome name="language" size={18} color="#4E8D7C" />
            <Text style={styles.languageText}>{String(i18n.language).toUpperCase()}</Text>
          </TouchableOpacity>
          <View
            style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status], marginTop: 15, marginRight: 8 }]}
          >
            <Text style={styles.statusText}>{t(order.status)}</Text>
          </View>
        </View>
      </View>
 
 
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Order Information')}</Text>
          <Text style={styles.orderTime}>
            {new Date(order.time).toLocaleString()} ({getTimeAgo(order.time, t)})
          </Text>
        </View>
 
 
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('Products')}</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.productItem}>
              <Image source={{ uri: item.productImageUrl }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.productName}</Text>
                <Text style={styles.productQuantity}>x{item.quantity}</Text>
              </View>
              <Text style={styles.productPrice}>{item.price} KM</Text>
            </View>
          ))}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>{t('Total Amount')}</Text>
            <Text style={styles.totalAmount}>{order.total} KM</Text>
          </View>
        </View>
 
 
        {getNextStatuses(order.status).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Change Status')}</Text>
            <View style={styles.statusButtons}>
              {getNextStatuses(order.status).map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[styles.statusButton, { backgroundColor: STATUS_COLORS[status] }]}
                  onPress={() => handleStatusChange(status)}
                  disabled={loading}
                >
                  <Text style={styles.statusButtonText}>{t(status)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
 
 
        {loading && <ActivityIndicator size="large" color="#4E8D7C" style={{ marginTop: 16 }} />}
      </ScrollView>
    </View>
  );
 }
  const styles = StyleSheet.create({
    rootWrapper: {
      flex: 1,
      paddingTop: 70,
    },
    container: {
      flex: 1,
      backgroundColor: '#F2F2F7',
      padding: 16,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      paddingHorizontal: 16,
    },
    languageAndStatusWrapper: {
      alignItems: 'flex-end',
      gap: 6,
    },
    orderId: {
      fontSize: 24,
      fontWeight: '600',
      color: '#1C1C1E',
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    statusText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    section: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 12,
    },
    orderTime: {
      fontSize: 14,
      color: '#666',
    },
    buyerEmail: {
      fontSize: 16,
      color: '#4E8D7C',
      fontWeight: '500',
      marginTop: 4,
    },
    productItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#F2F2F7',
    },
    productImage: {
      width: 50,
      height: 50,
      borderRadius: 8,
      marginRight: 10,
    },
    productInfo: {
      flex: 1,
    },
    productName: {
      fontSize: 16,
    },
    productQuantity: {
      fontSize: 14,
      color: '#8E8E93',
    },
    productPrice: {
      fontSize: 16,
      fontWeight: '500',
      color: '#4E8D7C',
    },
    totalContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: '#F2F2F7',
    },
    totalLabel: {
      fontSize: 18,
      fontWeight: '600',
    },
    totalAmount: {
      fontSize: 20,
      fontWeight: '600',
      color: '#4E8D7C',
    },
    statusButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    statusButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginTop: 12,
    },
    statusButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '500',
    },
    languageButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#f1f5f9',
      justifyContent: 'center',
      alignItems: 'center',
    },
    languageText: {
      fontSize: 10,
      fontWeight: '600',
      color: '#4E8D7C',
      marginTop: 2,
    },
  });
 
 