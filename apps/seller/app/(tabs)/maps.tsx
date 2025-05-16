import React, { useState, useEffect } from 'react';
import { View, Dimensions, Text, TouchableOpacity, Button, Alert } from 'react-native';
import MapView, { Polyline, Marker, LatLng, Region } from 'react-native-maps';
import RNFS from 'react-native-fs';
import polyline from '@mapbox/polyline';
import { apiFetchActiveStore } from "../api/storeApi";

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

async function getOptimalRoute(locations: string[], mode: string): Promise<any> {
  try {
    const origin = locations[0];
    const destination = locations[locations.length - 1];
    const waypoints = locations.slice(1, -1).map(loc => encodeURIComponent(loc)).join('|');

    //const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&waypoints=optimize:true|${waypoints}&mode=${mode}&key=YOUR_API`;
    //console.log("pozvana")
    //const response = await fetch(url);
    //if (!response.ok) throw new Error(`Error fetching route: ${response.statusText}`);

    //const data = await response.json();
    //if (data.status !== "OK") throw new Error(`API error: ${data.status} - ${data.error_message}`);

    //await saveDataToFile(data);
    const data = await readDataFromFile();
    return data.routes[0];
  } catch (error) {
    console.error("Error fetching optimal route:", error);
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

export default function OptimalRouteMap() {
  const [route, setRoute] = useState<Point[]>([]);
  const [region, setRegion] = useState<Regija | undefined>();
  const [waypoints, setWaypoints] = useState<Point[]>([]);
  const [mode, setMode] = useState<string>('driving'); // Default mode
  const [confirmedMode, setConfirmedMode] = useState<string>();
  const [loading, setLoading] = useState(true);

  const confirmRouteMode = async () => {
    setConfirmedMode(mode);
    try {
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

  async function fetchRoute() {
      try {
        // Startna lokacija
        const start_address = await getStore();
        if (start_address && start_address != locations[0]) {
            locations.unshift(start_address);
        } else {
            locations.unshift("Unknown Address");  
        }

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

  // Function to update the mode and fetch the route
  const updateRouteMode = (newMode: string) => {
        // Only update if the mode is actually changing
        if (newMode !== mode) {
            setMode(newMode);
            // Update the region based on the new route
            const region = getBoundingRegion(route);
            
            // Check for valid coordinates
            if (
                region &&
                !isNaN(region.latitude) &&
                !isNaN(region.longitude) &&
                !isNaN(region.latitudeDelta) &&
                !isNaN(region.longitudeDelta)
            ) {
                setRegion({ ...region });
                //fetchRoute(); // Fetch the route immediately after mode change
            } else {
                console.error("Invalid region coordinates:", region);
            }
        }
    };

    useEffect(() => {
        if (mode) {
            console.log(`Mode changed to: ${mode}`);
            fetchRoute();
        }
    }, [mode]);

  const locations = [
    'Zagrebačka 31d, Sarajevo 71000, Bosnia and Herzegovina', 
    'Zmaja od Bosne 26, Sarajevo 71000, Bosnia and Herzegovina', 
    'Kranjčevićeva 43, Sarajevo 71000, Bosnia and Herzegovina',
    'Trg heroja 3, Sarajevo 71000',
    'Braće Begić 4, Sarajevo 71000',
    'Osmana Đikića 1, Sarajevo 71000, Bosnia and Herzegovina'
  ];

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
