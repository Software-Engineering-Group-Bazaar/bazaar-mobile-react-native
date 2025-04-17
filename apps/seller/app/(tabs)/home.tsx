import { Alert, View, Text, StyleSheet, Image } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useTranslation } from "react-i18next";
import ScreenExplorer from "@/components/debug/ScreenExplorer";
import { logoutApi } from "../api/auth/logoutApi";
import LanguageButton from "@/components/ui/LanguageButton";
import SubmitButton from "@/components/ui/input/SubmitButton";

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");

      const response = await logoutApi(token);

      if (response === 200) {
        await SecureStore.deleteItemAsync("accessToken");
        Alert.alert(t("logout_title"), t("logout_message"));
        router.replace("/(auth)/login");
      } else {
        Alert.alert(t("error"), t("logout_failed"));
        return;
      }
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert(t("error"), t("something_went_wrong"));
    }
  };

  return (
    <View style={styles.container}>
      <LanguageButton />

      {/*---------------------Screen Explorer Button----------------------*/}
      <ScreenExplorer route="../(tabs)/screen_explorer" />
      {/*-----------------------------------------------------------------*/}

      {/* Dodan logo */}
      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.welcomeText}>{t("greet")}</Text>
      <Text style={styles.subtitle}>{t("slogan")}</Text>

      <SubmitButton small={true} buttonText="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#4E8D7C",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 40,
  },
});
