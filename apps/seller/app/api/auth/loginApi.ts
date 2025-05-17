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
  } catch (error: any) {
    if (error.response) {
      const status = error.response.status;
      const responseData = error.response.data;

      if (status === 401) {
        const message = responseData?.message || "";
        // Customize messages based on backend's response
        if (message.includes("No user account with email address.")) {
          Alert.alert(t("login_failed"), t("invalid_credentials"));
        } else if (message.includes("User account is unapproved.")) {
          Alert.alert(t("access_denied"), t("account_not_approved"));
        } else {
          Alert.alert(t("login_failed"), t("unauthorized_access"));
        }
      } else {
        Alert.alert(t("login_failed"), t("unexpected_error"));
      }

      //console.error("Login error response:", error.response);
    } else {
      Alert.alert(t("login_failed"), t("network_error"));
      console.error("Login error:", error.response);
    }

    throw { message: "login_failed_handled", details: error.response?.data };
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

    if (data?.accessToken) {
      let payload = {
        accessToken: data.accessToken,
        app: "seller",
      };
      // call your backend
      const response = await fetch(
        "https://bazaar-system.duckdns.org/api/Auth/login/facebook",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      console.log(response);

      if (!response.ok) {
        let errorData = { message: "Došlo je do greške." };

        const contentType = response.headers.get("Content-Type") || "";
        if (contentType.includes("application/json")) {
          errorData = await response.json();
        } else {
          const text = await response.text();
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

      const result = await response.json();
      console.log("Login success:", result);
      return result;
    }
  } catch (error) {
    console.log("Jel udje wtf");
    console.error("Facebook login flow failed:", error);
  }
};
