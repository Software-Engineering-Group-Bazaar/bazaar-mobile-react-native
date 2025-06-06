import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  AccessToken,
  LoginButton,
  Settings,
  Profile,
  LoginManager,
} from "react-native-fbsdk-next";
import i18next from "../src/i18n/i18n.config";

// Add Google Sign-In import
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";

import * as SecureStore from "expo-secure-store";

import Constants from 'expo-constants';
// import { baseURL, USE_DUMMY_DATA } from 'proba-package';

const baseURL = Constants.expoConfig!.extra!.apiBaseUrl as string;
const USE_DUMMY_DATA = Constants.expoConfig!.extra!.useDummyData as boolean;

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: Constants.expoConfig!.extra!.googleIosClientId as string,
        // "792696522665-dvhgjia0avus08gcni5rbvift7eki3qt.apps.googleusercontent.com",
      webClientId: Constants.expoConfig!.extra!.googleWebClientId as string,
        // "792696522665-mba0jlupiik9gk97q1qb6q3ctv33vk7t.apps.googleusercontent.com",
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

  const loginWithGoogle = async () => {
    try {
      setIsSubmitting(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
  
      if (isSuccessResponse(response)) {
        const { idToken } = response.data;
  
        console.log("User Info:", { idToken });
  
         const apiResponse = await fetch(baseURL + "/api/Auth/login/google", {
           method: "POST",
           headers: {
             "Content-Type": "application/json",
             "Accept": "text/plain",
           },
           body: JSON.stringify({ idToken: idToken, app: "buyer" }), // or "seller"
         });
  
         if (!apiResponse.ok) {
           let errorData = { message: "Došlo je do greške." };

          const contentType = apiResponse.headers.get("Content-Type") || "";
          if (contentType.includes("application/json")) {
            errorData = await apiResponse.json();
          } else {
            const text = await apiResponse.text();
            errorData.message = text;
          }

          console.log("Error response:", errorData);

          if (errorData.message.includes("unapproved")) {
            Alert.alert(t("access_denied"), t("account_not_approved"));
          } else if (errorData.message.includes("inactive")) {
            Alert.alert(t("access_denied"), t("account_not_active"));
          } else {
            Alert.alert(t("login_failed"), t("unexpected_error"));
          }
          return;
         }
  
         const result = await apiResponse.text();
         console.log(result)
         const accessToken = result;
  
         console.log("Access Token from BE:", accessToken);

         await SecureStore.setItemAsync("auth_token", accessToken);
  
        router.replace("/(tabs)/home");
      } else {
        console.log("Google Sign-in cancelled");
      }
  
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            console.log("Sign-in in progress");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.log("Play services not available");
            break;
          default:
            console.log("Unhandled error code", error.code, error);
        }
      } else {
        console.log("Unknown error during sign-in", error);
      }
    }
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

  const onSignInPress = async () => {
    if(USE_DUMMY_DATA){
      router.replace('/(tabs)/home');
      return;
    }

    if (!email.trim() || !password.trim()) {
      Alert.alert(t('error'), t('fill_all_fields'));
      return;
    }
  
    try {
      setLoading(true);
  
      console.log(JSON.stringify({ email, password, app:"buyer" }));

      // Step 1: Send login request
      const loginRes = await fetch( baseURL + '/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, app:"buyer" }) 
      });

      if(!loginRes.ok){
        let errorData = { message: "Došlo je do greške." };

          const contentType = loginRes.headers.get("Content-Type") || "";
          if (contentType.includes("application/json")) {
            errorData = await loginRes.json();
          } else {
            const text = await loginRes.text();
            errorData.message = text;
          }

          console.log("Error response:", errorData);

          if (errorData.message.includes("unapproved")) {
            Alert.alert(t("access_denied"), t("account_not_approved"));
          } else if (errorData.message.includes("inactive")) {
            Alert.alert(t("access_denied"), t("account_not_active"));
          } else {
            Alert.alert(t("login_failed"), t("unexpected_error"));
          }
          return;
      }
  
      const loginData: any = await loginRes.json();
  
      //if (loginRes.status != 200) {
        //Alert.alert(t('login_failed'), t('invalid_credentials'));
        //return;
      //}

      const { token, mail } = loginData;

      // Step 5: Store the token securely
      await SecureStore.setItemAsync('auth_token', token);
      // Step 6: Redirect to the logout screen or dashboard
      router.replace('/(tabs)/home');
  
    } catch (error) {
      console.log("Login error:", error);
      Alert.alert(t('error'), t('something_went_wrong'));
    } finally {
      setLoading(false);
    }
  }; 

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
        <FontAwesome name="language" size={18} color="#4E8D7C" />
        <Text style={styles.languageText}>{i18next.language.toUpperCase()}</Text>
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>{t("greet")}</Text>
        <Text style={styles.subtitle}>{t("signin_subtitle")}</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder={t("email_placeholder")}
        placeholderTextColor="#64748b"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder={t("password_placeholder")}
        placeholderTextColor="#64748b"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.text}>
        {t("forgot_question")}{" "}
      <Text style={styles.link} onPress={() => router.push("/(auth)/forgot_password")}>
        {t("reset_password")}
      </Text>
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={onSignInPress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{t("continue")}</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.text}>
        {t("no_account")}{" "}
        <Text style={styles.link} onPress={() => router.push("/register")}>
          {t("signup")}
        </Text>
      </Text>

      <Text style={styles.or}>{t("or")}</Text>

      <TouchableOpacity
        style={styles.socialButton}
        onPress={() => {
          loginWithGoogle();
        }}
      >
        <FontAwesome name="google" size={20} color="#DB4437" />
        <Text style={styles.socialButtonText}>{t("login_google")}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.socialButton}
        onPress={() => {
          loginWithFacebook();
        }}
      >
        <FontAwesome name="facebook" size={20} color="#1877F2" />
        <Text style={styles.socialButtonText}>{t("login_facebook")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: "#64748b",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: "#f7f7f7",
  },
  logo: {
    width: 420,
    height: 160,
    borderRadius: 80,
    marginBottom: 20,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#4E8D7C",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
  text: {
    fontSize: 14,
    color: "#333",
    marginBottom: 15,
  },
  link: {
    color: "#4E8D7C",
    fontWeight: "bold",
  },
  or: {
    fontSize: 16,
    color: "#999",
    marginVertical: 10,
  },
  socialButton: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  socialButtonText: {
    fontSize: 16,
    marginLeft: 10,
  },
  languageButtonContainer: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  languageButton: {
    position: "absolute",
    top: "5%",
    right: "5%",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f1f5f9",
    zIndex: 100,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  languageText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#4E8D7C",
    marginTop: 2,
  },
});
