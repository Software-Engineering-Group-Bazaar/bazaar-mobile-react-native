import React from 'react';
import { TouchableOpacity, StyleSheet, GestureResponderEvent } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

type LogoutButtonProps = {
  onPress: (event: GestureResponderEvent) => void;
};

const LogoutButton: React.FC<LogoutButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Icon name="logout" size={24} color="#000" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
});

export default LogoutButton;
