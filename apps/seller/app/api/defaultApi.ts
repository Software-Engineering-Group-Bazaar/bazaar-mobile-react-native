import axios from "axios";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
<<<<<<< Updated upstream
  baseURL: "http://192.168.15.105:5054/api",
=======
  baseURL: "http://192.168.0.37:5054/api",
>>>>>>> Stashed changes
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
