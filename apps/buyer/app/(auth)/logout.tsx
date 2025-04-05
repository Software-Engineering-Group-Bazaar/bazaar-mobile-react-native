import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useTranslation } from 'react-i18next';

export default function Logout() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('auth_token');
    Alert.alert(t('logout_title'), t('logout_message'));
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.message}>{t('logged_in_as_buyer')}</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>{t('logout_button')}</Text>
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


