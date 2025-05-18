import React, { useState, useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import MapView, { Polyline, Marker, LatLng, Region } from 'react-native-maps';
import polyline from '@mapbox/polyline';
import { apiFetchActiveStore } from "../api/storeApi";
import { useLocalSearchParams } from 'expo-router';
import { getOrderById } from '../api/orderApi'
import { apiGetRoute } from '../api/routesApi';
import * as SecureStore from "expo-secure-store";

type Point = {
  latitude: number;
  longitude: number;
  duration?: string;
  address?: string;
};

type Regija = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

function getBoundingRegion(points: LatLng[]): Region {
  const latitudes = points.map(p => p.latitude);
  const longitudes = points.map(p => p.longitude);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(maxLat - minLat, 0.01),
    longitudeDelta: Math.max(maxLng - minLng, 0.01),
  };
}

export default function OptimalRouteMap() {
  const [route, setRoute] = useState<Point[]>([]);
  const [region, setRegion] = useState<Regija | undefined>();
  const [waypoints, setWaypoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const orderIds = useLocalSearchParams();
  const [optimalRoute, setOptimalRoute] = useState<any>(null);
  
  async function getStore() {
    setLoading(true);
    const activeStore = await apiFetchActiveStore();
    setLoading(false);
    if(activeStore) return activeStore.address;
  }

  /*async function fetchAddresses() {
    try {
      let idsArray: number[] = [];
      if (typeof orderIds.orders === "string") {
        try {
          const parsed = JSON.parse(orderIds.orders);
          if (Array.isArray(parsed)) {
            idsArray = parsed.map((id: any) => Number(id)); 
          }
        } catch (error) {
          console.error("Error parsing order IDs:", error);
        }
      } else if (Array.isArray(orderIds.orders)) {
        idsArray = orderIds.orders.map((id: any) => Number(id));
      } else {
        idsArray = [];
      }

      setIds(idsArray);

      const results = await Promise.all(
        idsArray.map(async (id) => {
          const order = await getOrderById(id.toString());
          return order.addressDetails.address;
        })
      );

      setLocations(results);
    } catch (error) {
      console.error("Failed to parse order IDs or fetch addresses", error);
    }
  }*/

  useEffect(() => {
    const fetchPreviousRoute = async () => {
        try {
        
        const routeId = await SecureStore.getItemAsync('routeId');
        console.log(routeId);
        if (!routeId) throw new Error('No previous route ID found');

        const response = await apiGetRoute(Number(routeId));
        if (!response.ok) throw new Error(`Error fetching route: ${response.statusText}`);

        const data = await response.json();
        console.log('Previous route data:', data);
        } catch (error) {
        console.error('Error fetching previous route:', error);
        }
    };

    fetchPreviousRoute();
    }, []);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height }}
        region={region}
        key={JSON.stringify(region)}
        showsUserLocation
      >
        {route.length > 0 && (
          <Polyline
            coordinates={route}
            strokeColor="#0000FF"
            strokeWidth={4}
            lineDashPattern={[3, 3]}
          />
        )}
        {waypoints.map((point, index) => (
            <Marker
                key={index}
                coordinate={point}
                title={point.address}
                description={`${
                index === 0
                    ? "Start of route"
                    : index === waypoints.length - 1
                    ? "End of route"
                    : `Stop ${index}`
                } · ETA: ${point.duration || "Unknown ETA"}`}
                pinColor={
                index === 0 || index === 1 ? "orange" : index === 2 ? "red" : "blue"
                }
            />
        ))}
      </MapView>
    </View>
  );
}
