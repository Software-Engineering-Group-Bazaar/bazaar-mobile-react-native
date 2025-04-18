import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TextInput } from 'react-native';
import ProductItem from 'proba-package/product-item/index';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

interface ProductCategory {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  productCategory: ProductCategory;
  retailPrice: number;
  wholesalePrice: number;
  weight?: number;
  weightUnit?: string;
  volume?: number;
  volumeUnit?: string;
  storeId: number;
  photos: string[];
  isAvailable: boolean;
  wholesaleThreshold?: number;
}

interface Store {
  id: number;
  name: string;
  address: string;
  description?: string;
  isActive: boolean;
  categoryid: number;
  logoUrl?: string;
}

interface StoreWithProducts {
  Store: Store;
  Products: Product[];
}

const USE_DUMMY_DATA = true; // Postavite na true za testiranje s dummy podacima

const DUMMY_PRODUCTS: Product[] = [
  { id: 101, name: 'Mlijeko 1L', productCategory: { id: 1, name: 'Mliječni proizvodi' }, retailPrice: 2.50, wholesalePrice: 2.20, storeId: 1, photos: ['https://via.placeholder.com/300/ADD8E6/000000?Text=Mlijeko'], isAvailable: true, wholesaleThreshold: 10 },
  { id: 102, name: 'Hljeb', productCategory: { id: 2, name: 'Pekarski proizvodi' }, retailPrice: 1.20, wholesalePrice: 1.00, storeId: 1, photos: ['https://via.placeholder.com/300/F0E68C/000000?Text=Hljeb'], isAvailable: true },
  { id: 103, name: 'Jabuke 1kg', productCategory: { id: 3, name: 'Voće' }, retailPrice: 1.80, wholesalePrice: 1.50, weight: 1, weightUnit: 'kg', storeId: 1, photos: ['https://via.placeholder.com/300/90EE90/000000?Text=Jabuke'], isAvailable: true, wholesaleThreshold: 50 },
  { id: 104, name: 'Banane 1kg', productCategory: { id: 3, name: 'Voće' }, retailPrice: 2.00, wholesalePrice: 1.70, weight: 1, weightUnit: 'kg', storeId: 1, photos: ['https://via.placeholder.com/300/FFFF00/000000?Text=Banane'], isAvailable: false },
  { id: 105, name: 'Kruh pšenični', productCategory: { id: 2, name: 'Pekarski proizvodi' }, retailPrice: 1.50, wholesalePrice: 1.30, storeId: 2, photos: ['https://via.placeholder.com/300/F0E68C/000000?Text=Kruh'], isAvailable: true, wholesaleThreshold: 20 },
  { id: 106, name: 'Jogurt 500g', productCategory: { id: 1, name: 'Mliječni proizvodi' }, retailPrice: 1.10, wholesalePrice: 0.90, weight: 500, weightUnit: 'g', storeId: 2, photos: ['https://via.placeholder.com/300/ADD8E6/000000?Text=Jogurt'], isAvailable: true },
  { id: 107, name: 'Apple iPhone 13', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 999, wholesalePrice: 950, storeId: 4, photos: ['https://via.placeholder.com/300/87CEEB/FFFFFF?Text=Iphone'], isAvailable: true, wholesaleThreshold: 5 },
  { id: 108, name: 'Samsung Galaxy S21', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 950, wholesalePrice: 900, storeId: 4, photos: ['https://via.placeholder.com/300/87CEEB/FFFFFF?Text=Samsung'], isAvailable: true },
  { id: 109, name: 'Slušalice Bose', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 200, wholesalePrice: 180, storeId: 4, photos: ['https://via.placeholder.com/300/D3D3D3/000000?Text=Slušalice'], isAvailable: true, wholesaleThreshold: 15 },
  { id: 110, name: 'Dell Monitor 24" Full HD', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 300, wholesalePrice: 280, storeId: 4, photos: ['https://via.placeholder.com/300/87CEEB/FFFFFF?Text=Monitor'], isAvailable: true },
  { id: 111, name: 'Čaj Zeleni', productCategory: { id: 5, name: 'Pića' }, retailPrice: 3.00, wholesalePrice: 2.50, storeId: 2, photos: ['https://via.placeholder.com/300/32CD32/000000?Text=Čaj'], isAvailable: true, wholesaleThreshold: 100 },
  { id: 112, name: 'Kafa Moka', productCategory: { id: 5, name: 'Pića' }, retailPrice: 5.50, wholesalePrice: 5.00, storeId: 3, photos: ['https://via.placeholder.com/300/D2691E/000000?Text=Kafa'], isAvailable: true },
  { id: 113, name: 'Vino Cabernet Sauvignon', productCategory: { id: 6, name: 'Alkoholna pića' }, retailPrice: 15.00, wholesalePrice: 13.00, storeId: 5, photos: ['https://via.placeholder.com/300/8B0000/FFFFFF?Text=Vino'], isAvailable: true, wholesaleThreshold: 30 },
  { id: 114, name: 'Pivo Heineken', productCategory: { id: 6, name: 'Alkoholna pića' }, retailPrice: 1.80, wholesalePrice: 1.50, storeId: 5, photos: ['https://via.placeholder.com/300/00FF00/FFFFFF?Text=Pivo'], isAvailable: true },
  { id: 115, name: 'Računarski miš Logitech', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 25.00, wholesalePrice: 22.00, storeId: 5, photos: ['https://via.placeholder.com/300/D3D3D3/000000?Text=Miš'], isAvailable: true, wholesaleThreshold: 25 },
  { id: 116, name: 'Gaming Monitor 27"', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 400, wholesalePrice: 380, storeId: 4, photos: ['https://via.placeholder.com/300/87CEEB/FFFFFF?Text=Gaming+Monitor'], isAvailable: true },
  { id: 117, name: 'LED TV 40"', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 350, wholesalePrice: 330, storeId: 4, photos: ['https://via.placeholder.com/300/87CEEB/FFFFFF?Text=TV'], isAvailable: true, wholesaleThreshold: 10 },
  { id: 118, name: 'Knjiga "The Great Gatsby"', productCategory: { id: 7, name: 'Knjige' }, retailPrice: 15.00, wholesalePrice: 12.00, storeId: 1, photos: ['https://via.placeholder.com/300/FF6347/FFFFFF?Text=Knjiga'], isAvailable: true },
  { id: 119, name: 'Knjiga "1984"', productCategory: { id: 7, name: 'Knjige' }, retailPrice: 10.00, wholesalePrice: 8.00, storeId: 4, photos: ['https://via.placeholder.com/300/FF6347/FFFFFF?Text=Knjiga'], isAvailable: true, wholesaleThreshold: 50 },
];

