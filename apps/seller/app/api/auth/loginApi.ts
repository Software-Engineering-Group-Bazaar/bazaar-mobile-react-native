import { Alert } from "react-native";
import api from "../defaultApi";
import { AccessToken, LoginManager } from "react-native-fbsdk-next";
import { t } from "i18next";

export const apiLogin = async (email: string, password: string) => {
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

export const fbLoginApi = async () => {
  try {
    const result = await LoginManager.logInWithPermissions([
      "public_profile",
      "email",
    ]);

    if (result.isCancelled) {
      console.log("==> Login cancelled");
      return;
    }

    console.log(result);

    const data = await AccessToken.getCurrentAccessToken();
    console.log(data);

    if (data?.accessToken) {
      // call your backend
      const response = await api.post(
        "Auth/login/facebook",
        {
          accessToken: data.accessToken,
          app: "seller",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const apiData = await response.data;
      console.log("API response:", apiData);
      return apiData;
    }
  } catch (error) {
    console.error("Facebook login flow failed:", error);
  }
};
