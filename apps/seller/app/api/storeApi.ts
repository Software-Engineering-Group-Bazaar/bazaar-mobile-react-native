import api from './defaultApi';
import { Store } from '../types/prodavnica';


// Dohvacanje svih kategorija prodavnica
export async function apiFetchAllCategoriesAsync(): Promise<{ label: string; value: number }[]> {
   try {
       const response = await api.get('/Stores/Categories');
       const data = response.data;

       const formatted = data.map((cat: any) => ({
           label: cat.name,
           value: cat.id,
       }));

       console.log('Fetched categories:', formatted);
       return formatted;
   } catch (error) {
       console.error('Failed to fetch categories:', error);
       return [];
   }
}
/*
// Dohvacanje svih prodavnica
export async function apiFetchActiveStores(): Promise<Store[]> {
   try {
       const response = await api.get('/Stores/MyStore');
       console.log(response);


       const activeStores = response.data.filter((store: Store) => store.isActive === true);
       return activeStores;
   } catch (error) {
       console.error('Error fetching stores:', error);
       return [];
   }
} */
export async function apiFetchActiveStores(): Promise<Store[]> {
   try {
       const response = await api.get('/Stores/MyStore');
       console.log(response);

       const store = response.data;

       if (store && store.isActive === true) {
           return [store]; // Vrati je kao niz sa jednim elementom
       } else {
           return [];
       }
    } catch (error: any) { // Explicitly type error for better handling
        if (error.response?.status === 404) {
            console.warn("No stores found, returning empty array.");
            return []; // ✅ Gracefully handle 404 without logging it as an error
        }
        
        console.error("Error fetching stores:", error);
        return []; // ✅ Still returns an empty array for other errors
    }
}

