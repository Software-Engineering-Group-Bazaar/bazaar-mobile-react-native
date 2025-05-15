import { router } from 'expo-router';
import { push } from 'expo-router/build/global-state/routing';
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  Keyboard,
  Alert,
  Button,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const GOOGLE_API_KEY = 'AIzaSyCr2UAxBSN0eZxa5ahJKokuzJZy9Em203Q';

export default function App() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ place_id: string; description: string }[]>([]);
  const [address, setAddress] = useState('');
  const [region, setRegion] = useState({
    latitude: 43.851087,
    longitude: 18.360781,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [markerCoord, setMarkerCoord] = useState(region);
  const mapRef = useRef<MapView>(null);

  // Fetch autocomplete suggestions as the user types
  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
                  `?input=${encodeURIComponent(query)}` +
                  `&key=${GOOGLE_API_KEY}` +
                  `&types=address`;
      try {
        const res = await fetch(url);
        const json = await res.json();
        if (json.status === 'OK') {
          setSuggestions(json.predictions);
        } else {
          setSuggestions([]);
        }
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  async function fetchAddressFromCoords({ latt, longt }: { latt: number; longt: number }) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json`
      + `?latlng=${latt},${longt}`
      + `&key=${GOOGLE_API_KEY}`;
    const res = await fetch(url);
    const { results, status } = await res.json();
    if (status === 'OK' && results.length) {
      return results[0].formatted_address;
    } else {
      throw new Error('No address found');
    }
  }


  // When user selects a suggestion
  const onSelectAddress = async (placeId: any, description: any) => {
    Keyboard.dismiss();
    setQuery(description);
    setSuggestions([]);

    // Verify / geocode the selected place
    const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json` +
                   `?place_id=${placeId}` +
                   `&key=${GOOGLE_API_KEY}`;
    try {
      const res = await fetch(geoUrl);
      const json = await res.json();

      if (json.status === 'OK' && json.results.length > 0) {
        const { lat, lng } = json.results[0].geometry.location;
        const newRegion = {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(newRegion);
        setMarkerCoord({ latitude: lat, longitude: lng, latitudeDelta: region.latitudeDelta, longitudeDelta: region.longitudeDelta });
        setAddress(json.results[0].formatted_address);
        console.log('Selected address:', json.results[0].formatted_address, lat, lng);
        // animate map
        mapRef.current?.animateToRegion(newRegion, 500);
      } else {
        Alert.alert('Invalid Address', 'Could not verify that address.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to verify address.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Address Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search address..."
          value={query}
          onChangeText={setQuery}
        />
        {suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={(item: { place_id: string }) => item.place_id}
            style={styles.suggestions}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => onSelectAddress(item.place_id, item.description)}
              >
                <Text>{item.description}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        region={region}
        mapType="satellite"
        zoomEnabled
        zoomControlEnabled
        style={styles.map}
        showsCompass
      >
        <Marker
          coordinate={markerCoord}
          draggable
          onDragEnd={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setMarkerCoord({ latitude, longitude, latitudeDelta: region.latitudeDelta, longitudeDelta: region.longitudeDelta });
            setRegion({ ...region, latitude, longitude });
            fetchAddressFromCoords({ latt: latitude, longt: longitude })
              .then((address) => {
                setAddress(address);
                setQuery(address);
              })
              .catch(() => {
                Alert.alert('Error', 'Failed to fetch address from coordinates.');
              });
            console.log('Marker dragged to:', { latitude, longitude }, address);
          }}
        />
      </MapView>

      {/* Confirm button */}
      <View style={styles.confirmButton}>
        <Button
          title="Confirm Address"
          onPress={() => {
            if (!address) {
              Alert.alert('No address selected', 'Please pick or drag the marker first.');
              return;
            }
            router.push({
              pathname: '/screens/addresses/ConfirmAddressScreen',
              params: {
                address,
                lat: markerCoord.latitude,
                lng: markerCoord.longitude,
              }
            });
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    position: 'absolute',
    top: 40,
    width: '90%',
    alignSelf: 'center',
    zIndex: 10,
  },
  input: {
    height: 44,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  suggestions: {
    backgroundColor: 'white',
    maxHeight: 200,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  map: {
    flex: 1,
    marginTop: 0, // so map sits under the search box
  },
  confirmButton: {
    position: 'absolute',
    bottom: 20,
    width: '80%',
    alignSelf: 'center',
  },
});
