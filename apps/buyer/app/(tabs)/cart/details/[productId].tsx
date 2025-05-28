import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity , TextInput, Alert} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { FontAwesome } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';
import * as SecureStore from 'expo-secure-store';
import { baseURL, USE_DUMMY_DATA } from 'proba-package';

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
  pointRate?: number;
}

interface Inventory {
  id: number;
  productId: number;
  storeId: number;
  productionName: string;
  quantity: number;
  outOfStock: boolean;
  lastUpdated: string;
}

// const USE_DUMMY_DATA = true;

const DUMMY_PRODUCTS: Product[] = [
  { id: 101, name: 'Mlijeko 1L', productCategory: { id: 1, name: 'Mliječni proizvodi' }, retailPrice: 2.50, wholesalePrice: 2.20, storeId: 123, photos: ['https://via.placeholder.com/300/ADD8E6/000000?Text=Mlijeko'], isActive: true, wholesaleThreshold: 10, quantity: 15, pointRate:0.5 },
  { id: 102, name: 'Hljeb', productCategory: { id: 2, name: 'Pekarski proizvodi' }, retailPrice: 1.20, wholesalePrice: 1.00, storeId: 123, photos: ['https://via.placeholder.com/300/F0E68C/000000?Text=Hljeb'], isActive: true, quantity: 10 },
  { id: 103, name: 'Jabuke 1kg', productCategory: { id: 3, name: 'Voće' }, retailPrice: 1.80, wholesalePrice: 1.50, weight: 1, weightUnit: 'kg', storeId: 123, photos: ['https://via.placeholder.com/300/90EE90/000000?Text=Jabuke'], isActive: true, wholesaleThreshold: 50, quantity: 20 },
  { id: 104, name: 'Banane 1kg', productCategory: { id: 3, name: 'Voće' }, retailPrice: 2.00, wholesalePrice: 1.70, weight: 1, weightUnit: 'kg', storeId: 123, photos: ['https://via.placeholder.com/300/FFFF00/000000?Text=Banane'], isActive: false, quantity: 40 },
  { id: 105, name: 'Kruh pšenični', productCategory: { id: 2, name: 'Pekarski proizvodi' }, retailPrice: 1.50, wholesalePrice: 1.30, storeId: 123, photos: ['https://via.placeholder.com/300/F0E68C/000000?Text=Kruh'], isActive: true, wholesaleThreshold: 20, quantity: 80 },
  { id: 106, name: 'Jogurt 500g', productCategory: { id: 1, name: 'Mliječni proizvodi' }, retailPrice: 1.10, wholesalePrice: 0.90, weight: 500, weightUnit: 'g', storeId: 123, photos: ['https://via.placeholder.com/300/ADD8E6/000000?Text=Jogurt'], isActive: true, quantity: 90 },
  { id: 107, name: 'Apple iPhone 13', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 999, wholesalePrice: 950, storeId: 456, photos: ['https://via.placeholder.com/300/87CEEB/FFFFFF?Text=Iphone'], isActive: true, wholesaleThreshold: 5, quantity: 5 },
  { id: 108, name: 'Samsung Galaxy S21', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 950, wholesalePrice: 900, storeId: 456, photos: ['https://via.placeholder.com/300/87CEEB/FFFFFF?Text=Samsung'], isActive: true, quantity: 0 },
  { id: 109, name: 'Slušalice Bose', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 200, wholesalePrice: 180, storeId: 456, photos: ['https://via.placeholder.com/300/D3D3D3/000000?Text=Slušalice'], isActive: true, wholesaleThreshold: 15, quantity: 7 },
  { id: 110, name: 'Dell Monitor 24" Full HD', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 300, wholesalePrice: 280, storeId: 456, photos: ['https://via.placeholder.com/300/87CEEB/FFFFFF?Text=Monitor'], isActive: true, quantity: 15 },
  { id: 111, name: 'Čaj Zeleni', productCategory: { id: 5, name: 'Pića' }, retailPrice: 3.00, wholesalePrice: 2.50, storeId: 789, photos: ['https://via.placeholder.com/300/32CD32/000000?Text=Čaj'], isActive: true, wholesaleThreshold: 100, quantity: 1 },
  { id: 112, name: 'Kafa Moka', productCategory: { id: 5, name: 'Pića' }, retailPrice: 5.50, wholesalePrice: 5.00, storeId: 789, photos: ['https://via.placeholder.com/300/D2691E/000000?Text=Kafa'], isActive: true, quantity: 150 },
  { id: 113, name: 'Vino Cabernet Sauvignon', productCategory: { id: 6, name: 'Alkoholna pića' }, retailPrice: 15.00, wholesalePrice: 13.00, storeId: 789, photos: ['https://via.placeholder.com/300/8B0000/FFFFFF?Text=Vino'], isActive: true, wholesaleThreshold: 30, quantity: 40 },
  { id: 114, name: 'Pivo Heineken', productCategory: { id: 6, name: 'Alkoholna pića' }, retailPrice: 1.80, wholesalePrice: 1.50, storeId: 789, photos: ['https://via.placeholder.com/300/00FF00/FFFFFF?Text=Pivo'], isActive: true, quantity: 7 },
  { id: 115, name: 'Računarski miš Logitech', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 25.00, wholesalePrice: 22.00, storeId: 456, photos: ['https://via.placeholder.com/300/D3D3D3/000000?Text=Miš'], isActive: true, wholesaleThreshold: 25, quantity: 19 },
  { id: 116, name: 'Gaming Monitor 27"', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 400, wholesalePrice: 380, storeId: 456, photos: ['https://via.placeholder.com/300/87CEEB/FFFFFF?Text=Gaming+Monitor'], isActive: true, quantity: 10 },
  { id: 117, name: 'LED TV 40"', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 350, wholesalePrice: 330, storeId: 456, photos: ['https://via.placeholder.com/300/87CEEB/FFFFFF?Text=TV'], isActive: true, wholesaleThreshold: 10, quantity: 67 },
  { id: 118, name: 'Knjiga "The Great Gatsby"', productCategory: { id: 7, name: 'Knjige' }, retailPrice: 15.00, wholesalePrice: 12.00, storeId: 999, photos: ['https://via.placeholder.com/300/FF6347/FFFFFF?Text=Knjiga'], isActive: true, quantity: 45 },
  { id: 119, name: 'Knjiga "1984"', productCategory: { id: 7, name: 'Knjige' }, retailPrice: 10.00, wholesalePrice: 8.00, storeId: 999, photos: ['https://via.placeholder.com/300/FF6347/FFFFFF?Text=Knjiga'], isActive: true, wholesaleThreshold: 50, quantity: 33 },
];

