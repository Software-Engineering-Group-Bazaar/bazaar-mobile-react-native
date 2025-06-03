import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions,
  SafeAreaView, Platform
 } from 'react-native';
import { useRouter } from 'expo-router';
import StoreItem from 'proba-package/store-item/index';
// Import AdItem component and types from the new file
// Import both AdData and Advertisement types as they are used here
import AdItem, { AdData, Advertisement } from 'proba-package/ad-item/index';
import { t } from 'i18next';
import * as SecureStore from 'expo-secure-store';
import Tooltip from 'react-native-walkthrough-tooltip';
import { Ionicons } from '@expo/vector-icons';

import Constants from 'expo-constants';

const baseURL = Constants.expoConfig!.extra!.apiBaseUrl as string;
const USE_DUMMY_DATA = Constants.expoConfig!.extra!.useDummyData as boolean;



// --- API Response Types ---
// These types describe the structure of the raw response from the API
interface ApiAdvertisementResult {
    advertisment: Advertisement; // Use the imported Advertisement type
    featureVec: number[]; // Feature vector comes at this level
}

interface AdApiResponseItem {
    result: ApiAdvertisementResult | null;
    id: number; // ID of the task/operation for this ad item
    exception: any | null;
    status: number;
    isCanceled: boolean;
    isCompleted: boolean;
    isCompletedSuccessfully: boolean; // Indicates if the operation for THIS ad succeeded
    creationOptions: number;
    asyncState: any | null;
    isFaulted: boolean; // Indicates if an exception occurred for THIS ad item
}

// The overall API response is an array of these items
type AdApiResponse = AdApiResponseItem[];


// --- Processed Ad Type for State ---
// This type describes how we store the relevant ad data in our state
interface ProcessedAd {
    advertisement: Advertisement; // The advertisement details
    featureVec: number[]; // The associated feature vector
}


// --- Store specific Type (already exists) ---
interface Store {
  id: number;
  name: string;
  address: string;
  description?: string;
  isActive: boolean;
  categoryid: number;
  logoUrl?: string;
}

// --- Combined data type for FlatList ---
// FlatList will render items that are either a Store or a ProcessedAd
type CombinedDataItem =
  | { type: 'store'; data: Store }
  | { type: 'ad'; data: ProcessedAd }; // Store the ProcessedAd object

// --- Dummy Data (updated to match new structure and ProcessedAd) ---
const DUMMY_STORES: Store[] = [
  { id: 1, isActive: true, categoryid: 101, name: 'Supermarket A', address: 'Glavna ulica 10, Sarajevo', description: 'Veliki izbor prehrambenih proizvoda', logoUrl: 'https://via.placeholder.com/150/FFC107/000000?Text=LogoA' },
  { id: 2, isActive: false, categoryid: 202, name: 'Elektronika Centar', address: 'Sporedna ulica 5, Tuzla', description: 'Najnovija elektronika po povoljnim cijenama', logoUrl: 'https://via.placeholder.com/150/2196F3/FFFFFF?Text=LogoE' },
  { id: 3, isActive: true, categoryid: 101, name: 'Modna Kuća X', address: 'Centar bb, Mostar', description: 'Trendy odjeća za sve prilike', logoUrl: 'https://via.placeholder.com/150/4CAF50/FFFFFF?Text=LogoM' },
  { id: 4, isActive: true, categoryid: 303, name: 'Knjižara Z', address: 'Pored rijeke 15, Banja Luka', description: 'Širok asortiman knjiga i uredskog materijala', logoUrl: 'https://via.placeholder.com/150/9C27B0/FFFFFF?Text=LogoK' },
  { id: 5, isActive: true, categoryid: 101, name: 'Pekara Mlin', address: 'Novo Sarajevo 1', description: 'Svježi kruh i peciva', logoUrl: 'https://via.placeholder.com/150/FF9800/FFFFFF?Text=LogoP' },
  { id: 6, isActive: false, categoryid: 202, name: 'Tehno Shop', address: 'Stari Grad 5', description: 'Bijela tehnika i mali kućanski aparati', logoUrl: 'https://via.placeholder.com/150/607D8B/FFFFFF?Text=LogoT' },
];

