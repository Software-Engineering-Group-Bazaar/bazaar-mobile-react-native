import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import { apiFetchActiveStore } from "../api/storeApi";
import { Store } from "../types/prodavnica";

import { Notification } from '../types/notifikacija';
import { apiFetchAllNotifications, apiSetNotificationsAsRead } from '../api/inboxApi';

const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleString(); 
};

const NotificationList = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [store, setStore] = useState<Store>();

  const fetchNotifications = async () => {
    console.log("Fetching notifications...");
    setLoading(true);
    try {
      const allNotifications = await apiFetchAllNotifications();
      setNotifications(allNotifications);
    } catch (error) {
      console.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function getStore() {
      setLoading(true);
      const activeStore = await apiFetchActiveStore();
      if (activeStore) {
        await SecureStore.setItem("storeId", activeStore.id.toString());
        setStore(activeStore);
      }
      setLoading(false);
    }
    getStore();

    console.log('Fetching notifications...');
    fetchNotifications();
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 5000);
  
    return () => clearInterval(intervalId);
  }, []);

  const markAsRead = async (notificationId: number, orderId: number, message: string) => {
    try {
      await apiSetNotificationsAsRead(notificationId);
  
      const updated = notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      setNotifications(updated);

      if (/narudžb/i.test(message)) {
        router.push({
          pathname: '/(CRUD)/narudzba_detalji',
          params: { id: orderId.toString() },
        });
      } else if (/poruk/i.test(message)) {
        router.push('../(tabs)/messaging');
      } else if (/recenzij/i.test(message)) {
        if(store){
          router.push(`/(CRUD)/pregled_reviews?storeId=${store.id}&storeName=${encodeURIComponent(store.name)}`);
        }
      } else {
        router.push('../(tabs)/zalihe');
      }
    } catch (error) {
      console.error("Error marking notification as read and redirecting:", error);
    }
  };

  if (loading) return <ActivityIndicator />;

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => markAsRead(item.id, item.orderId, item.message)}>
          <View
            style={{ padding: 16, backgroundColor: item.isRead ? '#eee' : '#fff' }}
          >
            <Text>
              {item.message}
            </Text>
            <Text style={{ fontSize: 12, color: 'gray' }}>
              {formatDate(item.timestamp)} 
            </Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

export default NotificationList;
