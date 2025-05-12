import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { FontAwesome } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';
import * as SecureStore from 'expo-secure-store';
import { baseURL, USE_DUMMY_DATA } from 'proba-package';


// --- Existing Types (Product, ProductCategory) ---
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

// --- New Type for Ad Parameters received via navigation ---
interface AdParams {
    adId?: string | number; // Ad ID received from navigation params
    featureVec?: string; // Feature vector received as a string, needs parsing
    conversionPrice?: string | number; // Conversion price received from navigation params
}


// --- Dummy Data (unchanged, simulate product data) ---
const DUMMY_PRODUCTS: Product[] = [
  { id: 101, name: 'Mlijeko 1L', productCategory: { id: 1, name: 'Mliječni proizvodi' }, retailPrice: 2.50, wholesalePrice: 2.20, storeId: 123, photos: ['https://via.placeholder.com/300/ADD8E6/000000?Text=Mlijeko'], isActive: true, wholesaleThreshold: 10, quantity: 15 },
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
  // Use useLocalSearchParams to get all params, including ad context
  const { productId, adId, featureVec, conversionPrice } = useLocalSearchParams<AdParams & { productId: string }>(); // Cast productId to string, add AdParams type
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const { cartItems, addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantityInput, setQuantityInput] = useState('1');

  // State to hold ad-related parameters if present
  const [adContext, setAdContext] = useState<{ adId: number; featureVec: number[]; conversionPrice: number } | null>(null);


  const quantity = parseInt(quantityInput, 10) || 1;

  // Effect to extract ad parameters from route params when component mounts
  useEffect(() => {
      if (adId && featureVec && conversionPrice !== undefined) {
          try {
              const parsedFeatureVec: number[] = JSON.parse(featureVec);
               // Ensure adId and conversionPrice are numbers
              const parsedAdId = typeof adId === 'string' ? parseInt(adId, 10) : adId;
              const parsedConversionPrice = typeof conversionPrice === 'string' ? parseFloat(conversionPrice) : conversionPrice;

               if (!isNaN(parsedAdId) && !isNaN(parsedConversionPrice) && Array.isArray(parsedFeatureVec)) {
                    console.log("Ad context loaded:", { adId: parsedAdId, featureVec: parsedFeatureVec, conversionPrice: parsedConversionPrice });
                    setAdContext({
                       adId: parsedAdId,
                       featureVec: parsedFeatureVec,
                       conversionPrice: parsedConversionPrice,
                    });
               } else {
                   console.warn("Failed to parse ad context params.");
               }

          } catch (e) {
              console.error("Error parsing ad context params:", e);
              // Ad context is invalid, proceed without ad tracking
          }
      } else {
          console.log("No ad context found in params.");
          // No ad context, proceed without ad tracking
      }
  }, [adId, featureVec, conversionPrice]); // Re-run if these specific params change (unlikely in this screen)


  const handleConversationPress = async () => {
        if (!product) {
          return;
        }
        const requestBody = {
          storeId: Number(product.storeId),
          orderId: null, // Or the actual orderId if applicable
          productId: product.id, // Use product.id instead of productId from params
        };

        const authToken = await SecureStore.getItemAsync('auth_token');

        if (!authToken) {
            Alert.alert(t('Authentication Error'), t('You need to be logged in to start a conversation.'));
            // Optionally redirect to login
            // router.push('/login');
            return;
        }

        console.log('Request body for conversation:', JSON.stringify(requestBody));

        try {
            const response = await fetch(`${baseURL}/api/Chat/conversations/find-or-create`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
              },
              body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error('API Error Response Status:', response.status);
              console.error('API Error Response Body:', errorText);
              // Check for specific statuses like 401 (Unauthorized) or 403 (Forbidden)
              if (response.status === 401 || response.status === 403) {
                  Alert.alert(t('Authorization Error'), t('You are not authorized to start this conversation.'));
              } else {
                  Alert.alert(t('Error'), `${t('Failed to create conversation')}: ${response.status}`);
              }
              return; // Stop processing on error
            }

            const data = await response.json();
            console.log("Conversation response:", data);

            // Assuming data.id is the conversation ID
            if (data && data.id) {
                 router.push({
                  pathname: `(tabs)/chat/${data.id}`, // Use conversation ID for the path
                  params: {
                     // Pass other relevant data for the chat screen
                     sellerUsername: data.sellerUsername,
                     buyerUserId: data.buyerUserId, // Assuming API returns this
                     buyerUsername: data.buyerUserName, // Assuming API returns this
                     otherUserAvatar: data.otherUserAvatar,
                  },
                });
            } else {
                 Alert.alert(t('Error'), t('Invalid response from conversation API.'));
            }

        } catch (e: any) {
             console.error("Error during conversation API call:", e);
             Alert.alert(t('Error'), `${t('An unexpected error occurred')}: ${e.message}`);
        }
      };


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
    setQuantityInput(prev => (parseInt(prev, 10) + 1).toString());
};

