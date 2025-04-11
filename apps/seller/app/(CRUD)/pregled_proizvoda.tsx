import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, Pressable, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { Link, useRouter /*, useLocalSearchParams */ } from 'expo-router'; // 🔁 BACKEND: odkomentariši useLocalSearchParams kad budeš koristila ID prodavnice
import { mockProducts, Product } from '../data/mockProducts'; /// OVO ĆEŠ IZBACITI
import { useTranslation } from 'react-i18next';
import { FontAwesome } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

// 🔁 BACKEND: koristi pravu tipizaciju ako imaš /services/api.ts
// import { apiGetProductsByStoreId } from '../services/api';

const { width, height } = Dimensions.get('window');
const COLUMN_GAP = 16;
const NUM_COLUMNS = 2;
const ITEM_WIDTH = (width - COLUMN_GAP * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

export default function ProductsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);

  /// OVO ĆEŠ IZBACITI
  const products = mockProducts;
  /// OVO IZNAD ĆEŠ IZBACITI

  // 🔁 BACKEND: ovo ćeš koristiti kad budeš dobijala proizvode sa servera
  /*
  const { id } = useLocalSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await apiGetProductsByStoreId(id as string); // ili fetch(...)
        setProducts(data);
        setError(null);
      } catch (err) {
        setError('Greška pri dohvaćanju proizvoda');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [id]);
  */

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'bs' : 'en');
  };
  useEffect(() => {
    navigation.setOptions({
      title: t('products_overview'),
    });
  }, [i18n.language, navigation]);



  /*
  // 🔁 BACKEND: prikaz greške
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{error}</Text>
      </View>
    );
  }
  */

  const renderItem = ({ item }: { item: Product }) => (
    <Link href={`/product/${item.id}`} asChild>
      <Pressable style={styles.productCard}>
        <Image source={{ uri: item.imageUrls[0] }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>{item.price}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
        </View>
      </Pressable>
    </Link>
  );

  return (
    <ScrollView style={styles.scrollWrapper} contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
        <FontAwesome name="language" size={18} color="#4E8D7C" />
        <Text style={styles.languageText}>{i18n.language.toUpperCase()}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.createButton} 
        onPress={() => router.push('/(CRUD)/dodaj_proizvod')}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <FontAwesome name="plus" size={14} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.createButtonText}>{t('add_a_product')}</Text>
          </>
        )}
      </TouchableOpacity>

      {/* 🔁 BACKEND: dodaj loading indikator ako želiš ispod dugmeta */}
      {/* {loading && <ActivityIndicator size="large" color="#4E8D7C" />} */}

      <FlatList
        data={products} //  kad prebaciš na backend, koristi setProducts
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.columnWrapper}
        scrollEnabled={false}
      />
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  scrollWrapper: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    paddingTop: height * 0.08,
    paddingBottom: height * 0.1,
  },
  addButton: {
    backgroundColor: '#4E8D7C',
    marginHorizontal: 16,
    marginBottom: 10,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: COLUMN_GAP,
  },
  columnWrapper: {
    gap: COLUMN_GAP,
    marginBottom: COLUMN_GAP,
    justifyContent: 'space-between',
  },
  productCard: {
    width: ITEM_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  productImage: {
    width: '100%',
    height: ITEM_WIDTH,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#8E8E93',
  },
    createButton: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#4E8D7C',
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
      marginLeft: 16,
      marginBottom: 10,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 1.5,
    },
    createButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    languageButton: {
      position: 'absolute',
      top: 40,
      right: 20,
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#f1f5f9',
      zIndex: 1000,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
    },
    languageText: {
      fontSize: 10,
      fontWeight: '600',
      color: '#4E8D7C',
      marginTop: 2,
    },
    
});