const DUMMY_STORES_WITH_PRODUCTS: StoreWithProducts[] = [
  {
    Store: { id: 1, isActive: true, categoryid: 101, name: 'Supermarket A', address: 'Glavna ulica 10, Sarajevo', description: 'Veliki izbor prehrambenih proizvoda', logoUrl: 'https://via.placeholder.com/150/FFC107/000000?Text=LogoA' },
    Products: DUMMY_PRODUCTS.filter(product => product.storeId === 1),
  },
  {
    Store: { id: 2, isActive: false, categoryid: 202, name: 'Elektronika Centar', address: 'Sporedna ulica 5, Tuzla', description: 'Najnovija elektronika po povoljnim cijenama', logoUrl: 'https://via.placeholder.com/150/2196F3/FFFFFF?Text=LogoE' },
    Products: DUMMY_PRODUCTS.filter(product => product.storeId === 2),
  },
  {
    Store: { id: 4, isActive: true, categoryid: 303, name: 'Knjižara Z', address: 'Pored rijeke 15, Banja Luka', description: 'Širok asortiman knjiga i uredskog materijala', logoUrl: 'https://via.placeholder.com/150/9C27B0/FFFFFF?Text=LogoK' },
    Products: DUMMY_PRODUCTS.filter(product => product.storeId === 4),
  },
  {
    Store: { id: 5, isActive: true, categoryid: 101, name: 'Pekara Mlin', address: 'Novo Sarajevo 1', description: 'Svježi kruh i peciva', logoUrl: 'https://via.placeholder.com/150/FF9800/FFFFFF?Text=LogoP' },
    Products: DUMMY_PRODUCTS.filter(product => product.storeId === 5),
  },
];


const SearchProductsScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [storesWithProducts, setStoresWithProducts] = useState<StoreWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchStoreProducts = async () => {
      setLoading(true);
      setError(null);

      if (USE_DUMMY_DATA) {
        const filteredStores = DUMMY_STORES_WITH_PRODUCTS.map(storeWithProducts => ({
          ...storeWithProducts,
          Products: storeWithProducts.Products.filter(product =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        })).filter(storeWithProducts => storeWithProducts.Products.length > 0);
        setStoresWithProducts(filteredStores);
        setLoading(false);
        return;
      }

      try {
        const authToken = await SecureStore.getItemAsync('auth_token');
        if (!authToken) {
          throw new Error('Authentication token not found.');
        }

        const body = {
          place: '', // Za sada ignorišemo
          municipality: '', // Za sada ignorišemo
          category: '', // Za sada ignorišemo
          searchQuery: searchQuery,
        };

        const response = await fetch('https://bazaar-system.duckdns.org/api/Catalog/filter', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody}`);
        }

        const data: StoreWithProducts[] = await response.json();
        setStoresWithProducts(data);

      } catch (e: any) {
        console.error("Error fetching products:", e);
        setError(e instanceof Error ? e : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(() => {
      fetchStoreProducts();
    }, 500);

    return () => clearTimeout(debounceFetch);
  }, [searchQuery]);

  const handleProductPress = (product: Product) => {
    router.push(`/search/details/${product.id}`);
  };

  if (loading && storesWithProducts.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4e8d7c" />
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
        clearButtonMode="while-editing"
      />
      {loading && <ActivityIndicator style={styles.loadingMoreIndicator} size="small" />}
      {storesWithProducts.length === 0 && !loading ? (
        <Text style={styles.noResultsText}>{t('no_products_found')}</Text>
      ) : (
        <FlatList
          data={storesWithProducts}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.storeContainer}>
              <Text style={styles.storeName}>{item.Store.name}</Text>
              {item.Products.length > 0 ? (
                <FlatList
                  data={item.Products}
                  keyExtractor={(product) => product.id.toString()}
                  renderItem={({ item: product }) => (
                    <View style={styles.productWrapper}>
                      <ProductItem product={product} onPress={() => handleProductPress(product)} />
                    </View>
                  )}
                />
              ) : (
                <Text style={styles.noProductsInStore}>{t('no_products_in_store')}</Text>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  storeContainer: {
    backgroundColor: '#fff', // Bijela pozadina za svaki kontejner prodavnice
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Za Android sjenu
    borderColor: '#4e8d7c',
    borderWidth: 2
  },
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
  },
  storeGroup: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productWrapper: {
    marginRight: 10,
  },
  noProductsInStore: {
    fontStyle: 'italic',
    color: '#777',
    marginTop: 5,
  }
});

export default SearchProductsScreen;