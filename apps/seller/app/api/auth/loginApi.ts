import { Alert } from "react-native";
import api from "../defaultApi";
import { t } from "i18next";

const apiLogin = async (email: string, password: string) => {
  try {
    const loginRes = await api.post(
      "/Auth/login",
      {
        email,
        password,
        app: "seller",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Step 2: Get response
    const loginData: any = await loginRes.data;

    if (loginRes.status != 200) {
      Alert.alert(t("login_failed"), t("invalid_credentials"));
      return;
    }

    // Step 3: Destructure the token and approval status from loginData
    const { token, mail } = loginData;

    // Step 4: Check if the account is approved
    if (mail === false) {
      Alert.alert(t("access_denied"), t("account_not_approved"));
      return;
    }

    return token;
  } catch (error) {
    console.error("Login error:", error);
    throw error; // or handle it differently
  }
};

export default apiLogin;
