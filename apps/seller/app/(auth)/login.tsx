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
  Profile,
  LoginManager,
} from 'react-native-fbsdk-next';

// Google Sign-In imports
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export default function SignIn() {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailValid, setEmailValid] = useState(true);

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

  const loginWithFacebook = () => {
    LoginManager.logInWithPermissions(['public_profile', 'email']).then(
      function (result) {
        if (result.isCancelled) {
          console.log('==> Login cancelled');
        } else {
          console.log(result);
          AccessToken.getCurrentAccessToken().then((data) => {
            console.log(data);
            getUserFBData();
          });
        }
      },
      function (error) {
        console.log('==> Login fail with error: ' + error);
      }
    );
  };

  const getUserFBData = () => {
    Profile.getCurrentProfile().then((currentProfile) => {
      console.log(currentProfile);
    });
  };

  const onSignInPress = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('error'), t('fill_all_fields'));
      return;
    }

    try {
      setLoading(true);
      const loginRes = await fetch('https://your-backend.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'seller' }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        Alert.alert(t('login_failed'), loginData.message || t('invalid_credentials'));
        return;
      }

      const { token, id } = loginData;

      const approvalRes = await fetch(`https://your-backend.com/api/user/isapproved/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const approvalData = await approvalRes.json();

      if (!approvalRes.ok || approvalData.approved === false) {
        Alert.alert(t('access_denied'), t('account_not_approved'));
        return;
      }

      await SecureStore.setItemAsync('auth_token', token);
      router.replace('./(auth)/logout');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(t('error'), t('something_went_wrong'));
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In logic
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const { idToken } = response.data;
        console.log('Google Sign-In User Info:', { idToken });

        // OPTIONAL: Call your backend login endpoint with the Google idToken
        // const apiResponse = await fetch('https://your-backend.com/api/auth/login/google', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ idToken, role: 'seller' }),
        // });
        // const result = await apiResponse.json();
        // if (!apiResponse.ok) {
        //   Alert.alert(t('login_failed'), result.message || t('invalid_credentials'));
        //   return;
        // }
        // Optionally store token: await SecureStore.setItemAsync('auth_token', result.token);

        router.replace('./(auth)/logout');
      } else {
        console.log('Google Sign-In cancelled');
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            console.log('Sign-In in progress');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.log('Play services not available');
            break;
          default:
            console.log('Unhandled error code', error.code);
        }
      } else {
        console.log('Unknown error during Google Sign-In', error);
      }
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

      {/* Google Sign-In Button */}
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