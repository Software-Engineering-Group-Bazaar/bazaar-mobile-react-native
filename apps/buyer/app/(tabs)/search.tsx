import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TextInput } from 'react-native';
// Pretpostavka da ova putanja vodi do AŽURIRANE ProductItem komponente
import ProductItem from 'proba-package/product-item-buyer/index';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import { useCart } from '@/context/CartContext';

// Definicija za kategoriju proizvoda (ugniježđeni objekt) - mora biti ista kao u ProductItem
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

const USE_DUMMY_DATA = true; // Postavite na true za testiranje sa dummy podacima

// AŽURIRANI DUMMY_PRODUCTS prema novom formatu
const DUMMY_PRODUCTS: Product[] = [
  { id: 101, name: 'Mlijeko 1L', productCategory: { id: 1, name: 'Mliječni proizvodi' }, retailPrice: 2.50, wholesalePrice: 2.20, storeId: 123, photos: ['https://via.placeholder.com/150/ADD8E6/000000?Text=Mlijeko'] },
  { id: 102, name: 'Hljeb', productCategory: { id: 2, name: 'Pekarski proizvodi' }, retailPrice: 1.20, wholesalePrice: 1.00, storeId: 123, photos: ['https://via.placeholder.com/150/F0E68C/000000?Text=Hljeb'] },
  { id: 103, name: 'Jabuke 1kg', productCategory: { id: 3, name: 'Voće' }, retailPrice: 1.80, wholesalePrice: 1.50, weight: 1, weightUnit: 'kg', storeId: 123, photos: ['https://via.placeholder.com/150/90EE90/000000?Text=Jabuke'] },
  { id: 104, name: 'Banane 1kg', productCategory: { id: 3, name: 'Voće' }, retailPrice: 2.00, wholesalePrice: 1.70, weight: 1, weightUnit: 'kg', storeId: 123, photos: ['https://via.placeholder.com/150/FFFF00/000000?Text=Banane'] },
  { id: 105, name: 'Kruh pšenični', productCategory: { id: 2, name: 'Pekarski proizvodi' }, retailPrice: 1.50, wholesalePrice: 1.30, storeId: 123, photos: ['https://via.placeholder.com/150/F0E68C/000000?Text=Kruh'] },
  { id: 106, name: 'Jogurt 500g', productCategory: { id: 1, name: 'Mliječni proizvodi' }, retailPrice: 1.10, wholesalePrice: 0.90, weight: 500, weightUnit: 'g', storeId: 123, photos: ['https://via.placeholder.com/150/ADD8E6/000000?Text=Jogurt'] },
  { id: 107, name: 'Apple iPhone 13', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 999, wholesalePrice: 950, storeId: 456, photos: ['https://via.placeholder.com/150/87CEEB/FFFFFF?Text=Iphone'] },
  { id: 108, name: 'Samsung Galaxy S21', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 950, wholesalePrice: 900, storeId: 456, photos: ['https://via.placeholder.com/150/87CEEB/FFFFFF?Text=Samsung'] },
  { id: 109, name: 'Slušalice Bose', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 200, wholesalePrice: 180, storeId: 456, photos: ['https://via.placeholder.com/150/D3D3D3/000000?Text=Slušalice'] },
  { id: 110, name: 'Dell Monitor 24" Full HD', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 300, wholesalePrice: 280, storeId: 456, photos: ['https://via.placeholder.com/150/87CEEB/FFFFFF?Text=Monitor'] },
  { id: 111, name: 'Čaj Zeleni', productCategory: { id: 5, name: 'Pića' }, retailPrice: 3.00, wholesalePrice: 2.50, storeId: 789, photos: ['https://via.placeholder.com/150/32CD32/000000?Text=Čaj'] },
  { id: 112, name: 'Kafa Moka', productCategory: { id: 5, name: 'Pića' }, retailPrice: 5.50, wholesalePrice: 5.00, storeId: 789, photos: ['https://via.placeholder.com/150/D2691E/000000?Text=Kafa'] },
  { id: 113, name: 'Vino Cabernet Sauvignon', productCategory: { id: 6, name: 'Alkoholna pića' }, retailPrice: 15.00, wholesalePrice: 13.00, storeId: 789, photos: ['https://via.placeholder.com/150/8B0000/FFFFFF?Text=Vino'] },
  { id: 114, name: 'Pivo Heineken', productCategory: { id: 6, name: 'Alkoholna pića' }, retailPrice: 1.80, wholesalePrice: 1.50, storeId: 789, photos: ['https://via.placeholder.com/150/00FF00/FFFFFF?Text=Pivo'] },
  { id: 115, name: 'Računarski miš Logitech', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 25.00, wholesalePrice: 22.00, storeId: 456, photos: ['https://via.placeholder.com/150/D3D3D3/000000?Text=Miš'] },
  { id: 116, name: 'Gaming Monitor 27"', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 400, wholesalePrice: 380, storeId: 456, photos: ['https://via.placeholder.com/150/87CEEB/FFFFFF?Text=Gaming+Monitor'] },
  { id: 117, name: 'LED TV 40"', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 350, wholesalePrice: 330, storeId: 456, photos: ['https://via.placeholder.com/150/87CEEB/FFFFFF?Text=TV'] },
  { id: 118, name: 'Knjiga "The Great Gatsby"', productCategory: { id: 7, name: 'Knjige' }, retailPrice: 15.00, wholesalePrice: 12.00, storeId: 999, photos: ['https://via.placeholder.com/150/FF6347/FFFFFF?Text=Knjiga'] },
  { id: 119, name: 'Knjiga "1984"', productCategory: { id: 7, name: 'Knjige' }, retailPrice: 10.00, wholesalePrice: 8.00, storeId: 999, photos: ['https://via.placeholder.com/150/FF6347/FFFFFF?Text=Knjiga'] },
];


