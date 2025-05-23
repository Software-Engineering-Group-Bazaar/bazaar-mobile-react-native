import { LoyaltyReportData, ProductLoyaltySetting } from "../types/LoyaltyTypes"; 
import api from "./defaultApi"; 

const MOCK_PRODUCTS_LOYALTY_DB: ProductLoyaltySetting[] = [
  { id: 101, name: "Proizvod Lojalnosti 1", currentPointRateFactor: 1, imageUrl: "https://via.placeholder.com/60" },
  { id: 102, name: "Proizvod Lojalnosti 2 (Dupli)", currentPointRateFactor: 2, imageUrl: "https://via.placeholder.com/60" },
  { id: 103, name: "Proizvod Lojalnosti 3 (Bez)", currentPointRateFactor: 0 },
  { id: 104, name: "Još Jedan Proizvod", currentPointRateFactor: 1 },
  { id: 105, name: "Proizvod Peti - Specijalni", currentPointRateFactor: 3, imageUrl: "https://via.placeholder.com/60" },
];

// Dohvata proizvode Sellera sa njihovim loyalty postavkama
export async function apiFetchSellerProductsWithLoyalty(storeId: number): Promise<ProductLoyaltySetting[]> {
  console.log(`API MOCK: Fetching products with loyalty settings for store ${storeId}`);
  // TODO: Implementiraj stvarni API poziv
  // Primer sa Axiosom:
  // const response = await api.get<ProductLoyaltySetting[]>(`/loyalty/store/${storeId}/products`);
  // return response.data;
  return new Promise(resolve => setTimeout(() => resolve([...MOCK_PRODUCTS_LOYALTY_DB]), 1000));
}

// Ažurira PointRate za specifični proizvod
export async function apiUpdateProductPointRate(
  productId: number,
  storeId: number, 
  newPointRateFactor: number
): Promise<ProductLoyaltySetting | null> {
  console.log(`API MOCK: Updating product ${productId} in store ${storeId} to newPointRateFactor ${newPointRateFactor}`);
  // TODO: Implementiraj stvarni API poziv
  // Primjer sa Axiosom:
  // const response = await api.put<ProductLoyaltySetting>(`/product/${productId}/point-rate`, { pointRateFactor: newPointRateFactor });
  // return response.data;

  if (Math.random() > 0.1) { 
    const productIndex = MOCK_PRODUCTS_LOYALTY_DB.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      MOCK_PRODUCTS_LOYALTY_DB[productIndex] = { ...MOCK_PRODUCTS_LOYALTY_DB[productIndex], currentPointRateFactor: newPointRateFactor };
      return { ...MOCK_PRODUCTS_LOYALTY_DB[productIndex] };
    }
  }
  return null;
}

// Dohvata podatke za loyalty izvještaj
export async function apiFetchLoyaltyReport(
  storeId: number,
  dateFrom?: string,
  dateTo?: string
): Promise<LoyaltyReportData> { 
    console.log(`API MOCK: Fetching loyalty report for store ${storeId}`, {dateFrom, dateTo});
    return new Promise(resolve => setTimeout(() => resolve({
        totalIncome: 12500 + Math.floor(Math.random() * 1000),
        paidToAdmin: 320 + Math.floor(Math.random() * 50),
        redeemedWithPoints: 480 + Math.floor(Math.random() * 100),
    }), 800));
}