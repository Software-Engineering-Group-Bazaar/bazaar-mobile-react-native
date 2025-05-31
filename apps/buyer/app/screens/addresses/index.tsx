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
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { baseURL, USE_DUMMY_DATA } from 'proba-package';
import * as SecureStore from 'expo-secure-store';
import { t } from 'i18next';

interface Suggestion { place_id: string; description: string; }
interface SavedLocation {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
}

const GOOGLE_API_KEY = 'AIzaSyCr2UAxBSN0eZxa5ahJKokuzJZy9Em203Q';

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [query, setQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [address, setAddress] = useState<string>('');
  const [region, setRegion] = useState<Region>({
    latitude: 43.851087,
    longitude: 18.360781,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [markerCoord, setMarkerCoord] = useState<Region>(region);
  const [addressForRemoval, setAddressForRemoval] = useState<{id:number,address:string,latitude:number,longitude:number}>();

  // State for saved locations
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [buttonShouldRemove, setButtonShouldRemove] = useState(false);
  let buttonTitle = buttonShouldRemove ? t('remove_address') : t('confirm_address');

  // Load saved locations
  useEffect(() => {
    if (USE_DUMMY_DATA) {
      setSavedLocations([
        { id: '1', address: '123 Main St, Springfield', latitude: 43.852, longitude: 18.361 },
        { id: '2', address: '456 Elm St, Springfield', latitude: 43.853, longitude: 18.362 },
      ]);
    } else {
      const authToken = SecureStore.getItem('auth_token');
      if (!authToken) {
        console.error("No login token");
        return;
      }
      fetch(`${baseURL}/api/user-profile/address`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then((data: SavedLocation[]) => setSavedLocations(data))
        .catch(err => {
          console.error('Load saved locations error:', err);
          Alert.alert('Error', 'Could not load saved locations.');
        });
    }
  }, []);

  // Autocomplete suggestions
  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}&types=address`;
        const res = await fetch(url);
        const json = await res.json();
        setSuggestions(json.status === 'OK' ? json.predictions : []);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  async function fetchAddressFromCoords({ latt, longt }: { latt: number; longt: number }) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latt},${longt}&key=${GOOGLE_API_KEY}`;
    const res = await fetch(url);
    const { results, status } = await res.json();
    if (status === 'OK' && results.length) return results[0].formatted_address;
    throw new Error('No address found');
  }

  const onSelectAddress = async (placeId: string, description: string) => {
    Keyboard.dismiss();
    setQuery(description);
    setSuggestions([]);
    try {
      const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeId}&key=${GOOGLE_API_KEY}`;
      const res = await fetch(geoUrl);
      const json = await res.json();
      if (json.status === 'OK' && json.results.length) {
        const { lat, lng } = json.results[0].geometry.location;
        const newRegion = { latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 };
        setRegion(newRegion);
        setMarkerCoord({ ...newRegion });
        setAddress(json.results[0].formatted_address);
        mapRef.current?.animateToRegion(newRegion, 500);
      } else Alert.alert('Invalid Address', 'Could not verify that address.');
    } catch {
      Alert.alert('Error', 'Failed to verify address.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder={t('search_address')}
          value={query}
          onChangeText={setQuery}
        />
        {suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={item => item.place_id}
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

      {/* Map and Markers */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        region={region}
        mapType="standard"
        zoomEnabled
        zoomControlEnabled
        style={styles.map}
        showsCompass
      >
        {/* Current marker */}
        <Marker
          coordinate={markerCoord}
          title={'New Address (Drag to change)'}
          pinColor="darkred"
          draggable
          onDragEnd={e => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setMarkerCoord({ latitude, longitude, latitudeDelta: region.latitudeDelta, longitudeDelta: region.longitudeDelta });
            setRegion({ ...region, latitude, longitude });
            fetchAddressFromCoords({ latt: latitude, longt: longitude })
              .then(addr => { setAddress(addr); setQuery(addr); })
              .catch(() => Alert.alert('Error', 'Failed to fetch address.'));
          }}
        />

        {/* Saved location markers */}
        {savedLocations.map(loc => (
          <Marker
            key={loc.id}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            title={loc.address}
            pinColor="#4e8d70"
            onSelect={() => {
              setButtonShouldRemove(true);
              setAddressForRemoval({ id: Number(loc.id), address: loc.address, latitude: loc.latitude, longitude: loc.longitude });
              }
            }
            onDeselect={() => {
              setButtonShouldRemove(false);
              setAddressForRemoval(undefined);
            }
            }
          />
        ))}
      </MapView>

      {/* Confirm button */}
      <View style={styles.confirmButton}>
        <Button
          color="#4e8d70"
          
          title= {buttonTitle}
          onPress={() => {
            if (!address && buttonShouldRemove===false) {
              Alert.alert('No address selected', 'Please pick or drag the marker first.');
              return;
            }
            buttonShouldRemove===false
            ? router.push({ pathname: '/screens/addresses/ConfirmAddressScreen', params: { address, lat: markerCoord.latitude, lng: markerCoord.longitude } })
            : addressForRemoval
              ? router.push({ pathname: '/screens/addresses/RemoveAddressScreen', params: { id: addressForRemoval.id, address: addressForRemoval.address } })
              : Alert.alert('Error', 'No address selected for removal.');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { position: 'absolute', top: 40, width: '90%', alignSelf: 'center', zIndex: 10 },
  input: { height: 44, backgroundColor: 'white', paddingHorizontal: 12, borderRadius: 4 },
  suggestions: { backgroundColor: 'white', maxHeight: 200, borderBottomLeftRadius: 4, borderBottomRightRadius: 4 },
  suggestionItem: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  map: { flex: 1 },
  confirmButton: { position: 'absolute', bottom: 3, width: '80%', alignSelf: 'center', borderRadius: 7, padding: 16,},
});
