import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { router, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {
  AccessToken,
  LoginButton,
  Settings,
  Profile,
  LoginManager
} from "react-native-fbsdk-next";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { t } from 'i18next';

const handleLogout = async () => {
  try {
    // Retrieve the stored token
    const token = await SecureStore.getItemAsync('auth_token');

    if (token) {
      // Send POST request to the logout endpoint
      const response = await axios.post(
        `http://10.0.2.2:5054/api/Auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send the token in the Authorization header
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

const YourScreen = () => {
  return (
    <View style={styles.container}>
      {/* Other components or content */}

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>{t('logout')}</Text>
      </TouchableOpacity>

      {/* Other components or content */}
    </View>
  );
};

// Styles for the logout button
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoutButton: {
    backgroundColor: '#4E8D7C', // Set the background color for the button
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
});

export default YourScreen;
