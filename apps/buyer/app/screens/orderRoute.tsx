// RouteScreen.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, LatLng } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { baseURL, USE_DUMMY_DATA } from 'proba-package';

const GOOGLE_API_KEY = 'AIzaSyCr2UAxBSN0eZxa5ahJKokuzJZy9Em203Q';

export default function RouteScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const sellerAddress = params.sellerAddress as string;
  const buyerAddress = params.buyerAddress as string;

  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<{ seller: LatLng; buyer: LatLng; route: LatLng[] } | null>(null);

  useEffect(() => {
    async function fetchCoords() {
      try {
        if (USE_DUMMY_DATA) {
          // Dummy coordinates and simple route line
          const sellerCoord = { latitude: 43.851087, longitude: 18.360781 };
          const buyerCoord = { latitude: 43.8525, longitude: 18.3625 };
          const routeCoords: LatLng[] = [
            sellerCoord,
            { latitude: (sellerCoord.latitude + buyerCoord.latitude) / 2, longitude: (sellerCoord.longitude + buyerCoord.longitude) / 2 },
            buyerCoord,
          ];
          setCoords({ seller: sellerCoord, buyer: buyerCoord, route: routeCoords });
          return;
        }

        // Geocode helper
        async function geocode(address: string): Promise<LatLng> {
          const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;
          const res = await fetch(url);
          const json = await res.json();
          if (json.status !== 'OK' || !json.results.length) throw new Error('Geocode failed');
          const { lat, lng } = json.results[0].geometry.location;
          return { latitude: lat, longitude: lng };
        }

        // Fetch real coordinates
        const sellerCoord = await geocode(sellerAddress);
        const buyerCoord = await geocode(buyerAddress);

        // Directions API
        const dirUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${sellerCoord.latitude},${sellerCoord.longitude}` +
                       `&destination=${buyerCoord.latitude},${buyerCoord.longitude}` +
                       `&key=${GOOGLE_API_KEY}`;
        const dirRes = await fetch(dirUrl);
        const dirJson = await dirRes.json();
        if (dirJson.status !== 'OK' || !dirJson.routes.length) throw new Error('Directions failed');

        // Decode polyline
        const points = dirJson.routes[0].overview_polyline.points;
        const decode = (t: string): LatLng[] => {
          const coords: LatLng[] = [];
          let index = 0, lat = 0, lng = 0;
          while (index < t.length) {
            let b, shift = 0, result = 0;
            do { b = t.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
            const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
            lat += dlat;
            shift = 0; result = 0;
            do { b = t.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
            const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
            lng += dlng;
            coords.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
          }
          return coords;
        };
        const routeCoords = decode(points);
        setCoords({ seller: sellerCoord, buyer: buyerCoord, route: routeCoords });
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'Failed to load route.');
        router.back();
      } finally {
        setLoading(false);
      }
    }
    fetchCoords();
  }, []);

  if (loading || !coords) {
    return <View style={styles.loader}><ActivityIndicator size="large" /></View>;
  }

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={{
        latitude: (coords.seller.latitude + coords.buyer.latitude) / 2,
        longitude: (coords.seller.longitude + coords.buyer.longitude) / 2,
        latitudeDelta: Math.abs(coords.seller.latitude - coords.buyer.latitude) * 2,
        longitudeDelta: Math.abs(coords.seller.longitude - coords.buyer.longitude) * 2,
      }}
    >
      <Marker coordinate={coords.seller} title="Seller" pinColor="blue" />
      <Marker coordinate={coords.buyer} title="You" pinColor="green" />
      <Polyline coordinates={coords.route} strokeWidth={4} />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});