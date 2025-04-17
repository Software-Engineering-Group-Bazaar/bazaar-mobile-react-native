import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
// Importuj ažurirani ProductItem koji očekuje novi format
import ProductItem from 'proba-package/product-item/index';
// Pretpostavljam da koristite i18next za t funkciju
import { useTranslation } from 'react-i18next';
// Importuj SecureStore ako planirate da koristite token za pravi API poziv
import * as SecureStore from 'expo-secure-store';

// Definicija za kategoriju proizvoda (ista kao u ProductItem i SearchProductsScreen)
interface ProductCategory {
  id: number;
  name: string;
}

// AŽURIRANA Product interface prema novom formatu
interface Product {
  id: number;
  name: string;
  productCategory: ProductCategory; // Umjesto productcategoryid
  retailPrice: number;             // Umjesto price
  wholesalePrice: number;         // Dodano
  weight?: number;                 // Ispravljen typo
  weightUnit?: string;             // Ispravljen typo
  volume?: number;
  volumeUnit?: string;
  storeId: number;                 // Umjesto storeID
  photos: string[];                // Umjesto imageUrl
}

// Postavite na false za korištenje pravog API-ja
const USE_DUMMY_DATA = true;

// AŽURIRANI DUMMY_PRODUCTS prema novom formatu
// Dodao sam wholesalePrice i primere za weight/volume gde ima smisla
// Također, osigurano da storeId odgovara primerima (123 i 456)
const DUMMY_PRODUCTS: Product[] = [
  { id: 101, name: 'Mlijeko 1L', productCategory: { id: 1, name: 'Mliječni proizvodi' }, retailPrice: 2.50, wholesalePrice: 2.20, volume: 1, volumeUnit: 'L', storeId: 1, photos: ['https://via.placeholder.com/150/ADD8E6/000000?Text=Mlijeko'] },
  { id: 102, name: 'Hljeb', productCategory: { id: 2, name: 'Pekarski proizvodi' }, retailPrice: 1.20, wholesalePrice: 1.00, weight: 500, weightUnit: 'g', storeId: 1, photos: ['https://via.placeholder.com/150/F0E68C/000000?Text=Hljeb'] },
  { id: 103, name: 'Jabuke 1kg', productCategory: { id: 3, name: 'Voće' }, retailPrice: 1.80, wholesalePrice: 1.50, weight: 1, weightUnit: 'kg', storeId: 1, photos: ['https://via.placeholder.com/150/90EE90/000000?Text=Jabuke'] },
  { id: 201, name: 'Laptop Dell', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 1200, wholesalePrice: 1100, storeId: 2, photos: ['https://via.placeholder.com/150/87CEEB/FFFFFF?Text=Laptop'] },
  { id: 202, name: 'Miš Logitech', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 25, wholesalePrice: 20, storeId: 2, photos: ['https://via.placeholder.com/150/D3D3D3/000000?Text=Mi%C5%A1'] },
  { id: 104, name: 'Jogurt 500g', productCategory: { id: 1, name: 'Mliječni proizvodi' }, retailPrice: 1.10, wholesalePrice: 0.90, weight: 500, weightUnit: 'g', storeId: 1, photos: ['https://via.placeholder.com/150/ADD8E6/000000?Text=Jogurt'] }, // Dodat proizvod za store 123
  { id: 203, name: 'Tastatura Mehanicka', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 80, wholesalePrice: 70, storeId: 2, photos: ['https://via.placeholder.com/150/D3D3D3/000000?Text=Tastatura'] }, // Dodat proizvod za store 456
];

