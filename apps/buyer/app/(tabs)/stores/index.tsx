import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import StoreItem from 'proba-package/store-item/index';
import { t } from 'i18next';
import * as SecureStore from 'expo-secure-store';

interface Store {
  id: number;
  name: string;
  address: string;
  description?: string;
  isActive: boolean;
  categoryid: number;
  logoUrl?: string;
}

const USE_DUMMY_DATA = false; // Postavite na true za testiranje sa dummy podacima

const DUMMY_STORES: Store[] = [
  { id: 1, isActive: true, categoryid: 101, name: 'Supermarket A', address: 'Glavna ulica 10, Sarajevo', description: 'Veliki izbor prehrambenih proizvoda', logoUrl: 'https://via.placeholder.com/150/FFC107/000000?Text=LogoA' },
  { id: 2, isActive: false, categoryid: 202, name: 'Elektronika Centar', address: 'Sporedna ulica 5, Tuzla', description: 'Najnovija elektronika po povoljnim cijenama', logoUrl: 'https://via.placeholder.com/150/2196F3/FFFFFF?Text=LogoE' },
  { id: 3, isActive: true, categoryid: 101, name: 'Modna Kuća X', address: 'Centar bb, Mostar', description: 'Trendy odjeća za sve prilike', logoUrl: 'https://via.placeholder.com/150/4CAF50/FFFFFF?Text=LogoM' },
  { id: 4, isActive: true, categoryid: 303, name: 'Knjižara Z', address: 'Pored rijeke 15, Banja Luka', description: 'Širok asortiman knjiga i uredskog materijala', logoUrl: 'https://via.placeholder.com/150/9C27B0/FFFFFF?Text=LogoK' },
  { id: 5, isActive: true, categoryid: 101, name: 'Pekara Mlin', address: 'Novo Sarajevo 1', description: 'Svježi kruh i peciva', logoUrl: 'https://via.placeholder.com/150/FF9800/FFFFFF?Text=LogoP' },
  { id: 6, isActive: false, categoryid: 202, name: 'Tehno Shop', address: 'Stari Grad 5', description: 'Bijela tehnika i mali kućanski aparati', logoUrl: 'https://via.placeholder.com/150/607D8B/FFFFFF?Text=LogoT' },
];

const StoresScreen = () => {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      setError(null);

      if (USE_DUMMY_DATA) {
        const filtered = DUMMY_STORES.filter(store =>
          store.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setStores(filtered);
        setLoading(false);
        return;
      }

      try {
        const authToken = await SecureStore.getItemAsync('auth_token');
        if (!authToken) {
          throw new Error('Authentication token not found.');
        }

        const endpoint = `http://192.168.0.25:5054/api/Stores/search?query=${encodeURIComponent(searchQuery)}`;

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody}`);
        }

        const data: Store[] = await response.json();
        setStores(data);
      } catch (e: any) {
        console.error("Error fetching stores:", e);
        setError(e instanceof Error ? e : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const debounceFetch = setTimeout(() => {
      fetchStores();
    }, 500);

    return () => clearTimeout(debounceFetch);

  }, [searchQuery]);

  const handleProductPress = (store: Store) => {
    router.push(`/stores/${store.id}`);
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
        <Text style={styles.errorText}>{t('fetch-error')}: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder={t('search-stores')}
        value={searchQuery}
        onChangeText={setSearchQuery}
        clearButtonMode="while-editing"
      />
      {stores.length === 0 && !loading && (
        <Text style={styles.emptyListText}>
          {t('no_stores_found')}
        </Text>
      )}
      <FlatList
        data={stores}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <StoreItem store={item} onPress={handleProductPress} />
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
    backgroundColor: '#f8f8f8',
    padding: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  searchInput: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  gridItem: {
    flex: 0.5,
    padding: 5,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#555',
  },
});

export default StoresScreen;