const decrementQuantity = () => {
    setQuantityInput(prev => (Math.max(1, parseInt(prev, 10) - 1)).toString());
};

// This function now handles both adding to cart AND ad conversion/reward tracking
const checkAndAddToCart = async () => {
  if (!product) {
    return;
  }

  // --- Ad Conversion & Reward Tracking (NEW LOGIC) ---
  // Check if ad context is available (means user arrived via ad)
  if (adContext) {
      const { adId, featureVec, conversionPrice } = adContext;
      const authToken = await SecureStore.getItemAsync('auth_token');

      if (authToken) {
          // 1. Call /api/Ads/conversions/{adId}
           console.log(`Attempting to track conversion for ad ID: ${adId}`);
           fetch(baseURL + `/api/Ads/conversions/${adId}`, {
               method: 'POST',
               headers: {
                   'Authorization': `Bearer ${authToken}`,
                   'Content-Type': 'application/json'
               },
                body: JSON.stringify({}) // Send empty body or specific conversion data if API requires
           })
           .then(response => {
               if (!response.ok) {
                   console.error(`HTTP error tracking conversion for ad ${adId}! status: ${response.status}`);
               } else {
                   console.log(`Conversion tracking successful for ad ${adId}`);
                   // Optionally provide feedback to the user about the conversion reward
                   // Alert.alert("Bonus!", `You earned a reward for converting via an ad!`);
               }
           })
           .catch(error => {
               console.error(`Error tracking conversion for ad ${adId}:`, error);
           });

           // 2. Call /api/Ads/reward with conversionPrice
           console.log(`Attempting to track reward (${conversionPrice}) for ad ID: ${adId}`);
            fetch(baseURL + '/api/Ads/reward', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    featureVec: featureVec, // Use the parsed feature vector from state
                    reward: conversionPrice // Use the conversionPrice from state
                })
            })
            .then(response => {
                if (!response.ok) {
                    console.error(`HTTP error tracking CONVERSION reward for ad ${adId}! status: ${response.status}`);
                } else {
                    console.log(`CONVERSION reward tracking successful for ad ${adId}`);
                }
            })
            .catch(error => {
                console.error(`Error tracking CONVERSION reward for ad ${adId}:`, error);
            });

      } else {
          console.warn("Auth token not found, skipping ad conversion/reward tracking API calls.");
      }
  } else {
      console.log("No ad context available, skipping ad conversion/reward tracking.");
  }
  // --- End Ad Conversion & Reward Tracking ---


  // --- Existing Add to Cart Logic ---
  // Proceed with existing logic for checking inventory and adding to cart
  setLoading(false); // Reset loading for this specific action if you were using it for inventory check
  try {
    let availableQuantity: number | undefined;
    if (USE_DUMMY_DATA) {
      const dummyProduct = DUMMY_PRODUCTS.find(p => p.id === product.id && p.storeId === product.storeId);
      availableQuantity = dummyProduct?.quantity;
    } else {
      const authToken = await SecureStore.getItemAsync('auth_token');
       if (!authToken) {
            Alert.alert(t('Authentication Error'), t('You need to be logged in to add items to the cart.'));
            // Optionally redirect to login
            // router.push('/login');
            return; // Stop if auth token is needed for inventory check
        }
      const response = await fetch(
        baseURL + `/api/Inventory?productId=${product.id}&storeId=${product.storeId}`, // Use product.id
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
           if (response.status === 401 || response.status === 403) {
               Alert.alert(t('Authorization Error'), t('You are not authorized to view inventory.'));
           } else {
               throw new Error(`Failed to fetch inventory quantity: ${response.status}`);
           }
           return; // Stop if fetching inventory fails
      }

      let tmp = (await response.json());
      console.log('Inventory response:', tmp);
       // Assuming the inventory API returns an array and quantity is in the first element
      availableQuantity = (tmp && tmp.length > 0 && tmp[0] && typeof tmp[0].quantity === 'number') ? tmp[0].quantity : undefined;
      console.log('Available quantity:', availableQuantity);
    }

    if (availableQuantity === undefined) {
       // Handle case where inventory API returns unexpected format or no data
       Alert.alert(t('Error'), t('Could not determine available quantity for this product.'));
       console.error('Available quantity is undefined after fetching.');
       return; // Stop if quantity is unknown
    }

    // check if product is already in cart and its current quantity there
    const existingCartItem = cartItems.find(item => item.product.id === product.id && item.product.storeId === product.storeId);
    const currentQuantityInCart = existingCartItem ? existingCartItem.qty : 0;
    const requestedTotalQuantity = currentQuantityInCart + quantity;

    if (requestedTotalQuantity <= availableQuantity) {
      addToCart(product, quantity); // Add to cart using the context function
      Alert.alert(t('success'), t('Product added to cart'));
    } else {
      Alert.alert(
        t('out of stock'),
        `${t('You can only add up to')} ${availableQuantity - currentQuantityInCart} ${t('more of')} ${product.name}. ${t('Your current cart contains')} ${currentQuantityInCart} ${t('items of this product.')}`
      );
    }
  } catch (error: any) {
    console.error('Error during Add to Cart process:', error);
    Alert.alert(t('Error'), `${t('Failed to add product to cart')}: ${error.message}`);
  } finally {
    // setLoading(false); // Only set false if setLoading was set to true at the start of this function
  }
};


  const handleQuantityInputChange = (text: string) => {
    // Allow empty string temporarily, will revert to '1' on blur if invalid
    setQuantityInput(text);
  };

  useEffect(() => {
    navigation.setOptions({
      title: product?.name || t('Product Details'), // Use translation for default title
    });
     // Clean up function (optional for basic fetch, but good practice)
    return () => {
        // Any cleanup for listeners or pending tasks
    };
  }, [product, navigation, t]); // Include t in dependencies if using t in options

  // Effect for fetching Product Details (existing logic)
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);

      // Convert productId from useLocalSearchParams to number
      const id = typeof productId === 'string' ? parseInt(productId, 10) : productId;
      if (id === undefined || isNaN(id)) {
          console.error("Invalid Product ID:", productId);
          setLoading(false);
          setProduct(null); // Or handle as a route error
          return;
      }


      if (USE_DUMMY_DATA) {
        const selectedProduct = DUMMY_PRODUCTS.find(p => p.id === id); // Use parsed id
        setProduct(selectedProduct || null);
        setLoading(false);
      } else {
        try {
          const authToken = await SecureStore.getItemAsync('auth_token');
          if (!authToken) {
               console.error('Authentication token not found for product details.');
               Alert.alert(t('Authentication Required'), t('Please log in to view product details.'));
               setLoading(false);
               setProduct(null); // Cannot fetch without auth
               // Optionally redirect to login
               // router.push('/login');
               return;
            }

          const response = await fetch(baseURL + `/api/Catalog/products/${id}`, { // Use parsed id
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            }
          });
          if (!response.ok) {
               if (response.status === 401 || response.status === 403) {
                 Alert.alert(t('Authorization Error'), t('You are not authorized to view this product.'));
               } else {
                 throw new Error(`Product not found or fetch failed: ${response.status}`);
               }
               setProduct(null); // Set product to null on error
               return; // Stop processing
          }
          const data: Product = await response.json();
          console.log("Fetched product data:", data);


          // Existing check for cart store mismatch
          const cartStore = (cartItems && cartItems.length > 0 && cartItems[0].product) ? cartItems[0].product.storeId : 0;

           // Check if the fetched product is from a different store than current cart items
           if (cartStore !== 0 && data.storeId !== cartStore) {
               console.warn(`Product store ID (${data.storeId}) does not match cart store ID (${cartStore}). Marking product as inactive.`);
               Alert.alert(
                   t('Cannot add product'),
                   t('You already have items from another store in your cart. Please finalize your order or clear the cart to add items from this store.')
               );
               // Modify a *copy* of the product data if you need to disable adding
               // Or better, handle the disabled state in the UI based on this condition
               // For now, let's just add a flag or rely on the checkAndAddToCart logic
               // data.isActive = false; // Modifying fetched data is risky, handle UI state instead
           }


          setProduct(data);

        } catch (error: any) {
          console.error('Error fetching product:', error);
           Alert.alert(t('Error'), `${t('Failed to load product details')}: ${error.message}`);
          setProduct(null);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProductDetails();
     // Include cartItems in dependencies if the cart store check should re-run when cart changes
  }, [productId, cartItems, baseURL, USE_DUMMY_DATA, t, router]); // Add relevant dependencies


  if (loading) {
    return (
         <View style={styles.centered}>
             <ActivityIndicator size="large" color="#4e8d7c" />
             <Text style={{ marginTop: 10, color: '#555' }}>{t('loading_product')}</Text>
         </View>
     );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t('Product not found')}</Text> {/* Use translation */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>{t('Go Back')}</Text> {/* Use translation */}
        </TouchableOpacity>
      </View>
    );
  }

   // Determine if the "Add to Cart" button should be disabled
   // Based on product.isActive AND if the product's store matches the cart's store (if cart is not empty)
   const cartStore = (cartItems && cartItems.length > 0 && cartItems[0].product) ? cartItems[0].product.storeId : 0;
   const isProductFromSameStoreAsCart = cartStore === 0 || product.storeId === cartStore;
   const isAddToCartButtonDisabled = !product.isActive || !isProductFromSameStoreAsCart;
   const addToCartButtonText = isAddToCartButtonDisabled
        ? (!product.isActive ? t('Not Available') : t('Different Store Items in Cart')) // More specific disabled message
        : t('Add to Cart');


  return (
    <ScrollView style={styles.container}>

      {/* sekcija sa slikama i strelicama */}
      <View style={styles.imageSection}>
        {product.photos && product.photos.length > 0 && ( // Added check for product.photos existence
          <>
            <TouchableOpacity
              style={[styles.navArrow, styles.leftArrow]}
              onPress={previousImage}
              disabled={currentImageIndex === 0}
            >
              <FontAwesome name="chevron-left" size={40} color={currentImageIndex === 0 ? '#ccc' : '#000'} />
            </TouchableOpacity>

            {/* Use a default placeholder image if product.photos[currentImageIndex] is null/undefined or empty string */}
            <Image
              source={{ uri: product.photos[currentImageIndex] || 'https://via.placeholder.com/300?text=No+Image' }}
              style={styles.productImage}
               onError={(e) => console.error("Failed to load product image:", product.photos[currentImageIndex], e.nativeEvent.error)}
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
         {/* Handle case where product has no photos */}
        {(!product.photos || product.photos.length === 0) && (
             <Image
               source={{ uri: 'https://via.placeholder.com/300?text=No+Image+Available' }}
               style={styles.productImage}
             />
         )}
      </View>

      {/* Podaci o proizvodu */}
      <View style={styles.infoSection}>
        <Text style={styles.productName}>{product.name}</Text>

        {typeof product.weight === 'number' && product.weight > 0 && product.weightUnit && ( // Check for weightUnit existence
          <Text style={styles.productDetailText}>
            {t('weight')}: {product.weight} {product.weightUnit}
          </Text>
        )}

        {typeof product.volume === 'number' && product.volume > 0 && product.volumeUnit && ( // Check for volumeUnit existence
          <Text style={styles.productDetailText}>
            {t('volume')}: {product.volume} {product.volumeUnit}
          </Text>
        )}
         {/* Optional: Display category */}
         {product.productCategory?.name && (
             <Text style={styles.productDetailText}>
                {t('Category')}: {product.productCategory.name}
             </Text>
         )}


        {product.wholesaleThreshold !== undefined && product.wholesaleThreshold !== null && product.wholesaleThreshold >= 0 ? ( // Added null/>=0 check
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

        {/* Display Stock Quantity (Optional) */}
        {typeof product.quantity === 'number' && (
             <Text style={[styles.productDetailText, { fontWeight: 'bold', color: product.quantity > 0 ? '#28a745' : '#dc3545' }]}>
                {t('In Stock')}: {product.quantity > 0 ? product.quantity : t('Out of Stock')}
             </Text>
         )}


        {/* Display "Not Available" message if needed */}
         {!product.isActive && (
             <View style={styles.notAvailableContainer}>
                <Text style={styles.notAvailableMessage}>{t('This product is currently not available.')}</Text>
             </View>
         )}

         {/* Display "Different Store" message if needed */}
         {product.isActive && !isProductFromSameStoreAsCart && (
              <View style={styles.notAvailableContainer}>
                 <Text style={[styles.notAvailableMessage, { color: '#ffc107' }]}>{t('Cannot add items from different stores.')}</Text>
             </View>
         )}


         {/* Quantity selector and Add to Cart button only if product is active AND from the same store */}
        {product.isActive && isProductFromSameStoreAsCart ? (
          <>
            {/* Quantity selector */}
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
                        const num = parseInt(quantityInput, 10);
                        if (!quantityInput || isNaN(num) || num < 1) {
                            setQuantityInput('1');
                        } else {
                             // Ensure integer is displayed after blur
                            setQuantityInput(num.toString());
                        }
                    }}
                    onFocus={() => {
                        // Optional: Clear input on focus if it's '1' for faster entry
                        if (quantityInput === '1') {
                           // setQuantityInput(''); // Decided against auto-clearing '1' as it can be annoying
                        }
                    }}
                />
                <TouchableOpacity style={styles.quantityButton} onPress={incrementQuantity}>
                    <FontAwesome name="plus" size={18} color="#000" />
                </TouchableOpacity>
            </View>

            {/* Add to Cart Button */}
            <TouchableOpacity
                style={[styles.addToCartButton, isAddToCartButtonDisabled && styles.addToCartButtonDisabled]}
                onPress={checkAndAddToCart} // Call the combined handler
                disabled={isAddToCartButtonDisabled} // Disable based on combined logic
             >
              <Text style={styles.addToCartButtonText}>{addToCartButtonText}</Text>
            </TouchableOpacity>
          </>
        ) : null /* Don't render quantity selector and add to cart if not active or different store */}
      </View>
          {/* Chat button - remains visible regardless of product availability */}
          {/* Ensure product.storeId exists before showing chat button */}
          {product?.storeId && (
              <TouchableOpacity style={styles.chatButton} onPress={handleConversationPress}>
                <FontAwesome name="comments" size={24} color="white" />
              </TouchableOpacity>
          )}

           {/* Optional: Loader over the add to cart button */}
            {/* {loading && <ActivityIndicator style={styles.addToCartLoader} size="small" color="#fff" />} */}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
    centered: { // Added for loading state
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8f8f8',
    },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  quantityInput: {
    width: 60, // Adjusted width for better centering and shorter numbers
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
    backgroundColor: '#fff',
    paddingVertical: 5, // Added vertical padding
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  productDetailText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
   // Availability text styles are fine
  notAvailableContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  notAvailableMessage: {
    fontSize: 16,
    color: '#dc3545',
    fontWeight: 'bold',
  },
  quantityButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 20, // Slightly larger for touch target
    width: 40, // Increased size
    height: 40, // Increased size
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10, // Adjusted margin
  },
  // quantityButtonText style not needed with FontAwesome
  // quantityText style not needed with TextInput
  addToCartButton: {
    backgroundColor: '#4E8D7C',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  addToCartButtonDisabled: { // New style for disabled button
      backgroundColor: '#a0a0a0', // Greyed out color
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
   addToCartLoader: { // Optional: Loader over button
       position: 'absolute',
       alignSelf: 'center',
   },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // languageButton styles are not used in this screen, they were in StoresScreen
  imageSection: {
    position: 'relative',
    width: '100%',
    height: 350,
    backgroundColor: '#f5f5f5',
    marginBottom: 20,
    justifyContent: 'center', // Center image vertically
    alignItems: 'center', // Center image horizontally
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
    paddingHorizontal: 15, // Increased touch area
    paddingVertical: 20,
    backgroundColor: 'rgba(255,255,255,0.6)', // Semi-transparent background
    borderRadius: 5,
  },
  leftArrow: {
    left: 0, // Align arrows to edges
  },
  rightArrow: {
    right: 0, // Align arrows to edges
  },
  infoSection: {
    paddingHorizontal: 20, // Adjusted padding
    paddingBottom: 20,
  },
  productName: {
    fontSize: 26, // Slightly larger
    fontWeight: '700',
    marginBottom: 8,
    color: '#333',
  },
  price: {
    fontSize: 24, // Slightly larger
    fontWeight: '700',
    color: '#4E8D7C',
    marginVertical: 10, // Added vertical margin
  },
  // detailsSection, detailRow, detailLabel, detailValue not used in current JSX
    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      backgroundColor: '#f8f8f8', // Added background
    },
    errorText: {
      fontSize: 18,
      color: '#FF3B30',
      marginBottom: 16,
      textAlign: 'center', // Centered text
    },
    backButton: {
      padding: 12,
      backgroundColor: '#4E8D7C', // Changed color to theme color
      borderRadius: 8,
    },
    backButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    chatButton: {
      // uklonjeno: position: 'absolute',
      // uklonjeno: bottom: 20,
      // uklonjeno: right: 20,
      marginTop: 20, // Dodajte marginu iznad dugmeta za razmak od prethodnog elementa (Add to Cart)
      backgroundColor: '#4E8D7C',
      padding: 15,
      borderRadius: 50,
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      // uklonjeno: zIndex: 999,
      alignSelf: 'flex-end', // Poravnaj dugme desno unutar kontejnera (infoSection)
      // width: 60, // Ako želite fiksnu širinu
      // height: 60, // Ako želite fiksnu visinu
      justifyContent: 'center',
      alignItems: 'center',
  },
   });

   export default ProductDetailsScreen;