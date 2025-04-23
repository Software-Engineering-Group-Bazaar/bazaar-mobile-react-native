import { Alert } from "react-native";
import api from "../defaultApi";
import { t } from "i18next";

export const registerApi = async (
  username: string,
  email: string,
  password: string
) => {
  try {
    const response = await api.post(
      "Auth/register",
      { username, email, password, app: 'seller' },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await response.data;
    console.log(data);

    if (response.status !== 200) {
      // If status is not 200–299
      console.error("Registration failed:", data);
      Alert.alert(t("error"), data.message || t("something_went_wrong"));
      return;
    }
    Alert.alert(t("signup_success"), t("wait_for_approval"));
  } catch {}
};
