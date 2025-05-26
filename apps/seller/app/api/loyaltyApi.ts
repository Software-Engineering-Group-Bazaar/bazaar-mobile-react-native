import { store } from "expo-router/build/global-state/router-store";
import { LoyaltyReportData, ProductLoyaltySetting } from "../types/loyaltyTypes"; 
import api from "./defaultApi"; 

interface ApiProductResponse {
  id: number;
  name: string;
  productCategory: { id: number; name: string };
  retailPrice: number;
  wholesaleThreshold: number | null;
  wholesalePrice: number | null;
  weight: number | null;
  weightUnit: string | null;
  volume: number | null;
  volumeUnit: string | null;
  isActive: boolean;
  storeId: number;
  photos: string[]; 
  pointRate: number; 
  description?: string; 
}

export async function apiFetchSellerProductsWithLoyalty(storeId: number): Promise<ProductLoyaltySetting[]> {
  console.log(`API: Fetching products with loyalty settings for store ${storeId}`);
  try {
    const response = await api.get<ApiProductResponse[]>("/Catalog/products", {
      params: { storeId }, 
    });

    if (response.data && Array.isArray(response.data)) {
      return response.data.map(product => ({
        id: product.id,
        name: product.name,
        currentPointRateFactor: product.pointRate, 
        imageUrl: product.photos && product.photos.length > 0 ? product.photos[0] : undefined,
      }));
    }
    return []; 
  } catch (error) {
    console.error("API Error fetching seller products with loyalty:", error);
    throw error; 
  }
}

export async function apiUpdateProductPointRate(
  productId: number,
  newPointRateFactor: number
): Promise<boolean> { 
  console.log(`API: Updating product ${productId} to newPointRateFactor ${newPointRateFactor}`);
  try {
    const response = await api.put(
      `/Catalog/product/${productId}/point-rate`, 
      { pointRate: newPointRateFactor } 
    );
    return response.status === 204;
  } catch (error) {
    console.error(`API Error updating point rate for product ${productId}:`, error);
    throw error;
  }
}

// Dohvata podatke za loyalty izvještaj
export async function apiFetchLoyaltyReport(
  storeId: number,
  dateFrom?: string,
  dateTo?: string
){ 
  try {
    const totalIncome = await api.get('/Stores/income', {
      params: {
        from: dateFrom,
        to: dateTo
      }
    });

    const pointsGiven = await api.get('/Stores/points', {
      params: {
        from: dateFrom,
        to: dateTo
      }
    });

    const paidToAdmin = await api.get('/Loyalty/admin/income', {
      params: {
        from: dateFrom,
        to: dateTo,
        storeIds: storeId
      }
    });

    const compensation = await api.get(`/Loyalty/store/${storeId}/income`, {
      params: {
        from: dateFrom,
        to: dateTo
      }
    });
    console.log(compensation.data)

    const adminToSellerRate = await api.get('/Loyalty/consts/admin/seller');

    if (totalIncome.data && pointsGiven && paidToAdmin && compensation && adminToSellerRate) {
      const returnedPoints = Math.round(compensation.data / adminToSellerRate.data);
      return new Promise(resolve => setTimeout(() => resolve({
        totalIncome: totalIncome.data.totalIncome,
        pointsGiven: pointsGiven.data,
        paidToAdmin: paidToAdmin.data,
        pointsUsed: returnedPoints,
        compensatedAmount: compensation.data
      }), 800));
    }

    return null; 
  } catch (error) {
    console.error('Failed to fetch total income:', error);
    return null; 
  }

}