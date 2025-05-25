import React, { useState, useEffect } from 'react';
import { View, Dimensions, Text, TouchableOpacity, Button, Alert } from 'react-native';
import MapView, { Polyline, Marker, LatLng, Region } from 'react-native-maps';
import RNFS from 'react-native-fs';
import polyline from '@mapbox/polyline';
import { apiFetchActiveStore } from "../api/storeApi";
import { useLocalSearchParams } from 'expo-router';
import { getOrderById } from '../api/orderApi'
import { apiCreateRoute } from '../api/routesApi';
import { useTranslation } from "react-i18next";

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

async function saveDataToFile(data: any) {
  try {
    const path = `${RNFS.DocumentDirectoryPath}/route.json`;
    await RNFS.writeFile(path, JSON.stringify(data), 'utf8');
    console.log('Data saved to file:', path);
  } catch (error) {
    console.error('Error saving data to file:', error);
  }
}

async function readDataFromFile(filename = 'route.json') {
  const path = RNFS.DocumentDirectoryPath + '/' + filename;
  try {
    const content = await RNFS.readFile(path, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to read file:', error);
    return null;
  }
}

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
  const [mode, setMode] = useState<string>('driving'); // Default mode
  const [confirmedMode, setConfirmedMode] = useState<string>();
  const [loading, setLoading] = useState(true);
  const orderIds = useLocalSearchParams();
  const [locations, setLocations] = useState<string[]>([]);
  const [ids, setIds] = useState<number[]>([]);
  const [optimalRoute, setOptimalRoute] = useState<any>(null);
  const { t } = useTranslation();

  async function getOptimalRoute(locations: string[], mode: string): Promise<any> {
    try {
      const origin = locations[0];
      const destination = locations[locations.length - 1];
      const waypoints = locations.slice(1, -1).map(loc => encodeURIComponent(loc)).join('|');
      console.log(locations);

      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&waypoints=optimize:true|${waypoints}&alternative=true&mode=${mode}&key=YOUR_API`;
      console.log("pozvana");
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Error fetching route: ${response.statusText}`);
      const data = await response.json();

      if (data.status !== "OK") throw new Error(`API error: ${data.status} - ${data.error_message}`);
      setOptimalRoute(data.routes[0]);

      await saveDataToFile(data);
      //const data = await readDataFromFile();
      return data.routes[0];
    } catch (error) {
        console.error("Error fetching optimal route:", error);
        return null;
    }
  }

  const confirmRouteMode = async () => {
    setConfirmedMode(mode);
    try {
      apiCreateRoute(ids, optimalRoute);
      Alert.alert(t('Success'), t('Route has been saved successfully!'));
    } catch (error) {
      console.error('Error sending route mode:', error);
      Alert.alert('Error', 'Failed to send the selected route mode.');
    }
  };

  async function getStore() {
    setLoading(true);
    const activeStore = await apiFetchActiveStore();
    setLoading(false);
    if(activeStore) return activeStore.address;
  }

  async function fetchAddresses(): Promise<string[]> {
    try {
      let idsStringArray: string[] = [];

      // Step 1: Parse into array of strings
      if (typeof orderIds.orders === "string") {
        try {
          const parsed = JSON.parse(orderIds.orders);
          if (Array.isArray(parsed)) {
            // Convert all elements to strings (in case they are numbers)
            idsStringArray = parsed.map((id: any) => String(id));
          }
        } catch (error) {
          console.error("Error parsing order IDs:", error);
        }
      } else if (Array.isArray(orderIds.orders)) {
        idsStringArray = orderIds.orders.map((id: any) => String(id));
      } else {
        idsStringArray = [];
      }
      // Step 2: Convert to array of numbers
      const idsNumberArray = idsStringArray.map(id => Number(id));

      // Finally, set the ids as numbers
      setIds(idsNumberArray);

      const results = await Promise.all(
        idsStringArray.map(async (id) => {
          const order = await getOrderById(id.toString());
          return order.addressDetails.address;
        })
      );

      setLocations(results);
      return results; 
    } catch (error) {
      console.error("Failed to parse order IDs or fetch addresses", error);
      return []; 
    }
  }

  async function fetchRoute() {
    try {
      const optimalRoute = await getOptimalRoute(locations, mode);
      if (!optimalRoute) return;

      const overviewPolyline = optimalRoute.overview_polyline?.points;
      if (!overviewPolyline) {
          console.error("Overview polyline missing");
          return;
      }

      // Decode polyline to get the route coordinates
      const points = polyline.decode(overviewPolyline).map(([lat, lng]) => ({
          latitude: lat,
          longitude: lng,
      }));

      const waypoints: any[] = [];
      let accumulatedTime = 0;

      waypoints.push({
          latitude: optimalRoute.legs[0].start_location.lat,
          longitude: optimalRoute.legs[0].start_location.lng,
          address: optimalRoute.legs[0].start_address,
          duration: "Start Location",
      });

      optimalRoute.legs.forEach((leg: any, index: number) => {
          accumulatedTime += leg.duration.value; // Accumulate travel time

          waypoints.push({
              latitude: leg.end_location.lat,
              longitude: leg.end_location.lng,
              address: leg.end_address,
              duration: accumulatedTime >= 3600
                  ? `${Math.floor(accumulatedTime / 3600)}h ${Math.floor((accumulatedTime % 3600) / 60)}m`
                  : `${Math.floor(accumulatedTime / 60)}min`
          });
      });

      setRoute(points);
      setWaypoints(waypoints);
      setRegion(getBoundingRegion(points));
      } catch (error) {
      console.error("Error processing route:", error);
      }
  }

  const updateRouteMode = (newMode: string) => {
    if (newMode !== mode) {
        setMode(newMode);
        const region = getBoundingRegion(route);
        
        if (
            region &&
            !isNaN(region.latitude) &&
            !isNaN(region.longitude) &&
            !isNaN(region.latitudeDelta) &&
            !isNaN(region.longitudeDelta)
        ) {
            setRegion({ ...region });
        } else {
            console.error("Invalid region coordinates:", region);
        }
    }
  };

  // Load start address and locations once on mount
  useEffect(() => {
    const loadAddresses = () => {
      getStore()
        .then(start_address => fetchAddresses()
          .then(addresses => {
            const updatedLocations = start_address && start_address !== addresses[0]
              ? [start_address, ...addresses]
              : ["Unknown Address", ...addresses];

            setLocations(updatedLocations);  // triggers the useEffect to run fetchRoute
          })
        )
        .catch(error => {
          console.error("Error loading addresses:", error);
        });
    };
    loadAddresses();
  }, []); // Run only once on mount

  useEffect(() => {
    if (locations.length > 0) {
      fetchRoute();
    }
  }, [mode]); 

  useEffect(() => {
    if (locations.length > 0) {  // or some condition to ensure locations are set
      fetchRoute();
    }
  }, [locations]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 10, backgroundColor: '#fff' }}>
        {['driving', 'walking'].map((transport) => (
            <TouchableOpacity
                key={transport}
                onPress={() => updateRouteMode(transport)}
                style={{
                    backgroundColor: mode === transport ? '#4E8D7C' : '#fff',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 5,
                }}
            >
                <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>
                    {transport.charAt(0).toUpperCase() + transport.slice(1)}
                </Text>
            </TouchableOpacity>
        ))}
    </View>
      {mode && (
        <Button title={`Confirm ${mode.charAt(0).toUpperCase() + mode.slice(1)} Route`} onPress={confirmRouteMode} color="#4E8D7C" />
      )}
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
