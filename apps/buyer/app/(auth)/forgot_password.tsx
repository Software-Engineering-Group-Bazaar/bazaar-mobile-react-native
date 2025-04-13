import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPasswordRequest = async () => {
    if (!email.trim()) {
      Alert.alert(t('error'), t('enter_email')); 
      return;
    }

    setLoading(true);
    try {
      // const response = await fetch('https://bazaar-system.duckdns.org/api/Auth/resetpassword', {
      const response = await fetch('https://bazaar-system.duckdns.org/api/PasswordReset/request-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        Alert.alert(t('success'), t('password_reset_email_sent')); 
        // ako je email bio validan i poslan onda preusmjeravanje na ekran za unos koda
        router.push('/(auth)/new_password');
      } else {
        const errorData = await response.json();
        Alert.alert(t('error'), errorData.message || t('reset_password_failed')); 
      }
    } catch (error) {
      console.error('Error pri slanju emaila za reset:', error);
      Alert.alert(t('error'), t('something_went_wrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('forgot_question')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('email_placeholder')}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity style={styles.button} onPress={handleResetPasswordRequest} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{t('reset_password')}</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>{t('back_to_login')}</Text> 
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