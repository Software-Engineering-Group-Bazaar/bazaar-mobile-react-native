import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Modal, Text } from 'react-native';
import NotificationList from '../../app/(CRUD)/lista_notifikacija';

// Simulated mock data or API call
const mockNotifications = [
  { id: 1, message: 'New order #123', read: false, timestamp: '...' },
  { id: 2, message: 'Order confirmed', read: true, timestamp: '...' },
];

const NotificationIcon = () => {
  const [visible, setVisible] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const checkUnread = () => {
    const unread = mockNotifications.some((n) => !n.read);
    setHasUnread(unread);
  };

  useEffect(() => {
    checkUnread();

    // Optionally set up polling to check every few seconds
    const interval = setInterval(checkUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View>
      <TouchableOpacity onPress={() => setVisible(true)} style={{ position: 'relative' }}>
        <Text style={{ fontSize: 24 }}>🔔</Text>
        {hasUnread && (
          <View
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              backgroundColor: 'red',
              borderRadius: 8,
              width: 10,
              height: 10,
            }}
          />
        )}
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide">
        <TouchableOpacity onPress={() => setVisible(false)} style={{ padding: 10 }}>
          <Text>Close</Text>
        </TouchableOpacity>
        <NotificationList />
      </Modal>
    </View>
  );
};

export default NotificationIcon;
