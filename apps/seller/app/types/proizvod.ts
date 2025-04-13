export interface Product {
    id: number;
    name: string;
    photos: string[];  
    productCategory: { id: number; name: string };  
    retailPrice?: number;
    wholesalePrice: number;
    weight?: number;  
    weightUnit?: string; 
    volume?: number;  
    volumeUnit?: string; 
    storeId: number;
}
