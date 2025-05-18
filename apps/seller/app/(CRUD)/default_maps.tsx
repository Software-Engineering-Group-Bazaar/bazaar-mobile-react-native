import React, { useState, useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import MapView, { Polyline, Marker, LatLng, Region } from 'react-native-maps';
import polyline from '@mapbox/polyline';
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
  const [optimalRoute, setOptimalRoute] = useState<any>(null);
  
  useEffect(() => {
    const fetchPreviousRoute = async () => {
        try {       
          const routeId = await SecureStore.getItemAsync('routeId');
          console.log(routeId);
          if (!routeId) throw new Error('No previous route ID found');

          const route = await apiGetRoute(Number(routeId));
          console.log("Fetched route:", route);
          setOptimalRoute(route);
        } catch (error) {
          	console.error('Error fetching previous route:', error);
        }
    };

    fetchPreviousRoute();
  }, []);

  useEffect(() => {
    if (!optimalRoute || !optimalRoute.overview_polyline) {
      console.log("Optimal route not yet loaded");
      return;
    }
    else{
      const overviewPolyline = optimalRoute?.overview_polyline?.points;
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
    }
  }, [optimalRoute]);

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