const ProductDetailsScreen = () => {
  const router = useRouter();
  const { productId } = useLocalSearchParams();
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { cartItems, addToCart, handleQuantityChange } = useCart();
  const [quantity, setQuantity] = useState(cartItems.find(item => item.product.id.toString() === productId.toString())?.qty || 1);
  const [quantityInput, setQuantityInput] = useState(cartItems.find(item => item.product.id.toString() === productId.toString())?.qty?.toString() || '1');
  const [quantitySuggestion, setQuantitySuggestion] = useState<string | null>(null);
  const [ pointsEarned, setPointsEarned ] = useState(0);

  const nextImage = () => {
    if (product && currentImageIndex < product.photos.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  useEffect(() => {
    setQuantityInput(quantity.toString());
   }, [quantity]);

  const previousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const handleQuantityInputChange = (text: React.SetStateAction<string>) => {
      setQuantityInput(text);
      const newQuantity = parseInt(text.toString(), 10) || 0;
      if (product) {
        const difference = newQuantity - quantity;
        const price = newQuantity <= (product.wholesaleThreshold || 0) ? product.retailPrice : product.wholesalePrice;
        const totalPrice = Math.abs(difference) * price;
        if (difference > 0) {
          setQuantitySuggestion(t('add_suggestion', { count: difference, price: totalPrice.toFixed(2) }));
        } else if (difference<0){
          setQuantitySuggestion(t('remove_suggestion', { count: Math.abs(difference), price: totalPrice.toFixed(2) }));
        }
        else {
          setQuantitySuggestion(null);
       }
      }
    };

    const incrementQuantity = () => {
      setQuantityInput(prev => (parseInt(prev, 10) + 1).toString());
      const newQuantity = parseInt(quantityInput, 10) + 1;
      if (product) {
        const difference = newQuantity - quantity;
        const price = newQuantity <= (product.wholesaleThreshold || 0) ? product.retailPrice : product.wholesalePrice;
        const totalPrice = Math.abs(difference) * price;
        if (difference > 0) {
          setQuantitySuggestion(t('add_suggestion', { count: difference, price: totalPrice.toFixed(2) }));
        } else if (difference<0){
          setQuantitySuggestion(t('remove_suggestion', { count: Math.abs(difference), price: totalPrice.toFixed(2) }));
        }
        else {
          setQuantitySuggestion(null);
       }
      }
  };
  
  const decrementQuantity = () => {
      setQuantityInput(prev => (Math.max(0, parseInt(prev, 10) - 1)).toString());
      const newQuantity = Math.max(1, parseInt(quantityInput, 10) - 1);
      if (product) {
        const difference = newQuantity - quantity;
        const price = newQuantity <= (product.wholesaleThreshold || 0) ? product.retailPrice : product.wholesalePrice;
        const totalPrice = Math.abs(difference) * price;
        if (difference > 0) {
          setQuantitySuggestion(t('add_suggestion', { count: difference, price: totalPrice.toFixed(2) }));
        } else if (difference<0){
          setQuantitySuggestion(t('remove_suggestion', { count: Math.abs(difference), price: totalPrice.toFixed(2) }));
        }
        else {
          setQuantitySuggestion(null);
       }
      }
  };
  

  useEffect(() => {
    navigation.setOptions({
      title: product?.name || '',
    });
  }, [product, navigation]);

  useEffect(() => {
        if (product) {
          calculatePoints(parseInt(quantityInput));
        }
      }, [product, quantityInput]);
    
      //fja za racunanje poena na osnovu odabrane kolicine i cijene
      const calculatePoints = (currentQuantity: number) => {
        if (!product || product.pointRate === undefined) {
          setPointsEarned(0);
          return;
        }
    
        let priceToUse = product.retailPrice;
        if (product.wholesaleThreshold !== undefined && product.wholesalePrice !== undefined) {
          if (currentQuantity > product.wholesaleThreshold) {
            priceToUse = product.wholesalePrice;
          } else {
            priceToUse = product.retailPrice;
          }
        }
        const calculatedPoints = priceToUse * product.pointRate * currentQuantity;
        setPointsEarned(Math.floor(calculatedPoints));
    };

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
          const response = await fetch(baseURL + `/api/Catalog/products/${productId}`, {
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
        <Text style={styles.errorText}>{t('product_not_found')}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>{t('go_back')}</Text>
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

        {/* Prikaz broja poena */}
        {pointsEarned > 0 && (
        <Text style={styles.pointsDisplay}>
        {t('You earn: {{points}} points', { points: pointsEarned.toFixed(2) })}
        </Text>
        )}

        {product.isActive ? (
          <>
            {/*odabir količine */}
           <View style={styles.quantityContainer}>
               <Text style={[styles.quantityLabel, { marginRight: 10 }]}>{t('quantity')}:</Text>
               <TouchableOpacity style={styles.quantityButton} onPress={decrementQuantity}>
                   <FontAwesome name="minus" size={18} color="#000" />
               </TouchableOpacity>
               <TextInput
                   style={styles.quantityInput}
                   value={quantityInput}
                   onChangeText={handleQuantityInputChange}
                   keyboardType="numeric"
                   onBlur={() => {
                       if (!quantityInput || isNaN(parseInt(quantityInput, 10)) || parseInt(quantityInput, 10) < 1) {
                           setQuantityInput('1');
                       }
                   }}
                   onFocus={() => {
                       if (quantityInput === '1') {
                           setQuantityInput('');
                       }
                   }}
               />
               <TouchableOpacity style={styles.quantityButton} onPress={incrementQuantity}>
                   <FontAwesome name="plus" size={18} color="#000" />
               </TouchableOpacity>
           </View>
           {quantitySuggestion && <Text style={styles.quantitySuggestionText}>{quantitySuggestion}</Text>}

            {/*ovdje dodati dio mijenja količina u korpi*/}
            <TouchableOpacity style={styles.addToCartButton} onPress={async () => {
  const newQuantity = parseInt(quantityInput, 10);
  if (!isNaN(newQuantity) && newQuantity >= 0) {
    setLoading(true);
    try {
      let availableQuantity: number | undefined;
      if (USE_DUMMY_DATA) {
        const dummyProduct = DUMMY_PRODUCTS.find(p => p.id === product.id && p.storeId === product.storeId);
        availableQuantity = dummyProduct?.quantity;
      } else {
        const authToken = await SecureStore.getItemAsync('auth_token');
        const response = await fetch(
          baseURL + `/api/Inventory?productId=${productId}&storeId=${product.storeId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch inventory quantity');
        }

        let tmp = (await response.json());
        console.log(tmp);
        availableQuantity = (tmp != null && tmp != undefined && tmp.length > 0)? tmp[0].quantity : undefined;
        console.log(availableQuantity);
    }

      if (availableQuantity === undefined) {
        throw new Error('Quantity not found');
      }

      if (newQuantity <= availableQuantity) {
        handleQuantityChange(product, newQuantity);
        setQuantity(newQuantity); // Ažurirajte i quantity stanje
        alert(t('quantity-updated'));
        setQuantitySuggestion(null);
      } else {
        Alert.alert(
          t('out of stock'),
          `${t('There are only')} ${availableQuantity} ${t('items of')} ${product.name} ${t('available.')}`
        );
      }
    } catch (error) {
      console.error('Error checking inventory:', error);
      Alert.alert(t('Error'), t('Could not check inventory. Please try again.'));
    } finally {
      setLoading(false);
    }
  } else {
    alert(t('valid-quantity'));
  }
}}>
  <Text style={styles.addToCartButtonText}>{t('Make a change')}</Text>
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
  pointsDisplay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 5,
    marginBottom: 10,
  },
  quantitySuggestionText: {
    fontSize: 16,
    marginBottom: 10,
    color: 'green',
    textAlign: 'center',
  },
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