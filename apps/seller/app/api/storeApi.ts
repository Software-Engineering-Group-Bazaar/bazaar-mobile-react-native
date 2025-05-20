import api from "./defaultApi";
import { Store } from "../types/prodavnica";
import { t } from "i18next";
import { Alert } from "react-native";

// Dohvacanje svih kategorija prodavnica
export async function apiFetchAllCategoriesAsync(): Promise<
  { label: string; value: number }[]
> {
  try {
    const response = await api.get("/Stores/Categories");
    const data = response.data;

    const formatted = data.map((cat: any) => ({
      label: cat.name,
      value: cat.id,
    }));

    console.log("Fetched categories:", formatted);
    return formatted;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function apiFetchActiveStore(): Promise<Store | null> {
  try {
    const response = await api.get("Stores/MyStore");
    const store = response.data;

    if (store && store.isActive === true) {
      return store; // Vrati je kao niz sa jednim elementom
    } else {
      return null;
    }
  } catch (error: any) {
    // Explicitly type error for better handling
    if (error.response?.status === 404) {
      console.warn("No stores found, returning empty array.");
      return null; // ✅ Gracefully handle 404 without logging it as an error
    }

    console.error("Error fetching stores:", error);
    return null; // ✅ Still returns an empty array for other errors
  }
}

export async function apiCreateNewStoreAsync(
  storeInfo: Record<string, any>
): Promise<boolean> {
  try {
    console.log(storeInfo);
    const response = await api.post("Stores", storeInfo);
    if (response.status === 200 || response.status === 201) {
      Alert.alert(t("success"), t("store_updated"));
      return true;
    } else {
      throw new Error("Unexpected response status: " + response.status);
    }
  } catch (error: any) {
    console.error("Error creating store:", error);
  
    // Log the error response if available (useful for debugging API issues)
    if (error.response) {
      console.error("Response Data:", error.response.data);
      console.error("Response Status:", error.response.status);
      console.error("Response Headers:", error.response.headers);
    }
    throw error;
  }
}

export async function apiGetRegionsAsync() {
  try {
    const response = await api.get("/Geography/regions");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch regions:", error);
    return [];
  }
}

export async function apiGetPlacesAsync(regionId: number) {
  try {
    const response = await api.get(`/Geography/region/${regionId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch places:", error);
    return [];
  }
}
