import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function Logout() {
  const router = useRouter();

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('auth_token');
    Alert.alert("Odjava", "Uspješno ste odjavljeni.");
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.message}>Ulogovani ste kao seller</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Odjava</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff',
  },
  message: {
    fontSize: 18, marginBottom: 20,
  },
  button: {
    padding: 15, backgroundColor: '#E53935', borderRadius: 8,
  },
  buttonText: {
    color: '#fff', fontWeight: 'bold',
  },
});
