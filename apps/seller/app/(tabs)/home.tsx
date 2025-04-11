import {
  Alert,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router, useRouter } from 'expo-router';
import { t } from 'i18next';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { useTranslation } from 'react-i18next';


const handleLogout = async () => {
  try {
    const token = await SecureStore.getItemAsync('auth_token');

    if (token) {
      const response = await axios.post(
        `http://bazaar-system.duckdns.org/api/Auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        await SecureStore.deleteItemAsync('auth_token');
        Alert.alert(t('logout_title'), t('logout_message'));
        router.replace('/(auth)/login');
      } else {
        // Handle logout failure if necessary
        Alert.alert(t('error'), t('logout_failed'));
      }
    } else {
      // If no token found, proceed with local logout
      await SecureStore.deleteItemAsync('auth_token');
      Alert.alert(t('logout_title'), t('logout_message'));
      router.replace('/(auth)/login');
    }
  } catch (error) {
    console.error("Logout error:", error);
    Alert.alert(t('error'), t('something_went_wrong'));
  }
};

const HomeScreen = () => {
  const { t, i18n } = useTranslation();
  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'bs' : 'en');
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
        <FontAwesome name="language" size={18} color="#4E8D7C" />
        <Text style={styles.languageText}>{i18n.language.toUpperCase()}</Text>
      </TouchableOpacity>
      <Text style={styles.welcomeText}>{t('greet')}</Text>
      <Text style={styles.subtitle}>{t('slogan')}</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoutButton: {
    backgroundColor: '#4E8D7C',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginTop: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4E8D7C',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
});

export default HomeScreen;