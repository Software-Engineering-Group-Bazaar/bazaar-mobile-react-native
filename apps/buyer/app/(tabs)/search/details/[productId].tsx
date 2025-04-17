import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { FontAwesome } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/FontAwesome';

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

const USE_DUMMY_DATA = true;

const DUMMY_PRODUCTS: Product[] = [
  { id: 101, name: 'Mlijeko 1L', productCategory: { id: 1, name: 'Mliječni proizvodi' }, retailPrice: 2.50, wholesalePrice: 2.20, storeId: 123, photos: ['https://via.placeholder.com/300/ADD8E6/000000?Text=Mlijeko'], isAvailable: true, wholesaleThreshold: 10 },
  { id: 102, name: 'Hljeb', productCategory: { id: 2, name: 'Pekarski proizvodi' }, retailPrice: 1.20, wholesalePrice: 1.00, storeId: 123, photos: ['https://via.placeholder.com/300/F0E68C/000000?Text=Hljeb'], isAvailable: true },
  { id: 103, name: 'Jabuke 1kg', productCategory: { id: 3, name: 'Voće' }, retailPrice: 1.80, wholesalePrice: 1.50, weight: 1, weightUnit: 'kg', storeId: 123, photos: ['https://via.placeholder.com/300/90EE90/000000?Text=Jabuke'], isAvailable: true, wholesaleThreshold: 50 },
  { id: 104, name: 'Banane 1kg', productCategory: { id: 3, name: 'Voće' }, retailPrice: 2.00, wholesalePrice: 1.70, weight: 1, weightUnit: 'kg', storeId: 123, photos: ['https://via.placeholder.com/300/FFFF00/000000?Text=Banane'], isAvailable: false },
  { id: 105, name: 'Kruh pšenični', productCategory: { id: 2, name: 'Pekarski proizvodi' }, retailPrice: 1.50, wholesalePrice: 1.30, storeId: 123, photos: ['https://via.placeholder.com/300/F0E68C/000000?Text=Kruh'], isAvailable: true, wholesaleThreshold: 20 },
  { id: 106, name: 'Jogurt 500g', productCategory: { id: 1, name: 'Mliječni proizvodi' }, retailPrice: 1.10, wholesalePrice: 0.90, weight: 500, weightUnit: 'g', storeId: 123, photos: ['https://via.placeholder.com/300/ADD8E6/000000?Text=Jogurt'], isAvailable: true },
  { id: 107, name: 'Apple iPhone 13', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 999, wholesalePrice: 950, storeId: 456, photos: ['https://via.placeholder.com/300/87CEEB/FFFFFF?Text=Iphone'], isAvailable: true, wholesaleThreshold: 5 },
  { id: 108, name: 'Samsung Galaxy S21', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 950, wholesalePrice: 900, storeId: 456, photos: ['https://via.placeholder.com/300/87CEEB/FFFFFF?Text=Samsung'], isAvailable: true },
  { id: 109, name: 'Slušalice Bose', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 200, wholesalePrice: 180, storeId: 456, photos: ['https://via.placeholder.com/300/D3D3D3/000000?Text=Slušalice'], isAvailable: true, wholesaleThreshold: 15 },
  { id: 110, name: 'Dell Monitor 24" Full HD', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 300, wholesalePrice: 280, storeId: 456, photos: ['https://via.placeholder.com/300/87CEEB/FFFFFF?Text=Monitor'], isAvailable: true },
  { id: 111, name: 'Čaj Zeleni', productCategory: { id: 5, name: 'Pića' }, retailPrice: 3.00, wholesalePrice: 2.50, storeId: 789, photos: ['https://via.placeholder.com/300/32CD32/000000?Text=Čaj'], isAvailable: true, wholesaleThreshold: 100 },
  { id: 112, name: 'Kafa Moka', productCategory: { id: 5, name: 'Pića' }, retailPrice: 5.50, wholesalePrice: 5.00, storeId: 789, photos: ['https://via.placeholder.com/300/D2691E/000000?Text=Kafa'], isAvailable: true },
  { id: 113, name: 'Vino Cabernet Sauvignon', productCategory: { id: 6, name: 'Alkoholna pića' }, retailPrice: 15.00, wholesalePrice: 13.00, storeId: 789, photos: ['https://via.placeholder.com/300/8B0000/FFFFFF?Text=Vino'], isAvailable: true, wholesaleThreshold: 30 },
  { id: 114, name: 'Pivo Heineken', productCategory: { id: 6, name: 'Alkoholna pića' }, retailPrice: 1.80, wholesalePrice: 1.50, storeId: 789, photos: ['https://via.placeholder.com/300/00FF00/FFFFFF?Text=Pivo'], isAvailable: true },
  { id: 115, name: 'Računarski miš Logitech', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 25.00, wholesalePrice: 22.00, storeId: 456, photos: ['https://via.placeholder.com/300/D3D3D3/000000?Text=Miš'], isAvailable: true, wholesaleThreshold: 25 },
  { id: 116, name: 'Gaming Monitor 27"', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 400, wholesalePrice: 380, storeId: 456, photos: ['https://via.placeholder.com/300/87CEEB/FFFFFF?Text=Gaming+Monitor'], isAvailable: true },
  { id: 117, name: 'LED TV 40"', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 350, wholesalePrice: 330, storeId: 456, photos: ['https://via.placeholder.com/300/87CEEB/FFFFFF?Text=TV'], isAvailable: true, wholesaleThreshold: 10 },
  { id: 118, name: 'Knjiga "The Great Gatsby"', productCategory: { id: 7, name: 'Knjige' }, retailPrice: 15.00, wholesalePrice: 12.00, storeId: 999, photos: ['https://via.placeholder.com/300/FF6347/FFFFFF?Text=Knjiga'], isAvailable: true },
  { id: 119, name: 'Knjiga "1984"', productCategory: { id: 7, name: 'Knjige' }, retailPrice: 10.00, wholesalePrice: 8.00, storeId: 999, photos: ['https://via.placeholder.com/300/FF6347/FFFFFF?Text=Knjiga'], isAvailable: true, wholesaleThreshold: 50 },
];

