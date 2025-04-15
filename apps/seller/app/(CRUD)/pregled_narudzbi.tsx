// 📄 File: apps/seller/app/(CRUD)/pregled_narudzbi.tsx
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    RefreshControl,
  } from 'react-native';
  import { useRouter, Stack } from 'expo-router';
  import { useTranslation } from 'react-i18next';
  import { FontAwesome } from '@expo/vector-icons';
  import React, { useState, useEffect, useCallback } from 'react';
  import { Order, OrderStatus } from '../types/order';
  import mockOrders from '../mock/orders'; // Mock podaci dok backend nije gotov
  
  const { width, height } = Dimensions.get('window');
  const COLUMN_GAP = 16;
  
  const STATUS_COLORS: Record<OrderStatus, string> = {
    pending: '#FFA500',
    approved: '#4E8D7C',
    ready: '#3498db',
    sent: '#9b59b6',
    delivered: '#2ecc71',
    rejected: '#e74c3c',
    canceled: '#95a5a6',
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

  
  export default function OrdersScreen() {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [orders, setOrders] = useState<Order[]>(mockOrders);
    const [selectedStatuses, setSelectedStatuses] = useState<OrderStatus[]>([]);
    const [sortNewestFirst, setSortNewestFirst] = useState(true);
  
    const toggleLanguage = () => {
      i18n.changeLanguage(i18n.language === 'en' ? 'bs' : 'en');
    };
  
    const onRefresh = useCallback(() => {
      setRefreshing(true);
  
      // 🔁 TODO: Zamijeniti sa GET /api/order/ kad backend proradi
      // fetch('/api/order/', {
      //   method: 'GET',
      //   headers: { Authorization: `Bearer ${token}` }
      // })
      //   .then(res => res.json())
      //   .then(data => setOrders(data))
      //   .catch(err => console.error(err))
      //   .finally(() => setRefreshing(false));
  
      setTimeout(() => {
        setOrders(mockOrders);
        setRefreshing(false);
      }, 1000);
    }, []);
  
    const toggleStatus = (status: OrderStatus) => {
      if (selectedStatuses.includes(status)) {
        setSelectedStatuses(selectedStatuses.filter(s => s !== status));
      } else {
        setSelectedStatuses([...selectedStatuses, status]);
      }
    };
  
    const filteredOrders = selectedStatuses.length === 0
      ? orders
      : orders.filter((order) => selectedStatuses.includes(order.status));
  
    const sortedOrders = [...filteredOrders].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortNewestFirst ? dateB - dateA : dateA - dateB;
    });
  
    const renderStatusFilter = () => (
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statusFilterContainer}
        >
          <TouchableOpacity
            style={[
              styles.statusFilterButton,
              selectedStatuses.length === 0 && styles.statusFilterButtonActive,
            ]}
            onPress={() => setSelectedStatuses([])}
          >
            <Text style={styles.statusFilterText}>{t('All')}</Text>
          </TouchableOpacity>
          {(Object.keys(STATUS_COLORS) as OrderStatus[]).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusFilterButton,
                selectedStatuses.includes(status) && styles.statusFilterButtonActive,
                { borderColor: STATUS_COLORS[status] },
              ]}
              onPress={() => toggleStatus(status)}
            >
              <Text style={styles.statusFilterText}>{t(status)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
  
        <TouchableOpacity
          style={styles.sortToggleButton}
          onPress={() => setSortNewestFirst(!sortNewestFirst)}
        >
          <FontAwesome name={sortNewestFirst ? 'sort-amount-desc' : 'sort-amount-asc'} size={16} color="#4E8D7C" />
          <Text style={styles.sortToggleText}>
            {sortNewestFirst ? t('Newest First') : t('Oldest First')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  
    const renderOrderCard = ({ item }: { item: Order }) => (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => router.push({ pathname: '/(CRUD)/narudzba_detalji', params: { id: item.id.toString() } })}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>{t('Order')} #{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}> 
            <Text style={styles.statusText}>{t(item.status)}</Text>
          </View>
        </View>
        <View style={styles.orderInfo}>
          <Text style={styles.orderEmail}>{item.buyerEmail}</Text>
          <Text style={styles.orderAmount}>{t('Total')}: {item.totalAmount} KM</Text>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleDateString()} {t('at')} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}    ({getTimeAgo(item.createdAt, t)})
          </Text>
        </View>
      </TouchableOpacity>
    );
  
    return (
      <>
        <Stack.Screen
          options={{
            title: t('orders'),
            headerTitleAlign: 'center',
          }}
        />
  
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
            <FontAwesome name="language" size={18} color="#4E8D7C" />
            <Text style={styles.languageText}>{i18n.language.toUpperCase()}</Text>
          </TouchableOpacity>
  
          <ScrollView
            style={styles.scrollWrapper}
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {renderStatusFilter()}
            {loading ? (
              <ActivityIndicator size="large" color="#4E8D7C" style={styles.loader} />
            ) : (
              <FlatList
                data={sortedOrders}
                renderItem={renderOrderCard}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                scrollEnabled={false}
              />
            )}
          </ScrollView>
        </View>
      </>
    );
  }
  
  const styles = StyleSheet.create({
    scrollWrapper: {
      flex: 1,
      backgroundColor: '#F2F2F7',
    },
    scrollContent: {
      paddingTop: height * 0.09,
      paddingBottom: height * 0.1,
    },
    listContainer: {
      padding: COLUMN_GAP,
    },
    filterWrapper: {
      paddingTop: 20,
      paddingHorizontal: COLUMN_GAP,
      marginBottom: 20,
    },
    orderCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    orderId: {
      fontSize: 18,
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
      fontSize: 12,
      fontWeight: '600',
    },
    orderInfo: {
      gap: 4,
    },
    orderEmail: {
      fontSize: 14,
      color: '#666',
    },
    orderAmount: {
      fontSize: 16,
      fontWeight: '500',
      color: '#4E8D7C',
    },
    orderDate: {
      fontSize: 12,
      color: '#8E8E93',
    },
    languageButton: {
      position: 'absolute',
      top: 40,
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
    statusFilterContainer: {
      marginBottom: 16,
      flexDirection: 'row',
    },
    statusFilterButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      marginRight: 8,
      backgroundColor: '#FFFFFF',
    },
    statusFilterButtonActive: {
      backgroundColor: '#4E8D7C',
    },
    statusFilterText: {
      fontSize: 14,
      fontWeight: '500',
    },
    sortToggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      marginTop: 12,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#4E8D7C',
      backgroundColor: '#FFFFFF',
    },
    sortToggleText: {
      marginLeft: 6,
      color: '#4E8D7C',
      fontSize: 14,
      fontWeight: '500',
    },
    loader: {
      marginTop: 32,
    },
  });
  