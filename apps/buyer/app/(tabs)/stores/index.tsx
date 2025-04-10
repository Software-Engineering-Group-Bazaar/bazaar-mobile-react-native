import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import StoreItem from 'proba-package/store-item/index'; 

interface Store {
  id: number;
  active: boolean;
  categoryid: number;
  name: string;
  address: string;
  description?: string;
  logoUrl?: string;
}

const USE_DUMMY_DATA = true; // Postavi na false za korištenje pravog API-ja

const DUMMY_STORES: Store[] = [
  { id: 1, active: true, categoryid: 101, name: 'Supermarket A', address: 'Glavna ulica 10, Sarajevo', description: 'Veliki izbor prehrambenih proizvoda', logoUrl: 'https://via.placeholder.com/150/FFC107/000000?Text=LogoA' },
  { id: 2, active: false, categoryid: 202, name: 'Elektronika Centar', address: 'Sporedna ulica 5, Tuzla', description: 'Najnovija elektronika po povoljnim cijenama', logoUrl: 'https://via.placeholder.com/150/2196F3/FFFFFF?Text=LogoE' },
  { id: 3, active: true, categoryid: 101, name: 'Modna Kuća X', address: 'Centar bb, Mostar', description: 'Trendy odjeća za sve prilike', logoUrl: 'https://via.placeholder.com/150/4CAF50/FFFFFF?Text=LogoM' },
  { id: 4, active: true, categoryid: 303, name: 'Knjižara Z', address: 'Pored rijeke 15, Banja Luka', description: 'Širok asortiman knjiga i uredskog materijala', logoUrl: 'https://via.placeholder.com/150/9C27B0/FFFFFF?Text=LogoK' },
  { id: 5, active: true, categoryid: 101, name: 'Pekara Mlin', address: 'Novo Sarajevo 1', description: 'Svježi kruh i peciva', logoUrl: 'https://via.placeholder.com/150/FF9800/FFFFFF?Text=LogoP' },
  { id: 6, active: false, categoryid: 202, name: 'Tehno Shop', address: 'Stari Grad 5', description: 'Bijela tehnika i mali kućanski aparati', logoUrl: 'https://via.placeholder.com/150/607D8B/FFFFFF?Text=LogoT' },
];

const StoresScreen = () => {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStores = async () => {
      if (USE_DUMMY_DATA) {
        setStores(DUMMY_STORES);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://bazaar-system.duckdns.org/api/store');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Store[] = await response.json();
        setStores(data);
        setLoading(false);
      } catch (e: any) {
        setError(e);
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const handleProductPress = (store: Store) => {
    router.push(`/stores/products/${store.id}`);
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (error) {
    return <Text>Došlo je do greške pri učitavanju prodavnica.</Text>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={stores}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <StoreItem
              store={item}
              onPress={handleProductPress}
            />
          </View>
        )}
        numColumns={2} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  gridItem: {
    flex: 0.5,
    padding: 5,
  },
});

export default StoresScreen;