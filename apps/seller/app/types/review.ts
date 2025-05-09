export interface BuyerInfo {
  id: string;
  name: string;
}

export interface SellerResponse {
  id: string;
  text: string;
  createdAt: string;
}

export interface Review {
  id: string;
  storeId: number;
  orderId: number; 
  buyer: BuyerInfo;
  rating: number;
  comment: string;
  createdAt: string;
  sellerResponse?: SellerResponse;
}

export interface SubmitResponsePayload {
  reviewId: string | number;
  orderId: number; 
  responseText: string;
}