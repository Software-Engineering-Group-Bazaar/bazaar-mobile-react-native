import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {
  AccessToken,
  Profile,
  LoginManager,
} from 'react-native-fbsdk-next';
import i18next from "../src/i18n/i18n.config";

// Import Google Sign-In functions
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import * as SecureStore from 'expo-secure-store';

import Constants from 'expo-constants';

const baseURL = Constants.expoConfig!.extra!.apiBaseUrl as string;
const USE_DUMMY_DATA = Constants.expoConfig!.extra!.useDummyData as boolean;


export default function SignUp() {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const [name, setName] = useState('');
  const [last_name, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Configure Google Signin on mount
  useEffect(() => {
    GoogleSignin.configure({
      iosClientId:  Constants.expoConfig!.extra!.googleIosClientId as string,
      webClientId: Constants.expoConfig!.extra!.googleWebClientId as string,
      profileImageSize: 150,
    });
  }, []);

  const toggleLanguage = () => {
    let lang;
    switch (i18next.language) {
      case "en":
        lang = "bs";
        break;
      case "bs":
        lang = "de";
        break;
      case "de":
        lang = "es";
        break;
      case "es":
        lang = "en";
        break;
      default:
        lang = "en";
    }
    i18next.changeLanguage(lang);
    i18next.language = lang;
  };

  const loginWithFacebook = async () => {
    try {
      const result = await LoginManager.logInWithPermissions(["public_profile", "email"]);
      if (result.isCancelled) {
        console.log("==> Login cancelled");
        return;
      }
      console.log(result);
  
      const data = await AccessToken.getCurrentAccessToken();
      console.log(data);
  
      if (data?.accessToken) {
        // call your backend
        const response = await fetch(
          baseURL + '/api/Auth/login/facebook',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: data.accessToken, app: "buyer" }),
          }
        );
  
        const apiData = await response.json();
        console.log("API response:", apiData);
  
        await SecureStore.setItemAsync("auth_token", apiData.token);
        router.replace("/(tabs)/home");
        getUserFBData();
      }
    } catch (error) {
      console.error("Facebook login flow failed:", error);
    }
  };
  

  const getUserFBData = () => {
    Profile.getCurrentProfile().then((currentProfile) => {
      console.log(currentProfile);
    });
  };

  const onSignUpPress = async () => {
    if (!email.trim() || !password.trim() || !name.trim() || !last_name.trim()) {
      Alert.alert(t('error'), t('fill_all_fields'));
      return;
    }
  
    const username = `${name}${last_name}`;
    setLoading(true);
  
    try {
      console.log("Udje?")
      // const response = await fetch('http://192.168.0.25:5054/api/Auth/register', {
      const response = await fetch(baseURL + '/api/Auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, app: "buyer"}),
      });
  
      const data = await response.json(); // Get the JSON from the response
  
      if (!response.ok) {
        // If status is not 200–299
        console.error("Registration failed:", data);
        Alert.alert(t('error'), data.message || t('something_went_wrong'));
        return;
      }
  
      Alert.alert(t('signup_success'), t('wait_for_approval'));
      router.replace('/(auth)/login');
  
    } catch (error) {
      console.error('Error during registration:', error);
      Alert.alert(t('error'), t('something_went_wrong'));
    } finally {
      setLoading(false);
    }
  }; 

  const registerWithGoogle = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const { idToken } = response.data;
        console.log('Google Sign-Up User Info:', { idToken });

        // OPTIONAL: Call your backend register endpoint with the Google idToken
         const apiResponse = await fetch(baseURL + '/api/Auth/login/google', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ idToken: idToken, app: "buyer" }),
         });
         const token = await apiResponse.text();
         if (!apiResponse.ok) {
           Alert.alert(t('signup_failed'), token || t('signup_failed_fallback'));
           return;
         }
         await SecureStore.setItemAsync('auth_token', token);

        // Navigate to home screen or any other page as needed
        router.replace('/(tabs)/home');
      } else {
        console.log('Google Sign-Up cancelled');
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            console.log('Sign-Up in progress');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.log('Play services not available');
            break;
          default:
            console.log('Unhandled error code', error.code);
        }
      } else {
        console.log('Unknown error during Google Sign-Up', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
        <FontAwesome name="language" size={20} color="#4E8D7C" />
        <Text style={styles.languageText}>{i18n.language.toUpperCase()}</Text>
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
        <Text style={styles.title}>{t('create_account')}</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={t('first_name')}
          placeholderTextColor="#64748b"
          value={name}
          onChangeText={setName}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={t('last_name')}
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
          placeholder={t('email_placeholder')}
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
          placeholder={t('password_placeholder')}
          placeholderTextColor="#64748b"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={onSignUpPress} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <FontAwesome name="user-plus" size={18} color="#fff" />
            <Text style={styles.buttonText}>{t('sign_up')}</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.or}>{t('or')}</Text>

      {/* Google Sign-Up Button */}
      <TouchableOpacity style={styles.socialButton} onPress={registerWithGoogle}>
        <FontAwesome name="google" size={20} color="#DB4437" />
        <Text style={styles.socialButtonText}> {t('signup_google')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.socialButton} onPress={loginWithFacebook}>
        <FontAwesome name="facebook" size={20} color="#1877F2" />
        <Text style={styles.socialButtonText}> {t('signup_facebook')}</Text>
      </TouchableOpacity>

      <Text style={styles.text}>
        {t('already_have_account')}{' '}
        <Text style={styles.link} onPress={() => router.push('/login')}>
          {t('sign_in')}
        </Text>
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
    width: 420,
    height: 160,
    borderRadius: 80,
    marginBottom: 0,
    marginTop: 20,
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
  text: {
    fontSize: 14,
    color: '#333',
    marginBottom: 15,
  },
  link: {
    color: '#4E8D7C',
    fontWeight: 'bold',
    marginTop: 10,
  },
  languageButton: {
    position: 'absolute',
    top: '5%',
    right: '5%',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f1f5f9',
    zIndex: 100,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  languageText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4E8D7C',
    marginTop: 2,
  },
});
