import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Modal, Text } from 'react-native';
import NotificationList from '../../app/(CRUD)/lista_notifikacija';
import { apiFetchUnreadCount } from '../../app/api/inboxApi';

const NotificationIcon = () => {
  const [visible, setVisible] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      const count = await apiFetchUnreadCount();
      setHasUnread(count > 0);
    } catch (error) {
      console.error("Failed to fetch unread notification count");
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const intervalId = setInterval(fetchUnreadCount, 5000); 
    return () => clearInterval(intervalId);
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
