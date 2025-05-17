// ConfirmAddressScreen.tsx
import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, Button,
  Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, TouchableOpacity
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { t } from 'i18next';
import { baseURL, USE_DUMMY_DATA } from 'proba-package';
import * as SecureStore from 'expo-secure-store';

export default function ConfirmAddressScreen() {
  const params = useLocalSearchParams();
  const addressParam = params.address as string;   // coming in from router.push
  const lat = parseFloat(params.lat as string);
  const lng = parseFloat(params.lng as string);
  const router = useRouter();

  const [formAddress, setFormAddress] = useState(addressParam);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!formAddress.trim()) {
      Alert.alert('Validation error', 'Address cannot be empty.');
      return;
    }

    setLoading(true);
    if (USE_DUMMY_DATA) {
        // Simulate a network request
        setTimeout(() => {
          Alert.alert('Success', 'Your address has been saved.');
          console.log('Dummy data: Address saved:', formAddress);
          router.back();
        }, 2000);
        return;
    }
    try {
      const authToken = await SecureStore.getItemAsync('auth_token');
      if (!authToken) {
        console.error("No login token");
        return;
      }
      const res = await fetch(
        baseURL + '/api/user-profile/address',  // ← your real endpoint
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // add auth token if needed:
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            address: formAddress,
            latitude: lat,
            longitude: lng,
          }),
        }
      );
      const json = await res.json();

      if (!res.ok) {
        // API returned an error status
        throw new Error(json.message || 'Failed to save address');
      }

      Alert.alert('Success', 'Your address has been saved.');
      router.back();
    } catch (err: any) {
      console.error('Error submitting address:', err);
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <View style={styles.field}>
        <Text style={{ fontSize: 18, marginBottom: 8, fontWeight: 'bold', color: '#333' }}>
            {t('confirm_address')}
        </Text>
        <TextInput
          value={formAddress}
          onChangeText={setFormAddress}
          multiline
          style={styles.input}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={styles.loading} />
      ) : (
        <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]} // Dodat stil za onemogućeno dugme
            onPress={onSubmit}
            disabled={loading} // Onemogući dugme dok se učitava
          >
            <Text style={styles.submitButtonText}>
              {t('submit_address') || 'Submit Address'}
            </Text>
          </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'space-between', backgroundColor: 'white' },
  field: { flex: 1 },
  input: {
    maxHeight: 80,
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 12,
    borderRadius: 4,
    textAlignVertical: 'top',
  },
  submit: { marginBottom: 20 },
  loading: { marginBottom: 20 },
  submitButton: {
    backgroundColor: '#4e8d7c',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 20 : 10,
    marginHorizontal: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#A9A9A9',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