const ProductDetailsScreen = () => {
  const router = useRouter();
  const { productId } = useLocalSearchParams();
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

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

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
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
          const response = await fetch(`https://bazaar-system.duckdns.org/api/Catalog/products/${productId}`);
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
              <Icon name="chevron-left" size={40} color={currentImageIndex === 0 ? '#ccc' : '#000'} />
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
              <Icon name="chevron-right" size={40} color={currentImageIndex === product.photos.length - 1 ? '#ccc' : '#000'} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Podaci o proizvodu */}
      <View style={styles.infoSection}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={[styles.availabilityText, !product.isAvailable && styles.notAvailableText]}>
          {product.isAvailable ? t('available') : t('not-available')}
        </Text>

        {product.weight && (
          <Text style={styles.productDetailText}>
            {t('weight')}: {product.weight} {product.weightUnit}
          </Text>
        )}

        {product.volume && (
          <Text style={styles.productDetailText}>
            {t('volume')}: {product.volume} {product.volumeUnit}
          </Text>
        )}

        {product.wholesaleThreshold !== undefined ? (
          <>
            <Text style={styles.price}>
              {quantity <= product.wholesaleThreshold
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

        {product.isAvailable ? (
          <>
            {/*odabir količine */}
            <View style={styles.quantityContainer}>
              <Text style={[styles.quantityLabel, { marginRight: 10 }]}>{t('quantity')}:</Text>
              <TouchableOpacity style={styles.quantityButton} onPress={decrementQuantity}>
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity style={styles.quantityButton} onPress={incrementQuantity}>
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            {/*ovdje dodati dio gdje se dodaje proizvod, kolicina i ostale bitne info u korpu*/}
            <TouchableOpacity style={styles.addToCartButton} onPress={() => alert(t('Product added to cart'))}>
              <Text style={styles.addToCartButtonText}>{t('Add to Cart')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.notAvailableContainer}>
            <Text style={styles.notAvailableMessage}>{t('This product is currently not available.')}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
    width: 40,
    height: 40,
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