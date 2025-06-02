// RouteScreen.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, Button, TouchableOpacity, Text, SafeAreaView, Platform, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, LatLng } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { t } from 'i18next';
import Tooltip from 'react-native-walkthrough-tooltip';
import { Ionicons } from '@expo/vector-icons';

import Constants from 'expo-constants';

const baseURL = Constants.expoConfig!.extra!.apiBaseUrl as string;
const USE_DUMMY_DATA = Constants.expoConfig!.extra!.useDummyData as boolean;


const GOOGLE_API_KEY = Constants.expoConfig!.extra!.googleMapsApiKey as string;

export default function RouteScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const ownerId = params.ownerId as string; // if needed
  const addressId = parseInt(params.addressId as string);

  const [showWalkthrough, setShowWalkthrough] = useState(false);
  
      // Funkcija za pokretanje walkthrough-a
      const startWalkthrough = () => {
          setShowWalkthrough(true);
      };
  
      // Funkcija za završetak walkthrough-a
      const finishWalkthrough = () => {
          setShowWalkthrough(false);
      };

  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<{ seller: LatLng; buyer: LatLng; route: LatLng[] } | null>(null);

  useEffect(() => {
    async function fetchRoute() {
      try {
        if (USE_DUMMY_DATA) {
          // Dummy data: simple line between two points
          const sellerCoord: LatLng = { latitude: 43.851087, longitude: 18.360781 };
          const buyerCoord: LatLng = { latitude: 43.8525, longitude: 18.3625 };
          const routeCoords: LatLng[] = [
            sellerCoord,
            { latitude: 43.851086, longitude: 18.360783 },
            { latitude: 43.851084, longitude: 18.36088 },
            { latitude: 43.851072, longitude: 18.36079 },
            { latitude: 43.851026, longitude: 18.36098 },
            { latitude: 43.851055, longitude: 18.36099 },
            { latitude: 43.851045, longitude: 18.3611 },
            { latitude: 43.851009, longitude: 18.3610 },
            { latitude: 43.851012, longitude: 18.3619 },
            { latitude: 43.851031, longitude: 18.3609 },
            { latitude: 43.851058, longitude: 18.3614 },
            { latitude: 43.8525, longitude: 18.361 },
            buyerCoord,
          ];
          setCoords({ seller: sellerCoord, buyer: buyerCoord, route: routeCoords });
        } else {
          const authToken = await SecureStore.getItemAsync('auth_token');
          if (!authToken) {
            console.error('Authentication token not found.');
            throw new Error('Auth token missing');
          }
          // Fetch stored route data from backend
          const res = await fetch(`${baseURL}/api/Delivery/routes/by-orders`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json', // Iako je GET, dobra praksa
              },
              body: JSON.stringify([orderId]),
            }
          );
          if (!res.ok) throw new Error(`Failed to fetch route: ${res.status}`);
          const jsonRes = await res.json();
          console.log(jsonRes);
          console.log(jsonRes.routeData);

          const resAdr = await fetch(`${baseURL}/api/user-profile/address/${addressId}`,
            {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json', // Iako je GET, dobra praksa
              },
            }
          );
          if (!resAdr.ok) throw new Error(`Failed to fetch route: ${resAdr.status}`);
          const jsonResAdr = await resAdr.json();

          const json = jsonRes.routeData;
          // json.data is the Google Directions API response
          const directions = typeof json.data === 'string' ? JSON.parse(json.data) : json.data;
          // if (!directions.routes?.length) throw new Error('No routes in data');
          const route = directions;
          // Extract start/end
          const leg = route.legs[0];
          const sellerCoord: LatLng = { latitude: leg.start_location.lat, longitude: leg.start_location.lng };
          // const buyerCoord: LatLng = { latitude: leg.end_location.lat, longitude: leg.end_location.lng };
          const buyerCoord: LatLng = { latitude: jsonResAdr.latitude, longitude: jsonResAdr.longitude };
          // Decode overview polyline
          const poly = route.overview_polyline.points;
          const decode = (t: string): LatLng[] => {
            const points: LatLng[] = [];
            let index = 0, lat = 0, lng = 0;
            while (index < t.length) {
              let b: number, shift = 0, result = 0;
              do {
                b = t.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
              } while (b >= 0x20);
              lat += ((result & 1) ? ~(result >> 1) : (result >> 1));
              shift = 0;
              result = 0;
              do {
                b = t.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
              } while (b >= 0x20);
              lng += ((result & 1) ? ~(result >> 1) : (result >> 1));
              points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
            }
            return points;
          };
          const routeCoords = decode(poly);
          setCoords({ seller: sellerCoord, buyer: buyerCoord, route: routeCoords });
        }
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'Failed to load route.');
        router.back();
      } finally {
        setLoading(false);
      }
    }
    fetchRoute();
  }, [orderId]);

  if (loading || !coords) {
    return <View style={styles.loader}><ActivityIndicator size="large" /></View>;
  }

  const { seller, buyer, route } = coords;
  const midLat = (seller.latitude + buyer.latitude) / 2;
  const midLng = (seller.longitude + buyer.longitude) / 2;

  return (
    <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.headerContainer}>
            {/* Lijeva strana - prazna ili za back dugme */}
            <View style={styles.sideContainer} /> 
            
            {/* Naslov headera */}
            <View style={styles.titleContainer}>
              <Text style={styles.headerText} numberOfLines={1} ellipsizeMode="tail">
                {t('order_route')}
              </Text>
            </View>
            
            {/* Desna strana - dugme za pomoć */}
            <View style={[styles.sideContainer, styles.rightSideContainer]}>
              <TouchableOpacity onPress={startWalkthrough} style={styles.iconButton}>
                <Ionicons name="help-circle-outline" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          <Tooltip
                          isVisible={showWalkthrough}
                          content={
                            <View style={styles.tooltipContent}>
                              <Text style={{ fontSize: 16, marginBottom: 10 }}>
                                {t('tutorial_order_route_screen')}
                              </Text>
                              <View style={styles.tooltipButtonContainer}>
                                <TouchableOpacity
                                  style={[styles.tooltipButtonBase, styles.tooltipFinishButton]}
                                  onPress={finishWalkthrough}
                                >
                                  <Text style={styles.tooltipButtonText}>{t('finish')}</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          }
                          placement="center" // Ili "bottom"
                          onClose={finishWalkthrough}
                          tooltipStyle={{ width: Dimensions.get('window').width * 0.8 }}
                          useReactNativeModal={true}
                          arrowSize={{ width: 16, height: 8 }}
                          showChildInTooltip={true}
                        ></Tooltip>
    <View style={{ flex: 1 }}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: midLat,
          longitude: midLng,
          latitudeDelta: Math.abs(seller.latitude - buyer.latitude) * 2,
          longitudeDelta: Math.abs(seller.longitude - buyer.longitude) * 2,
        }}
      >
        <Marker coordinate={seller} title={t("seller")} pinColor="blue" />
        <Marker coordinate={buyer} title={t("buyer")} pinColor="green" />
        <Polyline coordinates={route} strokeWidth={3} />
      </MapView>
      <View style={styles.button}>
        <TouchableOpacity onPress={() => router.back()}>
            <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
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
    tooltipButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
   tooltipContent: {
        alignItems: 'center',
        padding: 10, 
        backgroundColor: 'white',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    tooltipButtonBase: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginHorizontal: 5,
        elevation: 2,
        minWidth: 80,
        alignItems: 'center',
    },
    tooltipButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    tooltipFinishButton: {
        backgroundColor: '#4E8D7C', // Zelena boja
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginHorizontal: 5,
    },
  map: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  button: { position: 'absolute', 
    bottom: 20, 
    left: 20, 
    right: 20, 
    padding: 10, 
    width: '17%',
    borderRadius: 19, 
    backgroundColor: '#007AF1', 
    textAlign: 'center',
    fontSize: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});