const SearchProductsScreen = () => {
  const { t } = useTranslation();
  // Stanje sada koristi AŽURIRANI Product interface
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null); // Eksplicitno tipiziranje greške
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchStoreProducts = async () => {
      setLoading(true); // Postavi loading na true na početku svakog fetcha
      setError(null);   // Resetuj grešku

      if (USE_DUMMY_DATA) {
        // Filtriranje radi na osnovu 'name', što je isto u oba formata
        const filteredProducts = DUMMY_PRODUCTS.filter(product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setProducts(filteredProducts);
        setLoading(false);
        return;
      }

      try {
        const authToken = await SecureStore.getItemAsync('auth_token');
        if (!authToken) {
            // Opcionalno: Rukovanje slučajem kada token nije pronađen
            // Možete preusmjeriti na login ili prikazati poruku
            throw new Error('Authentication token not found.');
        }

        // API endpoint - provjerite da li je ovo tačan endpoint za pretragu
        // Čini se da `searchTerm` treba da bude sam upit, a ne `search?query=...`
        const endpoint = `https://bazaar-system.duckdns.org/api/Catalog/search?searchTerm=${encodeURIComponent(searchQuery)}`;

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json' // Dobra praksa je dodati Content-Type
          }
        });

        if (!response.ok) {
          // Pokušaj pročitati tijelo odgovora za više detalja o grešci
          const errorBody = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody}`);
        }

        // Očekujemo niz Product objekata u novom formatu
        const data: Product[] = await response.json();
        setProducts(data);

      } catch (e: any) {
        console.error("Error fetching products:", e); // Loguj grešku za debug
        setError(e instanceof Error ? e : new Error('An unknown error occurred'));
      } finally {
         setLoading(false); // Uvijek postavi loading na false na kraju
      }
    };

    // Debounce search - opcionalno, ali poboljšava performanse
    // Ceka 500ms nakon prestanka kucanja prije pokretanja fetcha
    const debounceFetch = setTimeout(() => {
        fetchStoreProducts();
    }, 500);

    // Ocisti timeout ako se searchQuery promijeni prije isteka 500ms
    return () => clearTimeout(debounceFetch);

  }, [searchQuery]); // useEffect se pokreće samo kada se searchQuery promijeni

  // handleProductPress sada prima Product u NOVOM formatu
  const handleProductPress = (product: Product) => {
    console.log('Product pressed:', product.name, product.id, product.retailPrice);
    // Ovdje možete dodati logiku za navigaciju na detalje proizvoda, itd.
  };

  if (loading && products.length === 0) { // Prikazi indikator samo pri inicijalnom učitavanju
    return (
        <View style={styles.centered}>
            <ActivityIndicator size="large" color="#4e8d7c"/>
        </View>
    );
  }

  if (error) {
    return (
        <View style={styles.centered}>
             <Text style={styles.errorText}>{t('error_fetching_data')}: {error.message}</Text>
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder={t('search_products_placeholder')}
        value={searchQuery}
        onChangeText={setSearchQuery}
        clearButtonMode="while-editing" // Dodaje dugme za brisanje teksta (iOS)
      />
       {loading && <ActivityIndicator style={styles.loadingMoreIndicator} size="small" />}
      <View style={styles.listContainer}>
        {products.length === 0 && !loading ? (
            <Text style={styles.noResultsText}>{t('no_products_found')}</Text>
        ) : (
            <FlatList
            data={products}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                // Sada 'item' (koji je tipa Product) odgovara onome što ProductItem očekuje
                // handleProductPress također odgovara očekivanom tipu za onPress
                <ProductItem product={item} onPress={handleProductPress} onAddToCart={addToCart}/>
            )}
            // Opcionalno: Poboljšanja za FlatList
            // initialNumToRender={10}
            // maxToRenderPerBatch={10}
            // windowSize={10}
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
    backgroundColor: '#f8f8f8', // Malo neutralnija pozadina
  },
  centered: { // Stil za centriranje indikatora/greške
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  errorText: {
      color: 'red',
      textAlign: 'center',
      marginHorizontal: 20,
  },
  searchInput: {
    height: 45, // Malo viši input
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8, // Zaobljeniji rubovi
    paddingLeft: 15,
    marginBottom: 15, // Veći razmak
    backgroundColor: '#fff',
    fontSize: 16,
  },
  loadingMoreIndicator: {
      marginVertical: 10,
  },
  listContainer: {
    flex: 1, // Osigurava da lista zauzme preostali prostor
    backgroundColor: '#f8f8f8', // Originalna boja pozadine liste
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noResultsText: {
      textAlign: 'center',
      marginTop: 20,
      fontSize: 16,
      color: '#555',
  }
});

export default SearchProductsScreen;