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
        // Successfully logged out from the backend
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