const StoreProductsScreen = () => {
  const { storeId: storeIdString } = useLocalSearchParams<{ storeId: string }>();
  // Konvertuj storeId iz stringa u broj za poređenje i API pozive
  const storeId = storeIdString ? parseInt(storeIdString, 10) : undefined;
  const router = useRouter();
  const { t } = useTranslation(); // Pozovi hook za prevod
  // Koristi AŽURIRANI Product interface za stanje
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null); // Tipiziraj grešku

  useEffect(() => {
    // Ako storeId nije validan broj, nemoj ni pokretati fetch
    if (storeId === undefined || isNaN(storeId)) {
      setError(new Error(t('invalid_store_id') || 'Invalid Store ID')); // Koristi prevod ako postoji
      setLoading(false);
      return;
    }

    const fetchStoreProducts = async () => {
      setLoading(true);
      setError(null);

      if (USE_DUMMY_DATA) {
        // Filtriraj dummy podatke na osnovu storeId
        const filteredProducts = DUMMY_PRODUCTS.filter(p => p.storeId === storeId);
        console.log(`Using dummy data for store ID: ${storeId}. Found ${filteredProducts.length} products.`);
        // Simuliraj malo kašnjenje kao kod pravog API poziva
        setTimeout(() => {
          setProducts(filteredProducts);
          setLoading(false);
        }, 500); // 500ms kašnjenja
        return;
      }

      // --- Logika za pravi API poziv ---
      try {
        // // Dobavi token ako je API zaštićen
        const authToken = await SecureStore.getItemAsync('auth_token');
        // if (!authToken) {
        //   throw new Error(t('auth_token_not_found') || 'Authentication token not found.');
        // }
        // console.log(`http://192.168.0.25:5054/api/Catalog/products?storeId=${encodeURIComponent(storeId)}`);
        // Proveri da li ovaj endpoint zaista vraća proizvode za SPECIFIČNI storeId i u NOVOM formatu
        // const response = await fetch(`https://bazaar-system.duckdns.org/api/catalog/store/${storeId}/products`, {
        const response = await fetch(`https://bazaar-system.duckdns.org/api/Catalog/products?storeId=${encodeURIComponent(storeId)}`, {
          // Dodaj method i headers ako je potrebno (posebno Authorization)
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}` // Odkomentariši ako API zahteva token
          }
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody}`);
        }

        // Očekujemo niz Product objekata u NOVOM formatu
        const data: Product[] = await response.json();
        console.log(`API Data Received for store ID: ${storeId}:`, JSON.stringify(data, null, 2));
        setProducts(data);

      } catch (e: any) {
        console.error("Error fetching store products:", e);
        setError(e instanceof Error ? e : new Error(t('fetch-error') || 'Failed to fetch products'));
      } finally {
        setLoading(false);
      }
    };

    fetchStoreProducts();
  }, [storeId, t]); // Dodaj 't' u dependency array ako koristis prevod u useEffect-u

  // Funkcija sada prima Product u NOVOM formatu
  const handleProductPress = (product: Product) => {
    console.log('Proizvod pritisnut:', product.name, `(ID: ${product.id}, Cijena: ${product.retailPrice})`);
    // Primer navigacije na detalje proizvoda (prilagodi putanju ako je potrebno)
    // router.push(`/buyer/product/${product.id}`);
  };

  if (loading) {
    return (
        <View style={styles.centered}>
            <ActivityIndicator size="large" color="#4e8d7c" />
        </View>
    );
  }

  if (error) {
    return (
        <View style={styles.centered}>
             {/* Prikazujemo poruku o grešci */}
             <Text style={styles.errorText}>{error.message}</Text>
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        {products.length === 0 ? (
          <Text style={styles.noProductsText}>{t('no_products_in_store') || 'Nema proizvoda u ovoj prodavnici.'}</Text>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              // Prosleđujemo 'item' (novi Product format) i 'handleProductPress' (koji prima novi Product format)
              // ProductItem komponenta bi trebalo da ispravno radi sa ovim propsima
              <ProductItem
                product={item}
                onPress={handleProductPress}
              />
            )}
            // Opcionalno: Dodati malo paddinga na dnu liste
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f8f8f8', // Neutralna pozadina
  },
  centered: { // Za centriranje indikatora ili poruke o grešci
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  errorText: {
      color: 'red',
      fontSize: 16,
      textAlign: 'center',
  },
  listContainer: {
    flex: 1, // Da zauzme dostupan prostor
    backgroundColor: '#f8f8f8', // Originalna boja pozadine liste
    borderRadius: 10,
    paddingTop: 10, // Dodaj malo paddinga gore
    paddingHorizontal: 10, // Padding sa strane
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noProductsText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#555',
  }
});

export default StoreProductsScreen;