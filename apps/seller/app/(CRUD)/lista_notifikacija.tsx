import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

type Notification = {
  id: number;
  message: string;
  read: boolean;
  timestamp: string;
};

let mockNotifications: Notification[] = [
  {
    id: 1,
    message: 'Nova narudžba #123 kreirana',
    read: false,
    timestamp: '2025-04-17T12:30:00Z',
  },
  {
    id: 2,
    message: 'Narudžba #456 potvrđena',
    read: true,
    timestamp: '2025-04-16T09:15:00Z',
  },
  {
    id: 3,
    message: 'Narudžba #789 je otkazana',
    read: false,
    timestamp: '2025-04-15T17:45:00Z',
  },
];

const NotificationList = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    console.log('Fetching notifications...');
    setTimeout(() => {
      // Filter notifications to only show unread ones
      const unreadNotifications = mockNotifications.filter(n => !n.read);
      setNotifications(unreadNotifications);
      setLoading(false);
    }, 500);
  };

  const markAsRead = async (id: number) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    
    // Update mockNotifications to reflect the change as well
    const mockUpdated = mockNotifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    // If mockNotifications is global, update it
    mockNotifications = mockUpdated;
  };

  useEffect(() => {
    console.log('Fetching notifications...');
    fetchNotifications();
    console.log(mockNotifications);
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <ActivityIndicator />;

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => markAsRead(item.id)}>
          <View
            style={{ padding: 16, backgroundColor: item.read ? '#eee' : '#fff' }}
          >
            <Text>{item.message}</Text>
            <Text style={{ fontSize: 12, color: 'gray' }}>{item.timestamp}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

export default NotificationList;
