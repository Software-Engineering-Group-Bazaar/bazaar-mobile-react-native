import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';

import { Notification } from '../types/notifikacija';
import { apiFetchAllNotifications, apiSetNotificationsAsRead } from '../api/inboxApi';

const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleString(); 
};

const NotificationList = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
        router.push('./pregled_reviews');
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
