export interface Product {
    id: number;
    name: string;
    photos: string[];
    productCategory: { id: number; name: string };
    retailPrice: number; 
    wholesaleThreshold?: number; 
    wholesalePrice?: number;    
    weight?: number;
    weightUnit?: string;
    volume?: number;
    volumeUnit?: string;
    isActive: boolean; // NOVO: 
    storeId: number;
}