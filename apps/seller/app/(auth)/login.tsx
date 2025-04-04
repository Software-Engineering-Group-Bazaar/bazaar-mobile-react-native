import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailValid, setEmailValid] = useState(true);

  const onSignInPress = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Greška", "Unesite sva tražena polja.");
      return;
    }

    try {
      setLoading(true);
      const loginRes = await fetch('https://your-backend.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: "seller" }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        Alert.alert("Neuspješan login", loginData.message || "Pogrešni podaci.");
        return;
      }

      const { token, id } = loginData;

      const approvalRes = await fetch(`https://your-backend.com/api/user/isapproved/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const approvalData = await approvalRes.json();

      if (!approvalRes.ok || approvalData.approved === false) {
        Alert.alert("Zabranjen pristup", "Vaš račun još uvijek nije odobren.");
        return;
      }

      await SecureStore.setItemAsync('auth_token', token);
      router.replace('./(auth)/logout');

    } catch (error) {
      console.error("Greška pri loginu:", error);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setEmailValid(isValidEmail(text)); 
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Welcome to The Shop</Text>
        <Text style={styles.subtitle}>Sign in to start selling</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email address*"
        placeholderTextColor="#64748b"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password*"
        placeholderTextColor="#64748b"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={onSignInPress} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue</Text>}
      </TouchableOpacity>

      <Text style={styles.text}>
        Don't have an account?{' '}
        <Text style={styles.link} onPress={() => router.push('/register')}>Sign Up</Text>
      </Text>

      <Text style={styles.or}>OR</Text>

      <TouchableOpacity style={styles.socialButton}>
        <FontAwesome name="google" size={20} color="#DB4437" />
        <Text style={styles.socialButtonText}>Log in via Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.socialButton}>
        <FontAwesome name="facebook" size={20} color="#1877F2" />
        <Text style={styles.socialButtonText}>Log in via Facebook</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center', 
    marginBottom: 20,
  },  
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f7f7f7',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#4E8D7C',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748b',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  text: {
    fontSize: 14,
    color: '#333',
    marginBottom: 15,
  },
  link: {
    color: '#4E8D7C',
    fontWeight: 'bold',
  },
  or: {
    fontSize: 16,
    color: '#999',
    marginVertical: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  socialButton: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  socialButtonText: {
    fontSize: 16,
    marginLeft: 10,
  },
});