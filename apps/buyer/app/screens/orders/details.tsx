// screens/orders/details.tsx (ili screens/orders/details/index.tsx)
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions,
  SafeAreaView, Platform
 } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { t } from 'i18next';
import CartItem from 'proba-package/cart-item/index';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { setParams } from 'expo-router/build/global-state/routing';
import Tooltip from 'react-native-walkthrough-tooltip';
import { Ionicons } from '@expo/vector-icons';

import Constants from 'expo-constants';

const baseURL = Constants.expoConfig!.extra!.apiBaseUrl as string;
const USE_DUMMY_DATA = Constants.expoConfig!.extra!.useDummyData as boolean;


interface Store {
  id: number;
  name: string;
  address: string;
  description?: string;
  isActive: boolean;
  categoryid: number;
  logoUrl?: string;
}

interface OrderItem {
  id: string;
  productId: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  buyerId: string;
  storeId: number;
  status: string;
  time: string;
  total: number;
  orderItems: OrderItem[];
  addressId: number;
}

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
  quantity: number;
}

// Dummy podaci
// const USE_DUMMY_DATA = true;

const DUMMY_ORDERS: Order[] = [
  {
    id: '123',
    time: '2025-04-18T14:23:00Z',
    buyerId: 'B001',
    storeId: 1,
    status: 'Requested',
    total: 6.20,
    orderItems: [
      { id: '1', productId: '1', price: 2.50, quantity: 2 },
      { id: '2', productId: '2', price: 1.20, quantity: 1 },
    ],
    addressId: 0,
  },
  {
    id: '456',
    time: '2025-04-17T09:15:00Z',
    buyerId: 'B001',
    storeId: 2,
    status: 'Ready',
    total: 5.00, 
    orderItems: [
      { id: '1', productId: '1', price: 2.50, quantity: 2 },
    ],
    addressId: 0,
  },
  {
    id: '789',
    time: '2025-04-15T18:40:00Z',
    buyerId: 'B001',
    storeId: 3,
    status: 'Delivered',
    total: 3.60,
    orderItems: [
      { id: '2', productId: '2', price: 1.20, quantity: 3 },
    ],
    addressId: 0,
  },
];

const DUMMY_PRODUCTS: Product[] = [
  { id: 1, name: 'Mlijeko 1L', productCategory: { id: 1, name: 'Mliječni proizvodi' }, retailPrice: 2.50, wholesalePrice: 2.20, storeId: 123, photos: ['https://via.placeholder.com/300/ADD8E6/000000?Text=Mlijeko'], isActive: true, wholesaleThreshold: 10, quantity: 15 },
  { id: 2, name: 'Hljeb', productCategory: { id: 2, name: 'Pekarski proizvodi' }, retailPrice: 1.20, wholesalePrice: 1.00, storeId: 123, photos: ['https://via.placeholder.com/300/F0E68C/000000?Text=Hljeb'], isActive: true, quantity: 10 },
];

const statusColors: Record<string, string> = {
  "Requested": '#FBBF24',
  "Confirmed": '#3B82F6',
  "Ready": '#10B981',
  "Sent": '#6366F1',
  "Delivered": '#059669',
  "Rejected": '#EF4444',
  "Canceled": '#ff5e00'
};

const DUMMY_STORES: Store[] = [
  { id: 1, name: 'Supermarket A', address: 'Adresa A', isActive: true, categoryid: 1 },
  { id: 2, name: 'Lokalna trgovina B', address: 'Adresa B', isActive: true, categoryid: 2 },
  { id: 3, name: 'Online Shop C', address: 'Adresa C', isActive: true, categoryid: 3 },
];

