import api from './defaultApi';
import { Product } from '../types/proizvod';

// Dohvaca sve kategorije proizvoda 
export async function apiFetchCategories(): Promise<{ id: number; name: string }[]> {
    try {
        const response = await api.get('/Catalog/categories');
        return response.data; 
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

// Dohvaca sve proizvode iz prodavnice
export async function apiFetchAllProductsForStore(storeId: number): Promise<Product[]> {
    try {
        const response = await api.get(`/Catalog/products`, {
            params: { storeId }
        });
        return response.data; 
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

