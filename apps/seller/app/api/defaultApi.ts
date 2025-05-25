import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { baseURL } from "../env";

const api = axios.create({
  baseURL: `https://bazaar-system.duckdns.org/api`,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
