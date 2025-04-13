import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function NewPasswordScreen() {
  const router = useRouter();
  // Removed useLocalSearchParams as token (code) is now entered manually
  const { t } = useTranslation();
  const [email, setEmail] = useState(''); // Added state for email
  const [code, setCode] = useState('');   // Added state for code
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetNewPassword = async () => {
    // Trim input values
    const trimmedEmail = email.trim();
    const trimmedCode = code.trim();
    const trimmedNewPassword = newPassword; // Passwords usually aren't trimmed, but check backend requirements
    const trimmedConfirmNewPassword = confirmNewPassword;

    // --- Validation ---
    if (!trimmedEmail) {
      Alert.alert(t('error'), t('enter_email')); // Add translation key 'enter_email'
      return;
    }
    if (!trimmedCode) {
      Alert.alert(t('error'), t('enter_code')); // Add translation key 'enter_code'
      return;
    }
    if (!trimmedNewPassword || !trimmedConfirmNewPassword) {
      Alert.alert(t('error'), t('enter_new_password'));
      return;
    }
    if (trimmedNewPassword !== trimmedConfirmNewPassword) {
      Alert.alert(t('error'), t('passwords_do_not_match'));
      return;
    }
    // --- End Validation ---

    setLoading(true);
    try {
      // Verify this endpoint and method with your backend API documentation
      // const response = await fetch('https://bazaar-system.duckdns.org/api/Auth/newpassword', {
      const response = await fetch('https://bazaar-system.duckdns.org/api/PasswordReset/reset-password', {
        method: 'POST', // Or 'POST' if required by the backend for this payload
        headers: {
          'Content-Type': 'application/json',
        },
        // Updated request body structure
        body: JSON.stringify({
          email: trimmedEmail,
          code: trimmedCode,
          newPassword: trimmedNewPassword,
          confirmPassword: trimmedConfirmNewPassword, // Send confirmPassword as requested
        }),
      });

      if (response.ok) {
        Alert.alert(t('success'), t('password_reset_successful'));
        router.replace('/(auth)/login'); // Navigate to login on success
      } else {
        // Attempt to parse error message from backend
        let errorData;
        try {
            errorData = await response.json();
        } catch (parseError) {
            // Handle cases where the error response is not valid JSON
            console.error('Error parsing error response:', parseError);
            errorData = { message: t('reset_password_failed') + ` (Status: ${response.status})` };
        }
        Alert.alert(t('error'), errorData?.message || t('reset_password_failed'));
      }
    } catch (error) {
      console.error('Error setting new password:', error);
      // Provide a generic error message for network or other unexpected errors
      Alert.alert(t('error'), t('something_went_wrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('set_new_password_title')}</Text>

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder={t('email_placeholder')} // Add translation key 'email_placeholder'
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email" // Use platform specific autocomplete
      />

      {/* Code Input */}
      <TextInput
        style={styles.input}
        placeholder={t('code_placeholder')} // Add translation key 'code_placeholder'
        value={code}
        onChangeText={setCode}
        // Consider keyboardType="numeric" if the code is always numbers
      />

      {/* New Password Input */}
      <TextInput
        style={styles.input}
        placeholder={t('new_password_placeholder')}
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        autoComplete="new-password" // Use platform specific autocomplete
      />

      {/* Confirm New Password Input */}
      <TextInput
        style={styles.input}
        placeholder={t('confirm_new_password_placeholder')}
        secureTextEntry
        value={confirmNewPassword}
        onChangeText={setConfirmNewPassword}
        autoComplete="new-password" // Use platform specific autocomplete
      />

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleSetNewPassword} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{t('set_new_password_button')}</Text>
        )}
      </TouchableOpacity>

      {/* Back Button */}
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
    marginTop: 10, // Added margin top for spacing
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