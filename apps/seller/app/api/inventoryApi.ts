import { InventoryItem } from "../types/InventoryItem";
import api from "./defaultApi";
import { AxiosError } from "axios";

export const getInventory = async (
  storeId: string,
  productId: string
): Promise<InventoryItem> => {
  try {
    const response = await api.get<InventoryItem>("/Inventory", {
      params: { productId, storeId },
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;

    if (axiosError.response) {
      console.error(
        "API Error:",
        axiosError.response.status,
        axiosError.response.data
      );
    } else if (axiosError.request) {
      console.error("No response from server:", axiosError.request);
    } else {
      console.error("Error setting up request:", axiosError.message);
    }

    throw error;
  }
};
