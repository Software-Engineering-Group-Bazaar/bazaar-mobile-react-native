// RouteScreen.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, Button, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, LatLng } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { baseURL, USE_DUMMY_DATA } from 'proba-package';
import * as SecureStore from 'expo-secure-store';
import { t } from 'i18next';

const GOOGLE_API_KEY = 'AIzaSyCr2UAxBSN0eZxa5ahJKokuzJZy9Em203Q';

export default function RouteScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const ownerId = params.ownerId as string; // if needed
  const addressId = parseInt(params.addressId as string);

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
  );
}

const styles = StyleSheet.create({
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