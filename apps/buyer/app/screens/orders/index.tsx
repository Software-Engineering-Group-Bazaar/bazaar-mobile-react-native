// app/(tabs)/orders/index.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Platform
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Tooltip from 'react-native-walkthrough-tooltip';

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
}

const DUMMY_ORDERS: Order[] = [
  { id: '123', time: '2025-04-18T14:23:00Z', buyerId: 'B001', storeId: 1, status: 'Requested', total: 6.2, orderItems: [{ id: '1', productId: '1', price: 2.5, quantity: 2 }, { id: '2', productId: '2', price: 1.2, quantity: 1 }] },
  { id: '456', time: '2025-04-17T09:15:00Z', buyerId: 'B001', storeId: 2, status: 'Ready', total: 5.0, orderItems: [{ id: '1', productId: '1', price: 2.5, quantity: 2 }] },
  { id: '789', time: '2025-04-15T18:40:00Z', buyerId: 'B001', storeId: 3, status: 'Delivered', total: 3.6, orderItems: [{ id: '2', productId: '2', price: 1.2, quantity: 3 }] },
];

const statusColors: Record<string, string> = {
  Requested: '#FBBF24',
  Confirmed: '#3B82F6',
  Ready: '#10B981',
  Sent: '#6366F1',
  Delivered: '#059669',
  Rejected: '#EF4444',
  Canceled: '#ff5e00',
};

export default function OrdersScreen() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<Record<string, string>>({});
  const router = useRouter();

  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);
  const firstOrderDetailsButtonRef = useRef(null);
  const firstOrderReviewButtonRef = useRef(null);

  //fje za walkthrough 
  const startWalkthrough = () => {
    if (orders.length > 0) {
      setShowWalkthrough(true);
      setWalkthroughStep(1); 
    }
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

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        if (USE_DUMMY_DATA) {
          await new Promise(res => setTimeout(res, 1000));
          setOrders(DUMMY_ORDERS);
        } else {
          const token = await SecureStore.getItemAsync('auth_token');
          const res = await fetch(`${baseURL}/api/OrderBuyer/order`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error(`Status ${res.status}`);
          const data: Order[] = await res.json();

          const storesRes = await fetch(`${baseURL}/api/Stores`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          });
          if (!storesRes.ok) throw new Error(`Stores ${storesRes.status}`);
          const storesData: Store[] = await storesRes.json();
          const map: Record<string, string> = {};
          storesData.forEach(s => (map[s.id] = s.name));
          setStores(map);

          setOrders(data.reverse());
        }
      } catch (err) {
        console.error('Error loading orders:', err);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.headerContainer}>
            {/* Lijeva strana - prazna ili za back dugme */}
            <View style={styles.sideContainer} /> 
            
            {/* Naslov headera */}
            <View style={styles.titleContainer}>
              <Text style={styles.headerText} numberOfLines={1} ellipsizeMode="tail">
                {t('my_orders')}
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
      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={o => o.id}
          renderItem={({ item, index }) => {
            const color = statusColors[item.status] || '#000';
            const isFirstOrder = index === 0;
            return (
              <View style={styles.card}>
                <View style={styles.infoContainer}>
                  <Text style={styles.smallText}>
                    {t('order_id', 'ID')}: <Text style={styles.bold}>{item.id}</Text>
                  </Text>
                  <Text style={styles.normalText}>
                    {t('order_price', 'Cijena')}: <Text style={styles.bold}>{item.total.toFixed(2)} KM</Text>
                  </Text>
                  <Text style={styles.normalText}>
                    {t('order_status', 'Status')}: <Text style={[styles.bold, { color }]}>{t(`status_${item.status}`, item.status)}</Text>
                  </Text>
                  <Text style={styles.normalText}>
                    {t('order_store', 'Prodavnica')}: <Text style={styles.bold}>{stores[item.storeId] || item.storeId}</Text>
                  </Text>
                </View>

                <View style={styles.buttonContainer}>
                  {/* --- Tooltip za Details Button --- */}
                  <Tooltip
                    isVisible={showWalkthrough && walkthroughStep === 1 && isFirstOrder}
                    content={
                      <View style={styles.tooltipContent}>
                        <Text style={{ fontSize: 16, marginBottom: 10 }}>
                          {t('tutorial_order_details_button')}
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
                    placement="left" // Ili "bottom" ovisno o poziciji
                    onClose={finishWalkthrough}
                    tooltipStyle={{ width: Dimensions.get('window').width * 0.8 }}
                    useReactNativeModal={true}
                    arrowSize={{ width: 16, height: 8 }}
                    showChildInTooltip={true}
                  >
                {/* Fully‐rounded Details Icon */}
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() =>
                    router.push({
                      pathname: './orders/details',
                      params: { orderId: item.id, storeId: item.storeId },
                    })
                  }
                  ref={isFirstOrder ? firstOrderDetailsButtonRef : null}
                >
                  <Ionicons name="information-circle-outline" size={20} color="#fff" />
                </TouchableOpacity>
                </Tooltip>

                {/* --- Tooltip za Review Button --- */}
                  <Tooltip
                    isVisible={showWalkthrough && walkthroughStep === 2 && isFirstOrder}
                    content={
                      <View style={styles.tooltipContent}>
                        <Text style={{ fontSize: 16, marginBottom: 10 }}>
                          {t('tutorial_order_review_button')}
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
                {/* Review Button */}
                <TouchableOpacity
                  style={styles.reviewButton}
                  onPress={() =>
                    router.push({
                      pathname: './orders/review',
                      params: { orderId: item.id, storeId: item.storeId },
                    })
                  }
                  ref={isFirstOrder ? firstOrderReviewButtonRef : null}
                >
                  <Ionicons name="star" size={20} color="#fff" />
                </TouchableOpacity>
                </Tooltip>

               </View>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.empty}>{t('orders_empty', 'Nema narudžbi za prikaz.')}</Text>}
        />
      )}
    </View>
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
  tooltipButtonBase: { 
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25, // Više zaobljeno
        marginHorizontal: 5,
        elevation: 2, // Mala sjena
        minWidth: 80, // Minimalna širina
        alignItems: 'center', // Centriraj tekst
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
  tooltipButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
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
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
  card: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    //position: 'relative',           // needed for absolute children
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    flexDirection: 'row', // Align children (infoContainer and buttonContainer) in a row
    justifyContent: 'space-between', // infoContainer to left, buttonContainer to right
    alignItems: 'center',
  },
  infoContainer: { marginBottom: 8 },
  smallText: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  normalText: { fontSize: 16, color: '#111827', marginBottom: 4 },
  bold: { fontWeight: '600' },
  empty: { textAlign: 'center', color: '#6B7280', marginTop: 40 },

  reviewButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4E8D7C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },

  buttonContainer: {
    flexDirection: 'column', 
    alignItems:'flex-end',
    marginRight:10
  },

  detailsButton: {

    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4E8D7C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
    marginBottom: 10
  },

  buttonText: { color: '#FFF', fontSize: 14, fontWeight: '500' },
});
