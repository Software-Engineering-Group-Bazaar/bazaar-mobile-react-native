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
    const response = await api.get("/Stores/MyStore");
    console.log(response);

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
    const response = await api.post("/Stores", storeInfo);
    if (response.status === 200 || response.status === 201) {
      Alert.alert(t("success"), t("store_updated"));
      return true;
    } else {
      throw new Error("Unexpected response status: " + response.status);
    }
  } catch (error) {
    console.error("Error fetching stores:", error);
    throw error;
  }
}

// Treba napraviti funckiju za dobavljanje gradova

//------------------------MOCK apiGetRegionsAsync------------------------
export interface Region {
  id: number;
  name: string;
  country: string;
}

// Mocked data from your screenshot
const mockRegions: Region[] = [
  { id: 1, name: "Kanton Sarajevo", country: "ba" },
  { id: 2, name: "Tuzlanski kanton", country: "ba" },
  { id: 3, name: "Zeničko-dobojski kanton", country: "ba" },
  { id: 4, name: "Hercegovačko-neretvanski kanton", country: "ba" },
  { id: 5, name: "Unsko-sanski kanton", country: "ba" },
  { id: 6, name: "Srednjobosanski kanton", country: "ba" },
  { id: 7, name: "Brčko Distrikt", country: "ba" },
  { id: 8, name: "Banjalučka regija", country: "ba" },
];

// Simulate API delay
export const apiGetRegionsAsync = (): Promise<Region[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockRegions);
    }, 100); // optional delay to simulate loading
  });
};
//------------------------MOCK apiGetRegionsAsync------------------------