export default function DetailsScreen() {
   const { orderId, storeId } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailedOrderItems, setDetailedOrderItems] = useState<({ product: Product | undefined } & OrderItem)[]>([]);
  const [storeName, setStoreName] = useState<string | null>(null);
  const navigation = useNavigation();
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);

  const routeButtonRef = useRef(null);
  const ticketButtonRef = useRef(null);
  const chatButtonRef = useRef(null);
  const firstProductItemRef = useRef(null);

  const startWalkthrough = () => {
    setShowWalkthrough(true);
    setWalkthroughStep(1); // Počinjemo od prvog koraka
  };

  const goToNextStep = () => {
    setWalkthroughStep(prevStep => prevStep + 1);
  };

  const goToPreviousStep = () => {
    setWalkthroughStep(prevStep => prevStep - 1);
  };

  const finishWalkthrough = () => {
    setShowWalkthrough(false);
    setWalkthroughStep(0); 
  };

  const handleConversationPress = async () => {
    if (!order) {
      return;
    }
    const requestBody = {
      storeId: Number(order.storeId),
      orderId: orderId,
      productId: null,
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
      console.error('API Error Response Status:', response.status);
      console.error('API Error Response Body:', errorText);
      throw new Error(`Greška pri pronalaženju/kreiranju konverzacije: ${response.status}`);
    }

    const data = await response.json(); // Parsiraj JSON odgovor

    console.log("Chat? ", data);

    // Navigate using expo-router
    // The path `/chat/${item.id}` should correspond to a file like `app/chat/[conversationId].js` or `app/chat/[id].js`
    // Params passed here will be available in ChatScreen via `useLocalSearchParams`

      router.push({
      pathname: `(tabs)/chat/${data.id}` as any, // Dynamic route using conversation ID
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

  const handleTicketPress = async () => {
    console.log("pritisnuto! OrderId: ", orderId);
    router.push({
      pathname: './ticketCreate', // Putanja do vašeg ekrana
      params: { orderId: orderId.toString() }, // Prosleđivanje orderId kao string
    });
  }

  const handleProductPress = (product: Product, quantity: number) => {
    router.push(`./productDetails/${product.id}?quantity=${quantity}`);
  };

  useEffect(() => {
    async function fetchStoreName(storeId: number) {
      if (USE_DUMMY_DATA) {
        const store = DUMMY_STORES.find(s => s.id === storeId);
        setStoreName(store?.name || t('store_not_found', 'Trgovina nije pronađena'));
      } else {
        try {
          const authToken = await SecureStore.getItemAsync('auth_token');
          const storesResponse = await fetch(baseURL + `/api/Stores`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            }
          });
          if (!storesResponse.ok) {
            const errorBody = await storesResponse.text();
            console.error(`Stores fetch error: ${storesResponse.status}, message: ${errorBody}`);
            setStoreName(t('store_info_error', 'Greška pri dohvaćanju informacija o trgovini'));
            return;
          }
          const storesData: Store[] = await storesResponse.json();
          const store = storesData.find(s => s.id === storeId);
          setStoreName(store?.name || t('store_not_found', 'Trgovina nije pronađena'));
        } catch (e) {
          console.error('Greška pri dohvaćanju imena trgovine:', e);
          setStoreName(t('store_info_error', 'Greška pri dohvaćanju informacija o trgovini'));
        }
      }
    }

    async function fetchOrderDetails() {
      setLoading(true);
      setError(null);
      try {
        if (USE_DUMMY_DATA) {
          const dummyOrder = DUMMY_ORDERS.find((o) => o.id === orderId);
          if (dummyOrder) {
            setOrder(dummyOrder);
            const detailedItems = dummyOrder.orderItems.map((item) => ({
              ...item,
              product: DUMMY_PRODUCTS.find((p) => p.id.toString() === item.productId),
            }));
            setDetailedOrderItems(detailedItems);
            fetchStoreName(dummyOrder.storeId);
          } else {
            setError(t('order_not_found', 'Narudžba nije pronađena.'));
          }
        } else {
          const authToken = await SecureStore.getItemAsync('auth_token');
          const orderResponse = await fetch(baseURL + `/api/OrderBuyer/order/${orderId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            }
          });

          if (!orderResponse.ok) {
            throw new Error(`Greška pri dohvaćanju narudžbe: ${orderResponse.status}`);
          }
          const orderData = (await orderResponse.json()) as Order;
          setOrder(orderData);

          // detalji peoizvoda za svaki order item iz ordera
          const detailedItems = await Promise.all(
            orderData.orderItems.map(async (item) => {
              try {
          const authToken = await SecureStore.getItemAsync('auth_token');
          const productResponse = await fetch(
                  baseURL + `/api/Catalog/products/${item.productId}`, {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${authToken}`
                    }
                  }
                );
                if (!productResponse.ok) {
                  console.warn(`Nije pronađen proizvod sa ID: ${item.productId}`);
                  return { ...item, product: undefined };
                }
                const productData = (await productResponse.json()) as Product;
                return { ...item, product: productData };
              } catch (e) {
                console.error(`Greška pri dohvaćanju proizvoda sa ID: ${item.productId}`, e);
                return { ...item, product: undefined };
              }
            })
          );
          setDetailedOrderItems(detailedItems);
          fetchStoreName(orderData.storeId);
        }
      } catch (e: any) {
        console.error('Greška pri dohvaćanju detalja narudžbe:', e);
        setError(t('order_details_error', 'Došlo je do greške pri dohvaćanju detalja narudžbe.'));
      } finally {
        setLoading(false);
      }
    }

    fetchOrderDetails();
  }, [orderId]);

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.headerContainer}>
            {/* Lijeva strana - prazna ili za back dugme */}
            <View style={styles.sideContainer} /> 
            
            {/* Naslov headera */}
            <View style={styles.titleContainer}>
              <Text style={styles.headerText} numberOfLines={1} ellipsizeMode="tail">
                {t('order_details')}
              </Text>
            </View>
            
            {/* Desna strana - dugme za pomoć */}
            <View style={[styles.sideContainer, styles.rightSideContainer]}>
              <TouchableOpacity onPress={startWalkthrough} style={styles.iconButton}>
                <Ionicons name="help-circle-outline" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.headerContainer}>
            {/* Lijeva strana - prazna ili za back dugme */}
            <View style={styles.sideContainer} /> 
            
            {/* Naslov headera */}
            <View style={styles.titleContainer}>
              <Text style={styles.headerText} numberOfLines={1} ellipsizeMode="tail">
                {t('order_details')}
              </Text>
            </View>
            
            {/* Desna strana - dugme za pomoć */}
            <View style={[styles.sideContainer, styles.rightSideContainer]}>
              <TouchableOpacity onPress={startWalkthrough} style={styles.iconButton}>
                <Ionicons name="help-circle-outline" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
      <View style={styles.container}>
        <Text>{t('order_not_found', 'Narudžba nije pronađena.')}</Text>
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
                {t('order_details')}
              </Text>
            </View>
            
            {/* Desna strana - dugme za pomoć */}
            <View style={[styles.sideContainer, styles.rightSideContainer]}>
              <TouchableOpacity onPress={startWalkthrough} style={styles.iconButton}>
                <Ionicons name="help-circle-outline" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>{t('order_details')}</Text>

      <View style={styles.detailItem}>
        <Text style={styles.label}>{t('order_id')}:</Text>
        <Text style={styles.value}>{order.id}</Text>
      </View>

      {/* Ostali detalji narudžbe */}
      <View style={styles.detailItem}>
        <Text style={styles.label}>{t('date_time')}:</Text>
        <Text style={styles.value}>{new Date(order.time).toLocaleString()}</Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.label}>{t('store')}:</Text>
        <Text style={styles.value}>{storeName}</Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.label}>{t('status')}:</Text>
        <Text style={{ ...styles.value, color: statusColors[order.status] || 'black' }}>
          {order.status}
        </Text>
      </View>

      {/* Tooltip za dugme "Ruta narudžbe" */}
  <Tooltip
    isVisible={showWalkthrough && walkthroughStep === 1}
    content={
      <View style={styles.tooltipContent}>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          {t('tutorial_order_route')} 
        </Text>
        <View style={styles.tooltipButtonContainer}>
          <TouchableOpacity
            style={[styles.tooltipButtonBase, styles.tooltipNextButton]}
            onPress={goToNextStep}
          >
            <Text style={styles.tooltipButtonText}>{t('next')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    }
    placement="top" // Ili "bottom" ovisno gdje želite da se tooltip pojavi
    onClose={finishWalkthrough}
    tooltipStyle={{ width: Dimensions.get('window').width * 0.8 }}
    useReactNativeModal={true}
    arrowSize={{ width: 16, height: 8 }}
    showChildInTooltip={true}
  >
      <TouchableOpacity ref={routeButtonRef} style={styles.routeButton} onPress={() => router.push({ pathname: `/screens/orderRoute`, params: { orderId: order.id, addressId: order.addressId } })}>
        <Text style={styles.routeButton}>{t('order_route')}</Text>
      </TouchableOpacity>
      </Tooltip>

      <Text style={[styles.title, styles.itemsTitle]}>{t('ordered_items')}</Text>
      {detailedOrderItems.filter(item=>item.product).map((item) => (
        <CartItem
        key={item.id}
        product={item.product!}
        quantity={item.quantity}
        isSwipeable={false}
        onPress={() => handleProductPress(item.product!, item.quantity)} 
      />
      ))}

      {order?.total !== undefined && (
      <View style={styles.totalPriceContainer}>
        <Text style={styles.totalPriceLabel}>{t('total_price')}:</Text>
        <Text style={styles.totalPriceValue}>{order.total.toFixed(2)} KM</Text>
      </View>
    )}
      {/* Chat button */}
      <View style={styles.bubbleButtons}>
        {/* Tooltip za dugme "Kreiraj tiket" */}
    <Tooltip
      isVisible={showWalkthrough && walkthroughStep === 2}
      content={
        <View style={styles.tooltipContent}>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>
            {t('tutorial_create_ticket')}
          </Text>
          <View style={styles.tooltipButtonContainer}>
            <TouchableOpacity
              style={[styles.tooltipButtonBase, styles.tooltipPrevButton]}
              onPress={goToPreviousStep}
            >
              <Text style={styles.tooltipButtonText}>{t('previous')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tooltipButtonBase, styles.tooltipNextButton]}
              onPress={goToNextStep}
            >
              <Text style={styles.tooltipButtonText}>{t('next')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      }
      placement="bottom"
      onClose={finishWalkthrough}
      tooltipStyle={{ width: Dimensions.get('window').width * 0.8 }}
      useReactNativeModal={true}
      arrowSize={{ width: 16, height: 8 }}
      showChildInTooltip={true}
    >
      <TouchableOpacity ref={ticketButtonRef} style={styles.actionBubbleButton} onPress={handleTicketPress}>
        <FontAwesome name="warning" size={24} color="white" />
      </TouchableOpacity>
      </Tooltip>

      {/* Tooltip za dugme "Chat s trgovinom" */}
    <Tooltip
      isVisible={showWalkthrough && walkthroughStep === 3}
      content={
        <View style={styles.tooltipContent}>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>
            {t('tutorial_chat_with_store')}
          </Text>
          <View style={styles.tooltipButtonContainer}>
            <TouchableOpacity
              style={[styles.tooltipButtonBase, styles.tooltipPrevButton]}
              onPress={goToPreviousStep}
            >
              <Text style={styles.tooltipButtonText}>{t('previous')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tooltipButtonBase, styles.tooltipFinishButton]} 
              onPress={finishWalkthrough}
            >
              <Text style={styles.tooltipButtonText}>{t('finish')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      }
      placement="bottom"
      onClose={finishWalkthrough}
      tooltipStyle={{ width: Dimensions.get('window').width * 0.8 }}
      useReactNativeModal={true}
      arrowSize={{ width: 16, height: 8 }}
      showChildInTooltip={true}
    >
      <TouchableOpacity ref={chatButtonRef} style={styles.actionBubbleButton} onPress={handleConversationPress}>
        <FontAwesome name="comments" size={24} color="white" />
      </TouchableOpacity>
      </Tooltip>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

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
  actionBubbleButton: { // style for chat, ticket, and help buttons in the bubble
 backgroundColor: '#4E8D7C',
 padding: 15,
 borderRadius: 30,
 shadowColor: '#000',
 shadowOpacity: 0.25,
 shadowRadius: 4,
 elevation: 5,
 marginBottom:8
 },
  tooltipButtonBase: { 
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25, // Više zaobljeno
        marginHorizontal: 5,
        elevation: 2, // Mala sjena
        minWidth: 80, // Minimalna širina
        alignItems: 'center', // Centriraj tekst
    },
  tooltipButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tooltipContent: {
    alignItems: 'center',
    padding: 5,
  },
  tooltipButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  tooltipNextButton: {
    backgroundColor: '#4E8D7C',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  tooltipPrevButton: {
    backgroundColor: '#4E8D7C', 
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  tooltipFinishButton: {
    backgroundColor: '#4E8D7C',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#111827',
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4e8d7c',
    marginRight: 10,
    minWidth: 100,
  },
  value: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  itemsTitle: {
    marginTop: 30,
    marginBottom: 15,
    fontSize: 20,
  },
  totalPriceContainer: {
    marginTop: 10,
    marginBottom: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPriceLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalPriceValue: {
    fontSize: 18,
    color: 'green',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  bubbleButtons:{
    position: 'absolute',
    flexDirection: 'column',
    right: -5,
    zIndex: 999
  },
  chatButton: {
  marginRight: 5,
  backgroundColor: '#4E8D7C',
  padding: 15,
  borderRadius: 30,
  shadowColor: '#000',
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
  },
  ticketButton: {
    right: 25
  },
  routeButton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    paddingBottom: 10,
    marginHorizontal: 40,
    backgroundColor: '#4E8D7C',
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
});