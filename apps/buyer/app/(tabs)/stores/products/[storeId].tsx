// buyer/(tabs)/stores/products/[storeId].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ProductItem from 'proba-package/product-item/index'; 

interface Product {
  id: number;
  name: string;
  productcategoryid: number;
  price: number;
  wieght?: number;
  wieghtunit?: string;
  volume?: number;
  volumeunit?: string;
  storeID: number;
  imageUrl?: string;
}

const USE_DUMMY_DATA = true; //  na false za korištenje pravog API-ja

const DUMMY_PRODUCTS: Product[] = [
  { id: 101, name: 'Mlijeko 1L', productcategoryid: 1, price: 2.50, storeID: 123, imageUrl: 'https://via.placeholder.com/150/ADD8E6/000000?Text=Mlijeko' },
  { id: 102, name: 'Hljeb', productcategoryid: 2, price: 1.20, storeID: 123, imageUrl: 'https://via.placeholder.com/150/F0E68C/000000?Text=Hljeb' },
  { id: 103, name: 'Jabuke 1kg', productcategoryid: 3, price: 1.80, storeID: 123, imageUrl: 'https://via.placeholder.com/150/90EE90/000000?Text=Jabuke' },
  { id: 201, name: 'Laptop Dell', productcategoryid: 4, price: 1200, storeID: 456, imageUrl: 'https://via.placeholder.com/150/87CEEB/FFFFFF?Text=Laptop' },
  { id: 202, name: 'Miš Logitech', productcategoryid: 4, price: 25, storeID: 456, imageUrl: 'https://via.placeholder.com/150/D3D3D3/000000?Text=Mi%C5%A1' },
];

const StoreProductsScreen = () => {
  const { storeId } = useLocalSearchParams<{ storeId: string }>();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStoreProducts = async () => {
      if (USE_DUMMY_DATA) {
        const filteredProducts = DUMMY_PRODUCTS;
        console.log("Store id: ",storeId)
        setProducts(filteredProducts);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`https://bazaar-system.duckdns.org/api/catalog/${storeId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Product[] = await response.json();
        setProducts(data);
        setLoading(false);
      } catch (e: any) {
        setError(e);
        setLoading(false);
      }
    };

    fetchStoreProducts();
  }, [storeId]);

  const handleProductPress = (product: Product) => {
    // akcija kada se pritisne na proizvod
    console.log('Proizvod pritisnut:', product.name);
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (error) {
    return <Text>Error fetching data</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductItem
            product={item}
            onPress={handleProductPress}
          />
        )}
      />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  listContainer: {
    backgroundColor: '#ffc1a6', 
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  }
});

export default StoreProductsScreen;