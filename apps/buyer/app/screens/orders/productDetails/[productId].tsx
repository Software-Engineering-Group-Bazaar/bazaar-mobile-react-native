import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity , TextInput, Alert} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { FontAwesome } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';
import * as SecureStore from 'expo-secure-store';

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
  isActive: boolean;
  wholesaleThreshold?: number;
  quantity: number
}

const USE_DUMMY_DATA = true;

const DUMMY_PRODUCTS: Product[] = [
    { id: 1, name: 'Mlijeko 1L', productCategory: { id: 1, name: 'Mliječni proizvodi' }, retailPrice: 2.50, wholesalePrice: 2.20, storeId: 123, photos: ['https://via.placeholder.com/300/ADD8E6/000000?Text=Mlijeko'], isActive: true, wholesaleThreshold: 10, quantity: 15 },
    { id: 2, name: 'Hljeb', productCategory: { id: 2, name: 'Pekarski proizvodi' }, retailPrice: 1.20, wholesalePrice: 1.00, storeId: 123, photos: ['https://via.placeholder.com/300/F0E68C/000000?Text=Hljeb'], isActive: true, quantity: 10 },
  ];

const ProductDetailsScreen = () => {
  const router = useRouter();
  const { productId, quantity } = useLocalSearchParams();
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    if (product && currentImageIndex < product.photos.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const previousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      title: product?.name || '',
    });
  }, [product, navigation]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);

      if (USE_DUMMY_DATA) {
        const selectedProduct = DUMMY_PRODUCTS.find(p => p.id === parseInt(productId as string));
        setProduct(selectedProduct || null);
        setLoading(false);
      } else {
        try {
          const authToken = await SecureStore.getItemAsync('auth_token');
          const response = await fetch(`https://bazaar-system.duckdns.org/api/Catalog/products/${productId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });
          if (!response.ok) {
            throw new Error('Product not found');
          }
          const data = await response.json();
          setProduct(data);
        } catch (error) {
          console.error('Error fetching product:', error);
          setProduct(null);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProductDetails();
  }, [productId]);

  if (loading) {
    return <Text>{t('loading')}</Text>;
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      {/* sekcija sa slikama i strelicama */}
      <View style={styles.imageSection}>
        {product.photos.length > 0 && (
          <>
            <TouchableOpacity
              style={[styles.navArrow, styles.leftArrow]}
              onPress={previousImage}
              disabled={currentImageIndex === 0}
            >
              <FontAwesome name="chevron-left" size={40} color={currentImageIndex === 0 ? '#ccc' : '#000'} />
            </TouchableOpacity>

            <Image
              source={{ uri: product.photos[currentImageIndex] }}
              style={styles.productImage}
            />

            <TouchableOpacity
              style={[styles.navArrow, styles.rightArrow]}
              onPress={nextImage}
              disabled={currentImageIndex === product.photos.length - 1}
            >
              <FontAwesome name="chevron-right" size={40} color={currentImageIndex === product.photos.length - 1 ? '#ccc' : '#000'} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Podaci o proizvodu */}
      <View style={styles.infoSection}>
        <Text style={styles.productName}>{product.name}</Text>

        {typeof product.weight === 'number' && product.weight > 0 && product.weight && (
          <Text style={styles.productDetailText}>
            {t('weight')}: {product.weight} {product.weightUnit}
          </Text>
        )}

        {typeof product.volume === 'number' && product.volume > 0 && product.volume && (
          <Text style={styles.productDetailText}>
            {t('volume')}: {product.volume} {product.volumeUnit}
          </Text>
        )}

        {product.wholesaleThreshold !== undefined ? (
          <>
            <Text style={styles.price}>
              {parseInt(quantity as string, 10) <= product.wholesaleThreshold
                ? `${product.retailPrice.toFixed(2)} KM`
                : `${product.wholesalePrice.toFixed(2)} KM`}
            </Text>
            <Text style={styles.priceInfo}>
              {t('1 -')} {product.wholesaleThreshold} {t('items')}: {product.retailPrice.toFixed(2)} KM
            </Text>
            <Text style={styles.priceInfo}>
              {product.wholesaleThreshold + 1} {t('or more items')}: {product.wholesalePrice.toFixed(2)} KM
            </Text>
          </>
        ) : (
          <Text style={styles.price}>{product.retailPrice.toFixed(2)} KM</Text>
        )}

{quantity !== undefined && (
    <Text style={styles.productDetailText}>
      {t('quantity')}: {quantity}
    </Text>
  )}

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  quantityInput: {
    width: 100, 
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
    backgroundColor: '#fff',
  },
  productDetailText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  availabilityText: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  notAvailableText: {
    color: '#dc3545',
  },
  priceInfo: {
    fontSize: 14,
    color: '#777',
    marginBottom: 3,
  },
  notAvailableContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  notAvailableMessage: {
    fontSize: 16,
    color: '#dc3545',
    fontWeight: 'bold',
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around', 
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20, 
  },
  quantityButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
  },
  quantityButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#555',
    minWidth: 50,
    textAlign: 'center',
  },
  addToCartButton: {
    backgroundColor: '#4E8D7C',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  imageSection: {
    position: 'relative',
    width: '100%',
    height: 350,
    backgroundColor: '#f5f5f5',
    marginBottom: 20,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  navArrow: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    zIndex: 2,
    padding: 10,
  },
  leftArrow: {
    left: 10,
  },
  rightArrow: {
    right: 10,
  },
  infoSection: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4E8D7C',
    marginBottom: 20,
  },
  detailsSection: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',},
    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    },
    errorText: {
      fontSize: 18,
      color: '#FF3B30',
      marginBottom: 16,
    },
    backButton: {
      padding: 12,
      backgroundColor: '#007AFF',
      borderRadius: 8,
    },
    backButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
   });
   
   export default ProductDetailsScreen;   