import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useTranslation } from "react-i18next";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { apiLogin, fbLoginApi } from "../api/auth/loginApi";
import InputField from "@/components/ui/input/InputField";
//-------------------Route Explorer---------------------------------
import ScreenExplorer from "../../components/debug/ScreenExplorer";
import LanguageButton from "@/components/ui/LanguageButton";

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const { t, i18n } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Configure Google Signin on mount
  useEffect(() => {
    GoogleSignin.configure({
      iosClientId:
        "792696522665-vp6dhutocq45q7mq237hjppufmu8pvoj.apps.googleusercontent.com", // Replace with your iOS client ID
      webClientId:
        "792696522665-33mv7gd0b3ipnjbpj45711o9ifsoeno9.apps.googleusercontent.com", // Replace with your web client ID
      profileImageSize: 150,
    });
  }, []);

  const loginWithFacebook = async () => {
    try {
      const apiData = await fbLoginApi();

      await SecureStore.setItemAsync("accessToken", apiData.token);
      router.replace("../(tabs)/home");
    } catch (error) {
      console.error("Facebook login flow failed:", error);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setIsSubmitting(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const { idToken } = response.data;
        console.log("User Info:", { idToken });

        const apiResponse = await fetch(
          "https://bazaar-system.duckdns.org/api/Auth/login/google",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: idToken, app: "seller" }),
          }
        );

        if (apiResponse.status != 200) {
          Alert.alert(t("login_failed"), t("invalid_credentials"));
          return;
        }

        const result = await apiResponse.text();
        const accessToken = result;

        console.log("Access Token from BE:", accessToken);

        await SecureStore.setItemAsync("accessToken", accessToken);

        router.replace("../(tabs)/home");
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
            Alert.alert(
              "Google Sign-in Error",
              error.message || "Unknown error occurred."
            );
        }
      } else {
        console.log("Unknown sign-in error", error);
        Alert.alert(
          "Sign-in Error",
          "Something went wrong during Google sign-in."
        );
      }
    }
  };

  const onSignInPress = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t("error"), t("fill_all_fields"));
      return;
    }

    try {
      setLoading(true);
      const token = await apiLogin(email, password);
      // Step 5: Store the token securely
      await SecureStore.setItemAsync("accessToken", token);
      // Step 6: Redirect to the logout screen or dashboard
      router.replace("../(tabs)/home");
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(t("error"), t("something_went_wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LanguageButton />

      {/*---------------------Screen Explorer Button----------------------*/}
      <ScreenExplorer route="../(tabs)/screen_explorer" />
      {/*-----------------------------------------------------------------*/}

      <View style={styles.titleContainer}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>{t("greet")}</Text>
        <Text style={styles.subtitle}>{t("signin_subtitle")}</Text>
      </View>

      <InputField
        placeholder={t("email_placeholder")}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setEmailValid(isValidEmail(text));
        }}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <InputField
        placeholder={t("password_placeholder")}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

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

      <TouchableOpacity style={styles.socialButton} onPress={loginWithGoogle}>
        <FontAwesome name="google" size={20} color="#DB4437" />
        <Text style={styles.socialButtonText}>{t("login_google")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.socialButton} onPress={loginWithFacebook}>
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
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
});
