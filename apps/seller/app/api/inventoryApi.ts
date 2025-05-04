import { InventoryItem } from "../types/InventoryItem";
import api from "./defaultApi";
import { AxiosError } from "axios";

export const apiFetchInventoryForProduct = async (
  storeId: number,
  productId: number
): Promise<InventoryItem> => {
  try {
    const response = await api.get<InventoryItem[]>("/Inventory", {
      params: { productId, storeId },
    });
    return response.data[0];
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

export const apiUpdateProductQuantity = async (
  productId: number,
  storeId: number,
  newQuantity: number
): Promise<InventoryItem | null> => {
  try {
    const response = await api.put("/Inventory/update/quantity", {
      productId,
      storeId,
      newQuantity,
    });

    if (response.status === 200) {
      return response.data as InventoryItem;
    }

    console.warn(`Unexpected status: ${response.status}`);
    return null;
  } catch (error: any) {
    if (error.response) {
      const { status } = error.response;
      switch (status) {
        case 400:
          console.error("Bad request");
          break;
        case 401:
          console.error("Unauthorized");
          break;
        case 403:
          console.error("Forbidden");
          break;
        case 404:
          console.error("Not found");
          break;
        default:
          console.error("Unhandled error:", error);
      }
    } else {
      console.error("Network or unknown error:", error);
    }

    return null;
  }
};
