// 📄 File: apps/seller/app/(CRUD)/narudzba_detalji.tsx
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
  } from 'react-native';
  import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
  import { useTranslation } from 'react-i18next';
  import { FontAwesome } from '@expo/vector-icons';
  import React, { useState, useEffect } from 'react';
  import { Order, OrderStatus } from '../types/order';

  import mockOrders from '../mock/orders'; // 📆 Mock podaci dok backend nije gotov

  const STATUS_COLORS: Record<OrderStatus, string> = {
    pending: '#FFA500',
    approved: '#4E8D7C',
    ready: '#3498db',
    sent: '#9b59b6',
    delivered: '#2ecc71',
    rejected: '#e74c3c',
    canceled: '#95a5a6',
  };

  const getNextStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    switch (currentStatus) {
      case 'pending':
        return ['approved', 'rejected'];
      case 'approved':
        return ['ready', 'rejected'];
      case 'ready':
        return ['sent', 'rejected'];
      case 'sent':
        return ['delivered', 'rejected'];
      default:
        return [];
    }
  };
  function getTimeAgo(timestamp: string, t: (key: string, options?: any) => string) {
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
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      // 📡 TODO: Zamijeniti mock logiku pravim API pozivom kad backend bude gotov
      // fetch(`http://<your-api>/api/orderItem/${id}`, {
      //   method: 'GET',
      //   headers: {
      //     'Authorization': `Bearer ${yourToken}`,
      //     'Content-Type': 'application/json'
      //   }
      // })
      //   .then(res => res.json())
      //   .then(data => setOrder(data))
      //   .catch(err => console.error(err));

      const selected = mockOrders.find((o) => o.id === Number(id));
      setOrder(selected || null);
    }, [id]);

    const toggleLanguage = () => {
      i18n.changeLanguage(i18n.language === 'en' ? 'bs' : 'en');
    };

    const handleStatusChange = async (newStatus: OrderStatus) => {
      Alert.alert(
        t('Confirm Status Change'),
        t('Are you sure you want to change the order status?'),
        [
          { text: t('Cancel'), style: 'cancel' },
          {
            text: t('Yes'),
            onPress: async () => {
              setLoading(true);
              try {
                // 📡 TODO: POST status update kad backend bude gotov
                // await fetch('http://<your-api>/api/order/status', {
                //   method: 'POST',
                //   headers: {
                //     'Authorization': `Bearer ${yourToken}`,
                //     'Content-Type': 'application/json'
                //   },
                //   body: JSON.stringify({ OrderId: order?.id, NewStatus: newStatus })
                // });

                setOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
              } catch (error) {
                Alert.alert(t('Error'), t('Failed to update status'));
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
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
        <Stack.Screen
          options={{
            title: t('order_overview'),
            headerTitleAlign: 'center',
          }}
        />

        <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
          <FontAwesome name="language" size={18} color="#4E8D7C" />
          <Text style={styles.languageText}>{String(i18n.language).toUpperCase()}</Text>
        </TouchableOpacity>

        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.orderId}>{t('Order')} #{order.id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status] }]}> 
              <Text style={styles.statusText}>{t(order.status)}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Order Information')}</Text>
            <Text style={styles.orderTime}>
                {new Date(order.createdAt).toLocaleString()} ({getTimeAgo(order.createdAt, t)})
                </Text>
            <Text style={styles.buyerEmail}>{order.buyerEmail}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Products')}</Text>
            {order.products.map((product) => (
              <View key={product.id} style={styles.productItem}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productQuantity}>x{product.quantity}</Text>
                </View>
                <Text style={styles.productPrice}>{product.price} KM</Text>
              </View>
            ))}
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>{t('Total Amount')}</Text>
              <Text style={styles.totalAmount}>{order.totalAmount} KM</Text>
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
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
      marginTop: 10,
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
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1C1C1E',
      marginBottom: 12,
    },
    orderTime: {
      fontSize: 14,
      color: '#666',
      marginBottom: 4,
    },
    buyerEmail: {
      fontSize: 16,
      color: '#4E8D7C',
      fontWeight: '500',
    },
    productItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#F2F2F7',
    },
    productInfo: {
      flex: 1,
    },
    productName: {
      fontSize: 16,
      color: '#1C1C1E',
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
      color: '#1C1C1E',
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
      marginRight: 8,
      marginBottom: 8,
    },
    statusButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '500',
    },
    languageButton: {
      position: 'absolute',
      top: 30,
      right: 20,
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#f1f5f9',
      zIndex: 1000,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
    },
    languageText: {
      fontSize: 10,
      fontWeight: '600',
      color: '#4E8D7C',
      marginTop: 2,
    },
  });
  