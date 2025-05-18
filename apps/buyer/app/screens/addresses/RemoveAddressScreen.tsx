// RemoveAddressScreen.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Button,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { t } from 'i18next';
import { baseURL, USE_DUMMY_DATA } from 'proba-package';
import { Icon } from 'react-native-vector-icons/Icon';
import * as SecureStore from 'expo-secure-store';

export default function RemoveAddressScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;              // ID of address to delete
  const address = params.address as string;
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const onRemove = async () => {
    setLoading(true);

    if (USE_DUMMY_DATA) {
      // simulate network delay
      setTimeout(() => {
        Alert.alert(t('remove_success'), t('address_removed_dummy'));
        router.back();
      }, 1500);
      return;
    }

    try {
      const authToken = await SecureStore.getItemAsync('auth_token');
      if (!authToken) {
        console.error("No login token");
        return;
      }
      const res = await fetch(
        `${baseURL}/api/user-profile/address/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            // add auth token header if needed
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || t('remove_failed'));
      }
      Alert.alert(t('remove_success'), t('address_removed'));
      router.back();
    } catch (err: any) {
      console.error('Error deleting address:', err);
      Alert.alert(t('error'), err.message || t('remove_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <View style={styles.content}>
        <Text style={styles.label}>{t('confirm_remove_address')}</Text>
        <Text style={styles.addressText}>{address}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={styles.loading} />
      ) : (
        <View style={styles.actions}>
          <Button title={t('remove')} onPress={onRemove} color="darkred" />
          <View style={styles.spacer} />
          <Button title={t('cancel')} onPress={() => router.back()} color="gray" />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'space-between', backgroundColor: 'white' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  addressText: { fontSize: 16, textAlign: 'center' },
  actions: { marginBottom: 20, flexDirection: 'row', justifyContent: 'center' },
  spacer: { width: 16 },
  loading: { marginBottom: 20 },
});