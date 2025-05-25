export interface ProductLoyaltySetting {
  id: number; 
  name: string;
  currentPointRateFactor: number; 
  imageUrl?: string; 
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