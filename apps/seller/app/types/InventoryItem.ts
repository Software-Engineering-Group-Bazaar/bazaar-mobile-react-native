export type InventoryItem = {
  id: number;
  productId: number;
  storeId: number;
  productName: string;
  quantity: number;
  outOfStock: boolean;
  lastUpdated: string; // ISO date string
};
