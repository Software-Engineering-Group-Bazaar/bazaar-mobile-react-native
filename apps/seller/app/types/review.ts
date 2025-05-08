

export interface BuyerInfo {
    id: string; // Ili number, zavisi od backenda
    name: string;
    // avatarUrl?: string; //  ako backend šalje
  }
  
  export interface SellerResponse {
    id: string; // Ili number
    text: string;
    createdAt: string; // Format datuma kao string ili Date objekat
    // respondedBy?: string; // Ime prodavca koji je odgovorio
  }

  export interface Review {
    id: string; 
    storeId: number; // ID prodavnice na koju se review odnosi
    buyer: BuyerInfo;
    rating: number; // npr. 1-5
    comment: string;
    createdAt: string; // Format datuma kao string ili Date objekat
    sellerResponse?: SellerResponse; // Odgovor prodavca je opcioni
  }
  
  // Tip za payload kada se šalje odgovor
  export interface SubmitResponsePayload {
    reviewId: string; // Ili number
    responseText: string;
  }