// --- Dummy Ad Data (updated to match new structure and ProcessedAd) ---
const DUMMY_ADS_RESPONSE: AdApiResponse = [
    { // Successful ad item with data and featureVec
        result: {
            advertisment: { // Matches Advertisement interface
                "id": 101,
                "sellerId": "seller1-dummy-id",
                "views": 100, "viewPrice": 0.05, "clicks": 10, "clickPrice": 0.50, "conversions": 1, "conversionPrice": 5.0,
                "adType": "banner", "triggers": ["food", "supermarket"], "startTime": "2024-01-01T00:00:00Z", "endTime": "2025-12-31T23:59:59Z",
                "isActive": true,
                "adData": [ // Matches AdData interface
                    { "id": 201, "imageUrl": "https://via.placeholder.com/600x150/FF5733/FFFFFF?Text=Promocija+hrane", "storeId": 1, "productId": 1001, "description": "Provjerite naše dnevne popuste na hranu!" } // Added productId
                ]
            },
            featureVec: [1, 0, 0, 0.5, 1] // Example feature vector
        },
        id: 1, status: 5, isCompletedSuccessfully: true, exception: null, isCanceled: false, isCompleted: true, isFaulted: false, creationOptions: 0, asyncState: null
    },
     { // Successful ad item with data and featureVec
        result: {
            advertisment: { // Matches Advertisement interface
                "id": 102,
                "sellerId": "seller2-dummy-id",
                "views": 50, "viewPrice": 0.05, "clicks": 5, "clickPrice": 0.75, "conversions": 0, "conversionPrice": 0,
                "adType": "banner", "triggers": ["electronics"], "startTime": "2024-01-01T00:00:00Z", "endTime": "2025-12-31T23:59:59Z",
                "isActive": true,
                "adData": [ // Matches AdData interface
                    { "id": 202, "imageUrl": "https://via.placeholder.com/600x150/3399FF/FFFFFF?Text=Nova+elektronika", "storeId": 2, "productId": 2002, "description": "Najnoviji gadgeti stigli!" } // Added productId
                ]
            },
            featureVec: [0, 1, 0, 0.7, 0] // Example feature vector
        },
         id: 2, status: 5, isCompletedSuccessfully: true, exception: null, isCanceled: false, isCompleted: true, isFaulted: false, creationOptions: 0, asyncState: null
    },
    { // Successful ad item, but with EMPTY adData array (will be filtered out)
        result: {
            advertisment: { // Matches Advertisement interface
                "id": 103,
                "sellerId": "seller3-dummy-id",
                "views": 20, "viewPrice": 0.05, "clicks": 2, "clickPrice": 0.20, "conversions": 0, "conversionPrice": 0,
                "adType": "banner", "triggers": ["fashion"], "startTime": "2024-01-01T00:00:00Z", "endTime": "2025-12-31T23:59:59Z",
                "isActive": true,
                "adData": [] // Empty adData as per your example
            },
            featureVec: [0, 0, 1, 0.3, 1] // Example feature vector
        },
         id: 3, status: 5, isCompletedSuccessfully: true, exception: null, isCanceled: false, isCompleted: true, isFaulted: false, creationOptions: 0, asyncState: null
    },
     { // A failed ad item (will be filtered out)
        result: null,
         id: 4, status: 4, isCompletedSuccessfully: false, exception: { message: "Simulated error" }, isCanceled: false, isCompleted: true, isFaulted: true, creationOptions: 0, asyncState: null
    }
];


