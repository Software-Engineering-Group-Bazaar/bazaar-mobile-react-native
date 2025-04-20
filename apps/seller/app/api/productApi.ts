import api from "./defaultApi";
import { Product } from "../types/proizvod";

// Dohvaca sve kategorije proizvoda
export async function apiFetchCategories(): Promise<
  { id: number; name: string }[]
> {
  try {
    const response = await api.get("/Catalog/categories");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Dohvaca sve proizvode iz prodavnice
export async function apiFetchAllProductsForStore(
  storeId: number
): Promise<Product[]> {
  try {
    const response = await api.get(`/Catalog/products`, {
      params: { storeId },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function apiFetchProductDetails(productId: number): Promise<Product | null> {
    try {
        const response = await api.get(`/Catalog/products/${productId}`);
        console.log(`Fetched details for product ${productId}:`, response.data);
        return response.data; 
    } catch (error: any) {
        console.error(`Error fetching product details for ID ${productId}:`, error.response?.data || error.message);
        return null; 
    }
}

interface UpdatePricesPayload {
    productId: number;
    retailPrice: number;
    wholesaleThreshold?: number | null; 
    wholesalePrice?: number | null; 
}
export async function apiUpdateProductPrices(payload: UpdatePricesPayload): Promise<any> {
    console.log("Calling API to update prices:", payload);
    const url = `Catalog/products/${payload.productId}/pricing`;
    console.log(url);

    return api.put(url, {
      retailPrice: payload.retailPrice,
      wholesaleThreshold: payload.wholesaleThreshold,
      wholesalePrice: payload.wholesalePrice,
    });
}

export async function apiUpdateProductAvailability(productId: number, isActive: boolean): Promise<any> {
    console.log("Calling API to update availability:", { productId, isActive });
    const url = `Catalog/products/${productId}/availability`;

    return api.put(url, { isActive }); 
}
