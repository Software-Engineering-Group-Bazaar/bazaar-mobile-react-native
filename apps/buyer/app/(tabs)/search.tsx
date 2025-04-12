import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TextInput } from 'react-native';
import ProductItem from 'proba-package/product-item/index';
import { useTranslation } from 'react-i18next';

interface Product {
  id: number;
  name: string;
  productcategoryid: number;
  price: number;
  weight?: number;
  weightUnit?: string;
  volume?: number;
  volumeUnit?: string;
  storeID: number;
  imageUrl?: string;
}

const USE_DUMMY_DATA = true;

const DUMMY_PRODUCTS: Product[] = [
  { id: 101, name: 'Mlijeko 1L', productcategoryid: 1, price: 2.50, storeID: 123, imageUrl: 'https://via.placeholder.com/150/ADD8E6/000000?Text=Mlijeko' },
  { id: 102, name: 'Hljeb', productcategoryid: 2, price: 1.20, storeID: 123, imageUrl: 'https://via.placeholder.com/150/F0E68C/000000?Text=Hljeb' },
  { id: 103, name: 'Jabuke 1kg', productcategoryid: 3, price: 1.80, storeID: 123, imageUrl: 'https://via.placeholder.com/150/90EE90/000000?Text=Jabuke' },
  { id: 104, name: 'Banane 1kg', productcategoryid: 3, price: 2.00, storeID: 123, imageUrl: 'https://via.placeholder.com/150/FFFF00/000000?Text=Banane' },
  { id: 105, name: 'Kruh pšenični', productcategoryid: 2, price: 1.50, storeID: 123, imageUrl: 'https://via.placeholder.com/150/F0E68C/000000?Text=Kruh' },
  { id: 106, name: 'Jogurt 500g', productcategoryid: 1, price: 1.10, storeID: 123, imageUrl: 'https://via.placeholder.com/150/ADD8E6/000000?Text=Jogurt' },
  { id: 107, name: 'Apple iPhone 13', productcategoryid: 4, price: 999, storeID: 456, imageUrl: 'https://via.placeholder.com/150/87CEEB/FFFFFF?Text=Iphone' },
  { id: 108, name: 'Samsung Galaxy S21', productcategoryid: 4, price: 950, storeID: 456, imageUrl: 'https://via.placeholder.com/150/87CEEB/FFFFFF?Text=Samsung' },
  { id: 109, name: 'Slušalice Bose', productcategoryid: 4, price: 200, storeID: 456, imageUrl: 'https://via.placeholder.com/150/D3D3D3/000000?Text=Slušalice' },
  { id: 110, name: 'Dell Monitor 24" Full HD', productcategoryid: 4, price: 300, storeID: 456, imageUrl: 'https://via.placeholder.com/150/87CEEB/FFFFFF?Text=Monitor' },
  { id: 111, name: 'Čaj Zeleni', productcategoryid: 5, price: 3.00, storeID: 789, imageUrl: 'https://via.placeholder.com/150/32CD32/000000?Text=Čaj' },
  { id: 112, name: 'Kafa Moka', productcategoryid: 5, price: 5.50, storeID: 789, imageUrl: 'https://via.placeholder.com/150/D2691E/000000?Text=Kafa' },
  { id: 113, name: 'Vino Cabernet Sauvignon', productcategoryid: 6, price: 15.00, storeID: 789, imageUrl: 'https://via.placeholder.com/150/8B0000/FFFFFF?Text=Vino' },
  { id: 114, name: 'Pivo Heineken', productcategoryid: 6, price: 1.80, storeID: 789, imageUrl: 'https://via.placeholder.com/150/00FF00/FFFFFF?Text=Pivo' },
  { id: 115, name: 'Računarski miš Logitech', productcategoryid: 4, price: 25.00, storeID: 456, imageUrl: 'https://via.placeholder.com/150/D3D3D3/000000?Text=Miš' },
  { id: 116, name: 'Gaming Monitor 27"', productcategoryid: 4, price: 400, storeID: 456, imageUrl: 'https://via.placeholder.com/150/87CEEB/FFFFFF?Text=Gaming+Monitor' },
  { id: 117, name: 'LED TV 40"', productcategoryid: 4, price: 350, storeID: 456, imageUrl: 'https://via.placeholder.com/150/87CEEB/FFFFFF?Text=TV' },
  { id: 118, name: 'Knjiga "The Great Gatsby"', productcategoryid: 7, price: 15.00, storeID: 999, imageUrl: 'https://via.placeholder.com/150/FF6347/FFFFFF?Text=Knjiga' },
  { id: 119, name: 'Knjiga "1984"', productcategoryid: 7, price: 10.00, storeID: 999, imageUrl: 'https://via.placeholder.com/150/FF6347/FFFFFF?Text=Knjiga' },
];


const SearchProductsScreen = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchStoreProducts = async () => {
      if (USE_DUMMY_DATA) {
        const filteredProducts = DUMMY_PRODUCTS.filter(product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setProducts(filteredProducts);
        setLoading(false);
        return;
      }

      try {
     const query = searchQuery ? `search?query=${searchQuery}` : '';
     const response = await fetch(`https://bazaar-system.duckdns.org/api/catalog/${query}`);
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
  }, [searchQuery]);

  const handleProductPress = (product: Product) => {
    console.log('Product pressed:', product.name);
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (error) {
    return <Text>Error fetching data</Text>;
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder={t('search_products_placeholder')}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <View style={styles.listContainer}>
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ProductItem product={item} onPress={handleProductPress} />
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
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
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
  },
});

export default SearchProductsScreen;
