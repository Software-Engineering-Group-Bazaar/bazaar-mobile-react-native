import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, StyleSheet, ActivityIndicator  } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [last_name, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignUpPress = async () => {
    if (!name.trim() || !last_name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Greška", "Unesite sva tražena polja.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://your-backend.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, last_name, email, password, role: "seller" }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Neuspješna registracija", data.message || "Neuspješno kreiranje računa.");
        return;
      }

      Alert.alert("Uspješna registracija", "Čekajte odobrenje za kreiranje računa.");
      router.replace('/(auth)/login');

    } catch (error) {
      console.error("Greška pri registraciji:", error);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Create Account</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="First Name*"
          placeholderTextColor="#64748b"
          value={name}
          onChangeText={setName}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Last Name*"
          placeholderTextColor="#64748b"
          value={last_name}
          onChangeText={setLastName}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
      <FontAwesome name="envelope" size={20} color="#888" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email address*"
          placeholderTextColor="#64748b"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={20} color="#888" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password*"
          placeholderTextColor="#64748b"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={onSignUpPress} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : (
          <>
            <FontAwesome name="user-plus" size={18} color="#fff" />
            <Text style={styles.buttonText}> Registracija</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.or}>OR</Text>

      <TouchableOpacity style={styles.socialButton}>
        <FontAwesome name="google" size={20} color="#DB4437" />
        <Text style={styles.socialButtonText}> Sign up with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.socialButton}>
        <FontAwesome name="facebook" size={20} color="#1877F2" />
        <Text style={styles.socialButtonText}> Sign up with Facebook</Text>
      </TouchableOpacity>

      <Text style={styles.text}>
        Already have an account?{' '}
        <Text style={styles.link} onPress={() => router.push('/login')}>Sign in</Text>
      </Text>
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
    marginBottom: 5,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748b',
  },
  text: {
    fontSize: 14,
    color: '#333',
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f7f7f7',
    marginBottom: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#4E8D7C',
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 10,
  },
  or: {
    fontSize: 16,
    color: '#999',
    marginVertical: 10,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  socialButtonText: {
    fontSize: 16,
    marginLeft: 10,
  },
  link: {
    color: '#4E8D7C',
    fontWeight: 'bold',
    marginTop: 10,
  },
});