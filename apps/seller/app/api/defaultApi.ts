import axios from "axios";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
<<<<<<< HEAD
  baseURL: "http://192.168.0.34:5054/api",
=======
  baseURL: "http://192.168.15.104:5054/api",
>>>>>>> 25d3e51 (Doradjen inbox)
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
