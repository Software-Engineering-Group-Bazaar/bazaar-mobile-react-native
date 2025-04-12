import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function ConfirmResetScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirmCode = async () => {
    if (!code.trim()) {
      Alert.alert(t('error'), t('enter_verification_code'));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://bazaar-system.duckdns.org/api/Auth/confirmation?code=${code}`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        const resetToken = data.token;
        // ide se na screen za unos nove lozinke i prosljedjuje se dobiveni token
        router.push({ pathname: '/(auth)/new_password', params: { token: resetToken } });
      } else {
        const errorData = await response.json();
        Alert.alert(t('error'), errorData.message || t('invalid_verification_code')); 
      }
    } catch (error) {
      console.error('Error confirming reset code:', error);
      Alert.alert(t('error'), t('something_went_wrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('enter_verification_code_title')}</Text> 
      <TextInput
        style={styles.input}
        placeholder={t('verification_code_placeholder')} 
        keyboardType="number-pad"
        value={code}
        onChangeText={setCode}
      />
      <TouchableOpacity style={styles.button} onPress={handleConfirmCode} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{t('confirm_code_button')}</Text>
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