const StoresScreen = () => {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  // ads state now stores ProcessedAd objects
  const [ads, setAds] = useState<ProcessedAd[]>([]);
  const [loading, setLoading] = useState(true); // Main loading for stores
  const [adsLoading, setAdsLoading] = useState(true); // Loading state for ads
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  //za walkthrough
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);
  const searchInputRef = useRef(null);
  const flatListRef = useRef<FlatList<Store>>(null)

  const startWalkthrough = () => {
  setShowWalkthrough(true);
  setWalkthroughStep(1); // Počni od prvog koraka (Search input)
  };

  const goToNextStep = () => {
    if (walkthroughStep === 1) { // Trenutno objašnjavamo pretragu
        if (stores.length > 0) { // Provjeri da li lista ima elemenata
            setWalkthroughStep(2); // Ako ima, pređi na korak 2 (prvi element liste)
        } else {
            finishWalkthrough(); // Ako nema, završi walkthrough
        }
    } else {
        finishWalkthrough(); // Završi ako smo na nekom drugom, nepredviđenom koraku
    }
  };

  const goToPreviousStep = () => {
   setWalkthroughStep(prevStep => prevStep - 1);
  };

  const finishWalkthrough = () => {
   setShowWalkthrough(false);
   setWalkthroughStep(0); // Resetuj korak
  };

  // Effect for fetching Stores (existing logic)
  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true); // Start loading stores
      setError(null); // Clear store specific error

      if (USE_DUMMY_DATA) {
        const filtered = DUMMY_STORES.filter(store =>
          store.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setStores(filtered);
        setLoading(false);
        return;
      }

      try {
        const authToken = await SecureStore.getItemAsync('auth_token');
        if (!authToken) {
           console.error('Authentication token not found for stores.');
           setError(new Error('Authentication required to fetch stores.'));
           setLoading(false);
           return;
        }

        const endpoint = baseURL + `/api/Stores/search?query=${encodeURIComponent(searchQuery)}`;

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody}`);
        }

        const data: Store[] = await response.json();
        setStores(data);
      } catch (e: any) {
        console.error("Error fetching stores:", e);
        setError(e instanceof Error ? e : new Error('An unknown error occurred while fetching stores.'));
      } finally {
        setLoading(false); // End loading stores
      }
    };

    // Debounce search & fetch stores
    const debounceFetch = setTimeout(() => {
      fetchStores();
    }, 500);

    return () => clearTimeout(debounceFetch);

  }, [searchQuery]); // Re-run when searchQuery changes

  // Effect for fetching Ads (UPDATED logic for new API structure and ProcessedAd)
  useEffect(() => {
    const fetchAds = async () => {
        setAdsLoading(true); // Start loading ads
        if (USE_DUMMY_DATA) {
             // Simulate network delay
            setTimeout(() => {
                 // Filter dummy data to simulate successful ads with data
                 const processedDummyAds: ProcessedAd[] = DUMMY_ADS_RESPONSE
                     .filter(item =>
                         // Keep items that successfully completed and have a result with both advertisement and featureVec
                         item.isCompletedSuccessfully && item.result && item.result.advertisment && item.result.featureVec
                     )
                     .map(item => ({ // Map to ProcessedAd structure
                          advertisement: item.result!.advertisment,
                          featureVec: item.result!.featureVec
                     }))
                     .filter(processedAd =>
                         // Keep ProcessedAds that are active AND have at least one item in adData for display
                         processedAd.advertisement.isActive &&
                         processedAd.advertisement.adData &&
                         processedAd.advertisement.adData.length > 0 &&
                         processedAd.advertisement.adData[0].productId // Also ensure productId exists for navigation
                     );

                 setAds(processedDummyAds);
                 setAdsLoading(false);
            }, 300); // Simulate a short load time
            return;
        }

        try {
            const authToken = await SecureStore.getItemAsync('auth_token');
             if (!authToken) {
                console.warn('Authentication token not found for ads. Attempting fetch without token.');
                // Decide if you want to return here or attempt fetch without token
                // For now, let's proceed to attempt fetch
            }

            const endpoint = baseURL + '/api/Ads/ads'; // Ad API endpoint

            const response = await fetch(endpoint, {
                method: 'GET',
                 headers: {
                    // Only add Authorization header if token exists
                    ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
                    'Content-Type': 'application/json'
                 }
            });

            if (!response.ok) {
                 console.error(`HTTP error fetching ads! status: ${response.status}`);
                 setAds([]); // Clear any previous ads on HTTP error
                 // Don't set main screen error, just log it.
            } else {
                const data: AdApiResponse = await response.json();
                console.log("Fetched ad raw response:", data); // Log raw response for debugging

                // Process the data: filter for successful items with result & featureVec,
                // map to ProcessedAd, and filter for active ads with display data (adData array is not empty and has productId)
                const validAds: ProcessedAd[] = data
                    .filter(item =>
                         // Keep items that successfully completed and have a result with both advertisement and featureVec
                         item.isCompletedSuccessfully && item.result && item.result.advertisment && item.result.featureVec
                    )
                    .map(item => ({ // Map to ProcessedAd structure
                          advertisement: item.result!.advertisment,
                          featureVec: item.result!.featureVec
                    }))
                    .filter(processedAd =>
                         // Keep ProcessedAds that are active AND have at least one item in adData for display
                         processedAd.advertisement.isActive &&
                         processedAd.advertisement.adData &&
                         processedAd.advertisement.adData.length > 0 &&
                         processedAd.advertisement.adData[0].productId // Also ensure productId exists for navigation
                    );

                console.log("Processed valid ads:", validAds); // Log processed ads

                setAds(validAds);
            }
        } catch (e: any) {
            console.error("Error fetching ads:", e);
            setAds([]); // Clear ads on error
        } finally {
            setAdsLoading(false); // End loading ads
        }
    };

    // Fetch ads once when the component mounts
    fetchAds();
  }, []); // Empty dependency array means this runs once on mount

  const handleStorePress = (store: Store) => {
    router.push(`/stores/${store.id}`);
  };

  // Handle Ad press - this function now receives the ProcessedAd object
  const handleAdPress = async (processedAd: ProcessedAd) => {
    console.log("Ad container clicked:", processedAd.advertisement.id);

    const ad = processedAd.advertisement;
    const firstAdData = ad.adData && ad.adData.length > 0 ? ad.adData[0] : null;

    if (!firstAdData || !firstAdData.productId) {
        console.warn("Clicked ad has no valid adData[0] or productId for navigation.", ad.id);
        // Decide if you want to do nothing or navigate elsewhere
        return;
    }

    // API calls for CLICK tracking are done here in StoresScreen (as per previous logic)
    // Conversion tracking will be done in ProductDetailsScreen

    const authToken = await SecureStore.getItemAsync('auth_token');

    // --- Call /api/Ads/clicks/{id} --- (This part remains in StoresScreen for click tracking)
    if (authToken) {
         fetch(baseURL + `/api/Ads/clicks/${ad.id}`, {
             method: 'POST',
             headers: {
                  'Authorization': `Bearer ${authToken}`,
                 'Content-Type': 'application/json' // Even if empty body, often good practice to send JSON header
             },
              body: JSON.stringify({}) // Send an empty body
         })
          .then(response => {
             if (!response.ok) {
                 console.error(`HTTP error tracking click for ad ${ad.id}! status: ${response.status}`);
             } else {
                 console.log(`Click tracking successful for ad ${ad.id}`);
             }
         })
         .catch(error => {
             console.error(`Error tracking click for ad ${ad.id}:`, error);
         });

         // --- Call /api/Ads/reward for CLICK --- (This part also remains here for click-based reward)
         // This call happens upon *clicking* the ad, not necessarily a conversion
          fetch(baseURL + '/api/Ads/reward', {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${authToken}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  featureVec: processedAd.featureVec, // Use the featureVec from the processed object
                  reward: ad.clickPrice // Use the clickPrice for the reward value
              })
          })
         .then(response => {
             if (!response.ok) {
                 console.error(`HTTP error tracking CLICK reward for ad ${ad.id}! status: ${response.status}`);
             } else {
                 console.log(`CLICK reward tracking successful for ad ${ad.id}`);
             }
         })
         .catch(error => {
             console.error(`Error tracking CLICK reward for ad ${ad.id}:`, error);
         });

    } else {
        console.warn("Auth token not found, skipping ad click/reward tracking API calls.");
    }


    // --- Navigate to Product Details Screen, passing ad context ---
    const navigationPath = `/screens/ads/${firstAdData.productId}`; // Ensure this is the correct path to your ProductDetailsScreen
    console.log(`Navigating to ${navigationPath} from ad click`);

    // Pass the necessary ad details as params
    router.push({
       pathname: navigationPath as any,
       params: {
           productId: firstAdData.productId, // This is the dynamic segment
           adId: ad.id, // Pass the ad ID
           featureVec: JSON.stringify(processedAd.featureVec), // Pass featureVec as a string
           conversionPrice: ad.conversionPrice, // Pass conversionPrice
       }
    });
};


  // Show main loader if stores are loading and no combined data exists yet
  if (loading && stores.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4e8d7c" />
         <Text style={{ marginTop: 10, color: '#555' }}>{t('loading_stores')}</Text>
      </View>
    );
  }

   // Show error if stores failed to load and no combined data exists
  if (error && stores.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{t('fetch-error')}: {error.message}</Text>
      </View>
    );
  }

const renderAdsHeader = () => {
  if (ads.length === 0) {
    return null; 
  }
  return (
    <View style={styles.adsHeaderContainer}>
      <FlatList
        data={ads}
        keyExtractor={(item) => `ad-${item.advertisement.id}`}
        renderItem={({ item }) => {
          const processedAd = item;
          const ad = processedAd.advertisement;
          const firstAdData = ad.adData && ad.adData.length > 0 ? ad.adData[0] : null;

          if (!firstAdData || !firstAdData.productId) {
            console.warn("Ad item in ads list has no adData[0] or productId, skipping render:", ad.id);
            return null;
          }

          return (
            <View style={styles.adItemContainer}>
              <AdItem
                adData={firstAdData}
                ad={ad}
                onPress={() => handleAdPress(processedAd)}
              />
            </View>
          );
        }}
        horizontal // Reklame se redaju vodoravno
        showsHorizontalScrollIndicator={false} 
        pagingEnabled={true}
      />
    </View>
  );
};

  return (
    <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.headerContainer}>
            {/* Lijeva strana - prazna ili za back dugme */}
            <View style={styles.sideContainer} /> 
            
            {/* Naslov headera */}
            <View style={styles.titleContainer}>
              <Text style={styles.headerText} numberOfLines={1} ellipsizeMode="tail">
                {t('stores')}
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
                          isVisible={showWalkthrough && walkthroughStep===2}
                          content={
                            <View style={styles.tooltipContent}>
                              <Text style={{ fontSize: 16, marginBottom: 10 }}>
                                {t('tutorial_first_store_description')}
                              </Text>
                              <View style={styles.tooltipButtonContainer}>
                                  <TouchableOpacity style={[styles.tooltipButtonBase, styles.tooltipPrevButton]} onPress={goToPreviousStep}>
                                    <Text style={styles.tooltipButtonText}>{t('previous')}</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity style={[styles.tooltipButtonBase, styles.tooltipFinishButton]} onPress={finishWalkthrough}>
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
    <View style={styles.container}>
      {/* Tooltip za Search Input */}
    <Tooltip
      isVisible={showWalkthrough && walkthroughStep === 1} // Prikazuje se samo na koraku 1
      content={
        <View style={styles.tooltipContent}>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>
            {t('tutorial_search_input_stores')}
          </Text>
          <View style={styles.tooltipButtonContainer}>
            {/* Nema prethodnog dugmeta na prvom koraku */}
            <TouchableOpacity
              style={styles.tooltipNextButton}
              onPress={goToNextStep}
            >
              <Text style={styles.tooltipButtonText}>{t('next')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      }
      placement="bottom"
      onClose={finishWalkthrough} // zatvaranje ako korisnik klikne van toga
      tooltipStyle={{ width: Dimensions.get('window').width * 0.8 }}
      useReactNativeModal={true}
      arrowSize={{ width: 16, height: 8 }}
    >
      <TextInput
        style={styles.searchInput}
        placeholder={t('search-stores')}
        value={searchQuery}
        onChangeText={setSearchQuery}
        clearButtonMode="while-editing"
        ref={searchInputRef}
      />
      </Tooltip>

      {stores.length === 0 && !loading && !adsLoading && (
        <Text style={styles.emptyListText}>
          {t('no_results_found')}
        </Text>
      )}

      <FlatList ref={flatListRef}
        data={stores}
        keyExtractor={(item) => `store-${item.id}`}
            renderItem={({ item}) => {
              return (
                <View style={styles.gridItem}>
                    <StoreItem store={item} onPress={handleStorePress} />
                </View>
              );
            }}
            numColumns={2}
            columnWrapperStyle={styles.row}
            ListHeaderComponent={renderAdsHeader} //reklame kao zaglavlje
            ListFooterComponent={loading ? <ActivityIndicator size="small" color="#4e8d7c" /> : null}
        />
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  adsHeaderContainer: {
    paddingVertical: 5,
    marginBottom: 5,
  },
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
  flatListContainer: {
  flex: 1, 
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  searchInput: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    alignSelf: 'stretch'
  },
  gridItem: {
    flex: 0.5, // Takes up half the row width (for numColumns=2)
    padding: 5,
  },
  adItemContainer: {
    width: Dimensions.get('window').width - 20, // Reklama zauzima cijelu širinu ekrana minus padding sa strane
    paddingHorizontal: 5,
  },
   row: {
     // Add spacing between store items horizontally if needed
   },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#555',
  },
  // Ad styles are now in proba-package/ad-item/index.tsx
});

export default StoresScreen;