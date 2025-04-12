import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function NewPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetNewPassword = async () => {
    if (!newPassword.trim() || !confirmNewPassword.trim()) {
      Alert.alert(t('error'), t('enter_new_password'));
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert(t('error'), t('passwords_do_not_match')); 
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://bazaar-system.duckdns.org/api/Auth/newpassword', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword, token }),
      });

      if (response.ok) {
        Alert.alert(t('success'), t('password_reset_successful')); 
        router.replace('/(auth)/login'); // vracanje na login
      } else {
        const errorData = await response.json();
        Alert.alert(t('error'), errorData.message || t('reset_password_failed')); 
      }
    } catch (error) {
      console.error('Error setting new password:', error);
      Alert.alert(t('error'), t('something_went_wrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('set_new_password_title')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('new_password_placeholder')} 
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={styles.input}
        placeholder={t('confirm_new_password_placeholder')} 
        secureTextEntry
        value={confirmNewPassword}
        onChangeText={setConfirmNewPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleSetNewPassword} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{t('set_new_password_button')}</Text> 
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>{t('back')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#4E8D7C',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#4E8D7C',
    fontSize: 16,
  },
});