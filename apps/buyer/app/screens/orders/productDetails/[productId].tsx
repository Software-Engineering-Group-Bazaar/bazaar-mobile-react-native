import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity , TextInput, Alert, Dimensions,
  SafeAreaView, Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { FontAwesome } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';
import * as SecureStore from 'expo-secure-store';
import { baseURL, USE_DUMMY_DATA } from 'proba-package';
import Tooltip from 'react-native-walkthrough-tooltip';
import { Ionicons } from '@expo/vector-icons';

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

// const USE_DUMMY_DATA = true;

const DUMMY_PRODUCTS: Product[] = [
    { id: 1, name: 'Mlijeko 1L', productCategory: { id: 1, name: 'Mliječni proizvodi' }, retailPrice: 2.50, wholesalePrice: 2.20, storeId: 123, photos: ['https://via.placeholder.com/300/ADD8E6/000000?Text=Mlijeko'], isActive: true, wholesaleThreshold: 10, quantity: 15 },
    { id: 2, name: 'Hljeb', productCategory: { id: 2, name: 'Pekarski proizvodi' }, retailPrice: 1.20, wholesalePrice: 1.00, storeId: 123, photos: ['https://via.placeholder.com/300/F0E68C/000000?Text=Hljeb'], isActive: true, quantity: 10 },
  ];

