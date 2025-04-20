import { useState, useEffect } from "react";
import { View, Text, Image, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
// Google Sign-In imports
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import * as SecureStore from "expo-secure-store";
import { registerApi } from "../api/auth/registerApi";
import { fbLoginApi } from "../api/auth/loginApi";
//-------------------Route Explorer---------------------------------
import ScreenExplorer from "../../components/debug/ScreenExplorer";
import LanguageButton from "@/components/ui/LanguageButton";
import InputField from "@/components/ui/input/InputField";
import SubmitButton from "@/components/ui/input/SubmitButton";

export default function SignUp() {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const [name, setName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

  const onSignUpPress = async () => {
    if (
      !email.trim() ||
      !password.trim() ||
      !name.trim() ||
      !last_name.trim()
    ) {
      Alert.alert(t("error"), t("fill_all_fields"));
      return;
    }

    const username = `${name}${last_name}`;
    setLoading(true);

    try {
      registerApi(username, email, password);
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error during registration:", error);
      Alert.alert(t("error"), t("something_went_wrong"));
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-Up logic
  const registerWithGoogle = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const { idToken } = response.data;
        console.log("Google Sign-Up User Info:", { idToken });

        const apiResponse = await fetch(
          "http://192.168.15.104:5054/api/Auth/login/google",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: idToken, app: "seller" }),
          }
        );

        if (!apiResponse.ok) {
          Alert.alert(t("signup_failed"), t("signup_failed_fallback"));
          return;
        }

        const result = await apiResponse.text();
        const accessToken = result;
        console.log("Access Token from BE:", accessToken);
        await SecureStore.setItemAsync("accessToken", accessToken);

        Alert.alert(t("signup_success"), t("wait_for_approval"));
        router.replace("/(auth)/login");
      } else {
        console.log("Google Sign-Up cancelled");
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            console.log("Sign-Up in progress");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.log("Play services not available");
            break;
          default:
            console.log("Unhandled error code", error.code);
        }
      } else {
        console.log("Unknown error during Google Sign-Up", error);
      }
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
        <Text style={styles.title}>{t("create_account")}</Text>
      </View>

      <InputField
        placeholder={t("first_name")}
        value={name}
        onChangeText={setName}
      />

      <InputField
        placeholder={t("last_name")}
        value={last_name}
        onChangeText={setLastName}
      />

      <InputField
        placeholder={t("email_placeholder")}
        value={email}
        onChangeText={setEmail}
        icon="envelope"
        keyboardType="email-address"
      />

      <InputField
        icon="lock"
        placeholder={t("password_placeholder")}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <SubmitButton
        loading={loading}
        buttonText={t("continue")}
        onPress={onSignUpPress}
        icon="user-plus"
      />

      <Text style={styles.or}>{t("or")}</Text>

      <SubmitButton
        buttonText={t("login_google")}
        social={true}
        icon="google"
        onPress={registerWithGoogle}
      />

      <SubmitButton
        buttonText={t("login_facebook")}
        social={true}
        icon="facebook"
        onPress={loginWithFacebook}
      />

      <Text style={styles.text}>
        {t("already_have_account")}{" "}
        <Text style={styles.link} onPress={() => router.push("/login")}>
          {t("sign_in")}
        </Text>
      </Text>
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
    marginBottom: 5,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  or: {
    fontSize: 16,
    color: "#999",
    marginVertical: 10,
  },
  text: {
    fontSize: 14,
    color: "#333",
    marginBottom: 15,
  },
  link: {
    color: "#4E8D7C",
    fontWeight: "bold",
    marginTop: 10,
  },
});
