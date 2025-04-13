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
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useTranslation } from 'react-i18next';
import {
  AccessToken,
  LoginButton,
  Settings,
  Profile,
  LoginManager
} from "react-native-fbsdk-next";
import axios from 'axios';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const { t, i18n } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Configure Google Signin on mount
  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: '792696522665-vp6dhutocq45q7mq237hjppufmu8pvoj.apps.googleusercontent.com', // Replace with your iOS client ID
      webClientId: '792696522665-33mv7gd0b3ipnjbpj45711o9ifsoeno9.apps.googleusercontent.com', // Replace with your web client ID
      profileImageSize: 150,
    });
  }, []);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'bs' : 'en');
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
          'https://bazaar-system.duckdns.org/api/Auth/login/facebook',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: data.accessToken, app: "seller" }),
          }
        );
  
        const apiData = await response.json();
        console.log("API response:", apiData);
  
        await SecureStore.setItemAsync("accessToken", apiData.token);
        router.replace('../(tabs)/home');
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

  const loginWithGoogle = async () => {
    try {
      setIsSubmitting(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
  
      if (isSuccessResponse(response)) {
        const { idToken } = response.data;
        console.log("User Info:", { idToken });
  
         const apiResponse = await fetch("https://bazaar-system.duckdns.org/api/Auth/login/google", {
           method: "POST",
           headers: { "Content-Type": "application/json", },
           body: JSON.stringify({ idToken: idToken, app: "seller" }), 
         });
  
         if (apiResponse.status != 200) {
           Alert.alert(t('login_failed'), t('invalid_credentials'));
           return;
         }
  
         const result = await apiResponse.text();
         const accessToken = result;
  
         console.log("Access Token from BE:", accessToken);

         await SecureStore.setItemAsync("accessToken", accessToken);
  
         router.replace('../(tabs)/home');
      } else {
        console.log("Google Sign-in cancelled");
      }
  
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          console.log("User cancelled the sign-in");
          break;
        case statusCodes.IN_PROGRESS:
          console.log("Sign-in in progress");
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          console.log("Play services not available or outdated");
          break;
        default:
          console.warn("Unhandled Google Sign-in error code:", error.code);
          Alert.alert("Google Sign-in Error", error.message || "Unknown error occurred.");
      }
    } else {
      console.log("Unknown sign-in error", error);
      Alert.alert("Sign-in Error", "Something went wrong during Google sign-in.");
    }
    }
  };

  const onSignInPress = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('error'), t('fill_all_fields'));
      return;
    }
  
    try {
      setLoading(true);
  
      // Step 1: Send login request
      const loginRes = await fetch('http://127.0.0.1:5054/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, app: 'seller' }), 
      });
  
      const loginData: any = await loginRes.json();

      if (loginRes.status != 200) {
        Alert.alert(t('login_failed'), t('invalid_credentials'));
        return;
      }
  
      // Step 3: Destructure the token and approval status from loginData
      const { token, mail } = loginData;

      // Step 4: Check if the account is approved
      if (mail === false) {
        Alert.alert(t('access_denied'), t('account_not_approved'));
        return;
      }

      // Step 5: Store the token securely
      await SecureStore.setItemAsync('accessToken', token);
      // Step 6: Redirect to the logout screen or dashboard
      router.replace('../(tabs)/home');
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(t('error'), t('something_went_wrong'));
    } finally {
      setLoading(false);
    }
  };  

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
        <FontAwesome name="language" size={18} color="#4E8D7C" />
        <Text style={styles.languageText}>{i18n.language.toUpperCase()}</Text>
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>{t('greet')}</Text>
        <Text style={styles.subtitle}>{t('signin_subtitle')}</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder={t('email_placeholder')}
        placeholderTextColor="#64748b"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setEmailValid(isValidEmail(text));
        }}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder={t('password_placeholder')}
        placeholderTextColor="#64748b"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={onSignInPress} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{t('continue')}</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.text}>
        {t('no_account')}{' '}
        <Text style={styles.link} onPress={() => router.push('/register')}>
          {t('signup')}
        </Text>
      </Text>

      <Text style={styles.or}>{t('or')}</Text>

      <TouchableOpacity style={styles.socialButton} onPress={loginWithGoogle}>
        <FontAwesome name="google" size={20} color="#DB4437" />
        <Text style={styles.socialButtonText}>{t('login_google')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.socialButton} onPress={loginWithFacebook}>
        <FontAwesome name="facebook" size={20} color="#1877F2" />
        <Text style={styles.socialButtonText}>{t('login_facebook')}</Text>
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
  subtitle: {
    fontSize: 18,
    color: '#64748b',
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