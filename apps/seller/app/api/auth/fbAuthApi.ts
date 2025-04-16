import api from "../defaultApi";

import {
  AccessToken,
  LoginButton,
  Settings,
  Profile,
  LoginManager,
} from "react-native-fbsdk-next";

const fbLoginApi = async () => {
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

export default fbLoginApi;