const ProductDetailsScreen = () => {
  const router = useRouter();
  const { productId, quantity } = useLocalSearchParams();
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();

   const buttonRef = useRef(null); 
   const [showButtonTooltip, setShowButtonTooltip] = useState(false);
  
    // funkcija za pokretanje walkthrougha
    const startWalkthrough = () => {
      setShowButtonTooltip(true);
    };
  
    // funkcija za zatvaranje tooltipa
    const closeWalkthrough = () => {
      setShowButtonTooltip(false);
    };

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

      const handleConversationPress = async () => {
        if (!product) {
          return;
        }
        const requestBody = {
          storeId: Number(product.storeId),
          orderId: null,
          productId: productId,
        };
        
        const authToken = await SecureStore.getItemAsync('auth_token');
    
        console.log(JSON.stringify(requestBody));
        
        const response = await fetch(`${baseURL}/api/Chat/conversations/find-or-create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Dodajte Autorizacioni header ako vaš API to zahteva
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify(requestBody),
        });
    
        console.log(response);
    
        // 3. Obradi odgovor od API-ja
      if (!response.ok) {
        // Ako HTTP status nije 2xx, nešto nije u redu
        const errorText = await response.text(); // Pokušajmo pročitati odgovor kao tekst
        if (errorText.includes('No seller for store')) {
            Alert.alert(
              t('Error'),
              t('Ne možete komunicirati s prodavačem jer nema prodavača povezanog sa ovim proizvodom.') // Pružite korisniku specifičnu poruku
            );
        }
//         console.error('API Error Response Status:', response.status);
//         console.error('API Error Response Body:', errorText);
        throw new Error(`Greška pri pronalaženju/kreiranju konverzacije: ${response.status}`);
      }
    
        const data = await response.json(); // Parsiraj JSON odgovor
    
        console.log("Chat? ", data);
    
        // Navigate using expo-router
        // The path `/chat/${item.id}` should correspond to a file like `app/chat/[conversationId].js` or `app/chat/[id].js`
        // Params passed here will be available in ChatScreen via `useLocalSearchParams`
    
          router.push({
          pathname: `(tabs)/chat/${data.id}`, // Dynamic route using conversation ID
          params: {
            // conversationId is already part of the path, but you can pass it explicitly if needed
            // or if your ChatScreen expects it as a query param rather than a path segment.
            // For this example, assuming [conversationId].js handles the path segment.
            sellerUsername: data.sellerUsername,
            buyerUserId: data.buyerUserId,
            buyerUsername: data.buyerUserName,
            otherUserAvatar: data.otherUserAvatar, // || DEFAULT_AVATAR,
            // MOCK_CURRENT_USER_ID is handled within ChatScreen's self-contained logic
          },
        });
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
      <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.headerContainer}>
            {/* Lijeva strana - prazna ili za back dugme */}
            <View style={styles.sideContainer} /> 
            
            {/* Naslov headera */}
            <View style={styles.titleContainer}>
              <Text style={styles.headerText} numberOfLines={1} ellipsizeMode="tail">
                {t('product_details')}
              </Text>
            </View>
            
            {/* Desna strana - dugme za pomoć */}
            <View style={[styles.sideContainer, styles.rightSideContainer]}>
              <TouchableOpacity onPress={startWalkthrough} style={styles.iconButton}>
                <Ionicons name="help-circle-outline" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.headerContainer}>
            {/* Lijeva strana - prazna ili za back dugme */}
            <View style={styles.sideContainer} /> 
            
            {/* Naslov headera */}
            <View style={styles.titleContainer}>
              <Text style={styles.headerText} numberOfLines={1} ellipsizeMode="tail">
                {t('product_details')}
              </Text>
            </View>
            
            {/* Desna strana - dugme za pomoć */}
            <View style={[styles.sideContainer, styles.rightSideContainer]}>
              <TouchableOpacity onPress={startWalkthrough} style={styles.iconButton}>
                <Ionicons name="help-circle-outline" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
    <View style={styles.outerContainer}>
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
     {/* Chat button */}
          <Tooltip
        isVisible={showButtonTooltip}
        content={
          <View style={styles.tooltipContent}>
            <Text style={{ fontSize: 16, marginBottom: 10 }}>
              {t('tutorial_chat_button_explanation')}
            </Text>
            {/*dugme "Završi" unutar tooltipa */}
            <TouchableOpacity
              style={styles.tooltipCloseButton}
              onPress={closeWalkthrough}
            >
              <Text style={styles.tooltipCloseButtonText}>
                {t('finish')}
              </Text>
            </TouchableOpacity>
          </View>
        }
        placement="left"
        onClose={closeWalkthrough} 
        tooltipStyle={{ width: Dimensions.get('window').width * 0.8 }}
        useReactNativeModal={true}
        arrowSize={{ width: 16, height: 8 }}
      >
          <TouchableOpacity style={styles.chatButton} ref={buttonRef} onPress={handleConversationPress}>
            <FontAwesome name="comments" size={24} color="white" />
          </TouchableOpacity>
          </Tooltip>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
      backgroundColor: '#4e8d7c',
      flex: 1, // Omogućava da SafeAreaView zauzme cijeli ekran
      marginTop:30
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#4e8d7c',
      paddingVertical: Platform.OS === 'ios' ? 12 : 18, // Prilagođeno za iOS/Android
      paddingHorizontal: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 4,
    },
    sideContainer: {
      width: 40, // Održava razmak na lijevoj strani za potencijalno dugme nazad
      justifyContent: 'center',
    },
    rightSideContainer: {
      alignItems: 'flex-end', // Poravnava dugme za pomoć desno
    },
    titleContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 5,
    },
    headerText: {
      color: '#fff',
      fontSize: 22,
      fontWeight: 'bold',
      letterSpacing: 1,
      textAlign: 'center',
    },
    iconButton: {
      padding: 5, // Dodao padding za lakši klik
    },
    outerContainer: {
   flex: 1,
   position: 'relative',} ,
  tooltipContent: {
    alignItems: 'center', 
    padding: 5,
  },
  tooltipCloseButton: {
    marginTop: 10,
    backgroundColor: '#4E8D7C', // Boja dugmeta
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  tooltipCloseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    top: 30,
    right: 30,
    backgroundColor: '#4E8D7C',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
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
        chatButton: {
    position: 'absolute', // KLJUČNO: Dugme je fiksno u odnosu na outerContainer
    bottom: 150,          // Podesi vertikalnu poziciju po potrebi
    right: 30,           // Podesi horizontalnu poziciju po potrebi
    backgroundColor: '#4E8D7C',
    padding: 15,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 999 // Osiguraj da je iznad ostalog sadržaja
  },
   });

   export default ProductDetailsScreen;