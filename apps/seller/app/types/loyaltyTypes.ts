export interface ProductLoyaltySetting {
  id: number; 
  name: string;
  currentPointRateFactor: number; // Npr. 0, 1, 2, 3 (za 0x, 1x, 2x, 3x)
  imageUrl?: string; 
  // maxDiscountPercentage?: number | null; // Za kasnije
}

export interface LoyaltyReportData {
  totalIncome: number;
  paidToAdmin: number;
  pointsGiven: number;
  pointsUsed: number;
  compensatedAmount: number;
}

export interface PointRateOption {
  label: string;
  value: number;
}