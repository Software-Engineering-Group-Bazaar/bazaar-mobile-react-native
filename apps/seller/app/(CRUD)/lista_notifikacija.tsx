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

  const markAsRead = async (id: number) => {
    try {
      await apiSetNotificationsAsRead(id);
  
      const updated = notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      setNotifications(updated);

      router.push({
        pathname: './narudzba_detalji',
        params: { id: id.toString() },
      });
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
        <TouchableOpacity onPress={() => markAsRead(item.id)}>
          <View
            style={{ padding: 16, backgroundColor: item.isRead ? '#eee' : '#fff' }}
          >
            <Text>
              Narudzba #{item.orderId} je kreirana.
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
