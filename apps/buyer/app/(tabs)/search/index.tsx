import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TextInput } from 'react-native';
import ProductItem from 'proba-package/product-item/index';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { TouchableOpacity, Modal, Button, Dimensions, ScrollView, TouchableWithoutFeedback } from 'react-native';
import Checkbox from 'expo-checkbox';
import { baseURL, USE_DUMMY_DATA } from 'proba-package';

// Import AdItem component and types from the new file
import AdItem, { AdData, Advertisement } from 'proba-package/ad-item/index'; // Import AdData and Advertisement

const screenWidth = Dimensions.get('window').width;
const buttonWidth = screenWidth * 0.3; // 30% širine ekrana

// --- Existing Types (Product, ProductCategory, Store, StoreWithProducts, Region, Place) ---
interface ProductCategory {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  productCategory: ProductCategory;
  retailPrice: number;
  wholesalePrice: number;
  weight?: number;
  weightUnit?: string;
  volume?: number;
  volumeUnit?: string;
  storeId: number;
  photos: string[];
  isActive: boolean;
  wholesaleThreshold?: number;
}

interface Store {
  id: number;
  name: string;
  address: string;
  description?: string;
  isActive: boolean;
  categoryid: number;
  logoUrl?: string;
  place: number //opcina
}

interface StoreWithProducts {
  // Store: Store; // Based on your previous comment, API returns flat structure?
  id: number; // Store ID
  name: string; // Store Name
  products: Product[]; // Products belonging to this store
}

interface Region {
  id: number;
  name: string;
  countryCode: string;
}

interface Place {
  id: number;
  name: string;
  postalCode: string;
}

// --- Ad specific Types (based on your API response structure) ---
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
// It includes everything needed for display, API calls, and navigation
interface ProcessedAd {
    advertisement: Advertisement; // The advertisement details (includes adData, clickPrice, conversionPrice)
    featureVec: number[]; // The associated feature vector
}


// --- Combined data type for FlatList ---
// FlatList will render items that are either a Store group or a ProcessedAd
type CombinedDataItem =
  | { type: 'storeGroup'; data: StoreWithProducts } // Type for a group of products from one store
  | { type: 'ad'; data: ProcessedAd }; // Type for an ad item


// --- Dummy Data (updated to match new structure and ProcessedAd) ---
const DUMMY_PRODUCTS: Product[] = [
  { id: 101, name: 'Mlijeko 1L', productCategory: { id: 1, name: 'Mliječni proizvodi' }, retailPrice: 2.50, wholesalePrice: 2.20, storeId: 1, photos: ['https://via.placeholder.com/300/ADD8E6/000000?Text=Mlijeko'], isActive: true, wholesaleThreshold: 10 },
  { id: 102, name: 'Hljeb', productCategory: { id: 2, name: 'Pekarski proizvodi' }, retailPrice: 1.20, wholesalePrice: 1.00, storeId: 1, photos: ['https://via.placeholder.com/300/F0E68C/000000?Text=Hljeb'], isActive: true },
  { id: 103, name: 'Jabuke 1kg', productCategory: { id: 3, name: 'Voće' }, retailPrice: 1.80, wholesalePrice: 1.50, weight: 1, weightUnit: 'kg', storeId: 1, photos: ['https://via.placeholder.com/300/90EE90/000000?Text=Jabuke'], isActive: true, wholesaleThreshold: 50 },
  { id: 104, name: 'Banane 1kg', productCategory: { id: 3, name: 'Voće' }, retailPrice: 2.00, wholesalePrice: 1.70, weight: 1, weightUnit: 'kg', storeId: 1, photos: ['https://via.placeholder.com/300/FFFF00/000000?Text=Banane'], isActive: false },
  { id: 105, name: 'Kruh pšenični', productCategory: { id: 2, name: 'Pekarski proizvodi' }, retailPrice: 1.50, wholesalePrice: 1.30, storeId: 2, photos: ['https://via.placeholder.com/300/F0E68C/000000?Text=Kruh'], isActive: true, wholesaleThreshold: 20 },
  { id: 106, name: 'Jogurt 500g', productCategory: { id: 1, name: 'Mliječni proizvodi' }, retailPrice: 1.10, wholesalePrice: 0.90, weight: 500, weightUnit: 'g', storeId: 2, photos: ['https://via.placeholder.com/300/ADD8E6/000000?Text=Jogurt'], isActive: true },
  { id: 107, name: 'Apple iPhone 13', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 999, wholesalePrice: 950, storeId: 4, photos: ['https://via.placeholder.com/300/87CEEB/FFFFFF?Text=Iphone'], isActive: true, wholesaleThreshold: 5 },
  { id: 108, name: 'Samsung Galaxy S21', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 950, wholesalePrice: 900, storeId: 4, photos: ['https://via.placeholder.com/300/87CEEB/FFFFFF?Text=Samsung'], isActive: true },
  { id: 109, name: 'Slušalice Bose', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 200, wholesalePrice: 180, storeId: 4, photos: ['https://via.placeholder.com/300/D3D3D3/000000?Text=Slušalice'], isActive: true, wholesaleThreshold: 15 },
  { id: 110, name: 'Dell Monitor 24" Full HD', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 300, wholesalePrice: 280, storeId: 4, photos: ['https://via.placeholder.com/300/87CEEB/FFFFFF?Text=Monitor'], isActive: true },
  { id: 111, name: 'Čaj Zeleni', productCategory: { id: 5, name: 'Pića' }, retailPrice: 3.00, wholesalePrice: 2.50, storeId: 2, photos: ['https://via.placeholder.com/300/32CD32/000000?Text=Čaj'], isActive: true, wholesaleThreshold: 100 },
  { id: 112, name: 'Kafa Moka', productCategory: { id: 5, name: 'Pića' }, retailPrice: 5.50, wholesalePrice: 5.00, storeId: 3, photos: ['https://via.placeholder.com/300/D2691E/000000?Text=Kafa'], isActive: true },
  { id: 113, name: 'Vino Cabernet Sauvignon', productCategory: { id: 6, name: 'Alkoholna pića' }, retailPrice: 15.00, wholesalePrice: 13.00, storeId: 5, photos: ['https://via.placeholder.com/300/8B0000/FFFFFF?Text=Vino'], isActive: true, wholesaleThreshold: 30 },
  { id: 114, name: 'Pivo Heineken', productCategory: { id: 6, name: 'Alkoholna pića' }, retailPrice: 1.80, wholesalePrice: 1.50, storeId: 5, photos: ['https://via.placeholder.com/300/00FF00/FFFFFF?Text=Pivo'], isActive: true },
  { id: 115, name: 'Računarski miš Logitech', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 25.00, wholesalePrice: 22.00, storeId: 5, photos: ['https://via.placeholder.com/300/D3D3D3/000000?Text=Miš'], isActive: true, wholesaleThreshold: 25 },
  { id: 116, name: 'Gaming Monitor 27"', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 400, wholesalePrice: 380, storeId: 4, photos: ['https://via.placeholder.com/300/87CEEB/FFFFFF?Text=Gaming+Monitor'], isActive: true },
  { id: 117, name: 'LED TV 40"', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 350, wholesalePrice: 330, storeId: 4, photos: ['https://via.placeholder.com/300/87CEEB/FFFFFF?Text=TV'], isActive: true, wholesaleThreshold: 10 },
  { id: 118, name: 'Knjiga "The Great Gatsby"', productCategory: { id: 7, name: 'Knjige' }, retailPrice: 15.00, wholesalePrice: 12.00, storeId: 1, photos: ['https://via.placeholder.com/300/FF6347/FFFFFF?Text=Knjiga'], isActive: true },
  { id: 119, name: 'Knjiga "1984"', productCategory: { id: 7, name: 'Knjige' }, retailPrice: 10.00, wholesalePrice: 8.00, storeId: 4, photos: ['https://via.placeholder.com/300/FF6347/FFFFFF?Text=Knjiga'], isActive: true, wholesaleThreshold: 50 },
];

// Mock data for StoreWithProducts based on DUMMY_PRODUCTS
const DUMMY_STORES_WITH_PRODUCTS: StoreWithProducts[] = [
    { id: 1, name: 'Supermarket A', products: DUMMY_PRODUCTS.filter(p => p.storeId === 1) },
    { id: 2, name: 'Elektronika Centar', products: DUMMY_PRODUCTS.filter(p => p.storeId === 2) },
    { id: 3, name: 'Modna Kuća X', products: DUMMY_PRODUCTS.filter(p => p.storeId === 3) },
    { id: 4, name: 'Knjižara Z', products: DUMMY_PRODUCTS.filter(p => p.storeId === 4) },
    { id: 5, name: 'Pekara Mlin', products: DUMMY_PRODUCTS.filter(p => p.storeId === 5) },
];


const DUMMY_REGIONS: Region[] = [
  { id: 1, name: 'Sarajevski kanton', countryCode: 'BA' },
  { id: 2, name: 'Tuzlanski kanton', countryCode: 'BA' },
  { id: 3, name: 'Republika Srpska', countryCode: 'BA' }
];

const DUMMY_MUNICIPALITIES: Place[] = [
  { id: 1, name: 'Sarajevo Centar', postalCode: '71000' }, // Assume these are in region 1
  { id: 2, name: 'Sarajevo Novi Grad', postalCode: '71000' }, // Assume these are in region 1
  { id: 3, name: 'Tuzla', postalCode: '75000' }, // Assume these are in region 2
  { id: 4, name: 'Lukavac', postalCode: '75300' }, // Assume these are in region 2
  { id: 5, name: 'Banja Luka', postalCode: '78000' }, // Assume these are in region 3
  { id: 6, name: 'Bijeljina', postalCode: '76300' } // Assume these are in region 3
];


// --- Dummy Ad Data (Matching the API response structure) ---
const DUMMY_ADS_API_RESPONSE: AdApiResponse = [
    { // Successful ad item with data and featureVec, links to product 101
        result: {
            advertisment: { // Matches Advertisement interface from ad-item
                "id": 201, // Unique ad ID
                "sellerId": "sellerA-dummy",
                "views": 500, "viewPrice": 0.03, "clicks": 50, "clickPrice": 0.30, "conversions": 5, "conversionPrice": 3.0,
                "adType": "search_promo", "triggers": ["mlijeko", "akcija"], "startTime": "2024-01-01T00:00:00Z", "endTime": "2025-12-31T23:59:59Z",
                "isActive": true,
                "adData": [ // Matches AdData interface from ad-item
                    { "id": 301, "imageUrl": "https://via.placeholder.com/600x150/FF0000/FFFFFF?Text=AKCIJA+Mlijeko", "storeId": 1, "productId": 101, "description": "Mlijeko na super akciji!" } // Linked to DUMMY_PRODUCT 101
                ]
            },
            featureVec: [0.1, 0.5, 0.2, 0.8] // Example feature vector
        },
        id: 11, status: 5, isCompletedSuccessfully: true, exception: null, isCanceled: false, isCompleted: true, isFaulted: false, creationOptions: 0, asyncState: null
    },
     { // Successful ad item with data and featureVec, links to product 107
        result: {
            advertisment: { // Matches Advertisement interface
                "id": 202, // Unique ad ID
                "sellerId": "sellerB-dummy",
                "views": 300, "viewPrice": 0.04, "clicks": 30, "clickPrice": 0.40, "conversions": 2, "conversionPrice": 4.5,
                "adType": "search_promo", "triggers": ["iphone", "elektronika"], "startTime": "2024-01-01T00:00:00Z", "endTime": "2025-12-31T23:59:59Z",
                "isActive": true,
                "adData": [ // Matches AdData interface
                    { "id": 302, "imageUrl": "https://via.placeholder.com/600x150/0000FF/FFFFFF?Text=Najnoviji+iPhone", "storeId": 4, "productId": 107, "description": "Kupi novi iPhone sada!" } // Linked to DUMMY_PRODUCT 107
                ]
            },
            featureVec: [0.9, 0.1, 0.7, 0.2] // Example feature vector
        },
         id: 12, status: 5, isCompletedSuccessfully: true, exception: null, isCanceled: false, isCompleted: true, isFaulted: false, creationOptions: 0, asyncState: null
    },
    { // Successful ad item, but with EMPTY adData array (will be filtered out)
        result: {
            advertisment: {
                "id": 203,
                "sellerId": "sellerC-dummy",
                "views": 100, "viewPrice": 0.05, "clicks": 10, "clickPrice": 0.50, "conversions": 0, "conversionPrice": 0,
                "adType": "search_promo", "triggers": ["moda"], "startTime": "2024-01-01T00:00:00Z", "endTime": "2025-12-31T23:59:59Z",
                "isActive": true,
                "adData": [] // Empty adData
            },
            featureVec: [0.3, 0.3, 0.3, 0.3]
        },
         id: 13, status: 5, isCompletedSuccessfully: true, exception: null, isCanceled: false, isCompleted: true, isFaulted: false, creationOptions: 0, asyncState: null
    },
     { // A failed ad item (will be filtered out)
        result: null,
         id: 14, status: 4, isCompletedSuccessfully: false, exception: { message: "Simulated ad fetch error" }, isCanceled: false, isCompleted: true, isFaulted: true, creationOptions: 0, asyncState: null
    }
];


const SearchProductsScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [storesWithProducts, setStoresWithProducts] = useState<StoreWithProducts[]>([]);
  const [ads, setAds] = useState<ProcessedAd[]>([]); // State for ads (using ProcessedAd type)
  const [loading, setLoading] = useState(true); // Main loading for products/stores
  const [adsLoading, setAdsLoading] = useState(true); // Loading state for ads
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  //za filtriranje
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [regions, setRegions] = useState<Region[]>([]); // Fetch real regions
  const [municipalities, setMunicipalities] = useState<Place[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const [selectedMunicipalities, setSelectedMunicipalities] = useState<number[]>([]);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isRegionDropdownVisible, setIsRegionDropdownVisible] = useState(false);
  const [isCategoryDropdownVisible, setIsCategoryDropdownVisible] = useState(false);

  const openFilterModal = () => {
    setIsFilterModalVisible(true);
  };

  const closeFilterModal = () => {
    setIsFilterModalVisible(false);
  };

    // Effect for fetching Ads (NEW logic)
  useEffect(() => {
    const fetchAds = async () => {
        setAdsLoading(true); // Start loading ads
        if (USE_DUMMY_DATA) {
             // Simulate network delay
            setTimeout(() => {
                 // Filter dummy data to simulate successful ads with data and featureVec
                 const processedDummyAds: ProcessedAd[] = DUMMY_ADS_API_RESPONSE
                     .filter(item =>
                         // Keep items that successfully completed and have a result with both advertisement and featureVec
                         item.isCompletedSuccessfully && item.result?.advertisment && item.result?.featureVec
                     )
                     .map(item => ({ // Map to ProcessedAd structure
                          advertisement: item.result!.advertisment,
                          featureVec: item.result!.featureVec
                     }))
                     .filter(processedAd =>
                         // === Stronger Filter for needed data ===
                         processedAd.advertisement.isActive &&
                         typeof processedAd.advertisement.id === 'number' && processedAd.advertisement.id > 0 && // Check ad.id is a positive number
                         typeof processedAd.advertisement.clickPrice === 'number' && // Check clickPrice
                         typeof processedAd.advertisement.conversionPrice === 'number' && // Check conversionPrice
                         processedAd.advertisement.adData &&
                         processedAd.advertisement.adData.length > 0 &&
                         typeof processedAd.advertisement.adData[0].productId === 'number' && processedAd.advertisement.adData[0].productId > 0 // Check productId is a positive number on first adData item
                         // === End Stronger Filter ===
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
                 setAdsLoading(false); // Stop loading ads immediately if no token and auth is required
                 // return; // Removed return, allowing fetch without auth if backend allows
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
                         item.isCompletedSuccessfully && item.result?.advertisment && item.result?.featureVec
                    )
                    .map(item => ({ // Map to ProcessedAd structure
                          advertisement: item.result!.advertisment,
                          featureVec: item.result!.featureVec
                    }))
                    .filter(processedAd =>
                         // === Stronger Filter for needed data ===
                         processedAd.advertisement.isActive &&
                         typeof processedAd.advertisement.id === 'number' && processedAd.advertisement.id > 0 && // Check ad.id is a positive number
                         typeof processedAd.advertisement.clickPrice === 'number' && // Check clickPrice
                         typeof processedAd.advertisement.conversionPrice === 'number' && // Check conversionPrice
                         processedAd.advertisement.adData &&
                         processedAd.advertisement.adData.length > 0 &&
                         typeof processedAd.featureVec !== undefined && Array.isArray(processedAd.featureVec) && // Check featureVec is an array
                         processedAd.advertisement.adData[0].productId !== undefined && // Ensure productId exists on first adData
                         processedAd.advertisement.adData[0].productId !== null &&
                         typeof processedAd.advertisement.adData[0].productId === 'number' && processedAd.advertisement.adData[0].productId > 0 // Check productId is a positive number
                         // === End Stronger Filter ===
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


  // Effect for fetching Initial Data (Categories, Regions) - existing logic
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true); // Still use main loading for initial data

      if (USE_DUMMY_DATA) {
        const dummyCategories = DUMMY_PRODUCTS.reduce((acc: ProductCategory[], product) => {
          if (!acc.find(cat => cat.id === product.productCategory.id)) {
            acc.push(product.productCategory);
          }
          return acc;
        }, []);
        setCategories(dummyCategories);
        setRegions(DUMMY_REGIONS); // Use dummy regions
        setLoading(false);
        return;
      }

      setError(null);

      try {
        const authToken = await SecureStore.getItemAsync('auth_token');
        if (!authToken) {
          console.error('Authentication token not found for initial data.');
           // Decide if you want to show an error or proceed without auth
           // For now, let's throw to be consistent with previous behavior
          throw new Error('Authentication token not found.');
        }

        //dohvacanje kategorija
        const categoriesResponse = await fetch(baseURL + '/api/Catalog/categories', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });
        if (!categoriesResponse.ok) {
          const errorBody = await categoriesResponse.text();
          throw new Error(`HTTP error fetching categories! status: ${categoriesResponse.status}, message: ${errorBody}`);
        }
        const categoriesData: ProductCategory[] = await categoriesResponse.json();
        setCategories(categoriesData);

        // dohvacanje regija
        const regionsResponse = await fetch(baseURL + '/api/Geography/regions', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });
        if (!regionsResponse.ok) {
          const errorBody = await regionsResponse.text();
          throw new Error(`HTTP error fetching regions! status: ${regionsResponse.status}, message: ${errorBody}`);
        }
        const regionsData: Region[] = await regionsResponse.json();
        setRegions(regionsData);

        setLoading(false); // Stop main loading after initial data
      } catch (e: any) {
        console.error("Error fetching initial data:", e);
        setError(e instanceof Error ? e : new Error('An unknown error occurred while fetching initial data'));
        setLoading(false);
      }
    };

    fetchInitialData();
     // Dependencies: baseURL, USE_DUMMY_DATA, etc. but minimal might be fine if only runs on mount
  }, [baseURL, USE_DUMMY_DATA]); // Runs once on mount

  // Effect for fetching Municipalities for Region - existing logic
  useEffect(() => {
    const fetchMunicipalitiesForRegion = (regionId: number | null) => {
      if (USE_DUMMY_DATA) {
        // In a real dummy scenario, filter municipalities by dummy region id if applicable
         const dummyMunicipalityData = selectedRegion === 1 ? DUMMY_MUNICIPALITIES.filter(m => m.id <= 2) // Sarajevo region
                                       : selectedRegion === 2 ? DUMMY_MUNICIPALITIES.filter(m => m.id > 2 && m.id <= 4) // Tuzla region
                                       : selectedRegion === 3 ? DUMMY_MUNICIPALITIES.filter(m => m.id > 4) // Banja Luka region
                                       : DUMMY_MUNICIPALITIES; // All if no region selected

        setMunicipalities(dummyMunicipalityData);
        return;
      }

      setError(null); // Clear store/product specific error
      if (regionId) {
        // API poziv za dohvat opcina
        const fetchMunicipalitiesApi = async () => {
          try {
            const authToken = await SecureStore.getItemAsync('auth_token');
            if (!authToken) {
               console.warn('Authentication token not found for municipalities.');
               setMunicipalities([]); // Cannot fetch without auth if required
               return;
            }

            const url = baseURL + `/api/Geography/region/${regionId}`;

            const municipalitiesResponse = await fetch(url, {
              headers: {
                'Authorization': `Bearer ${authToken}`,
              },
            });
            if (!municipalitiesResponse.ok) {
              const errorBody = await municipalitiesResponse.text();
              console.error(`HTTP error fetching municipalities! status: ${municipalitiesResponse.status}, message: ${errorBody}`);
              setMunicipalities([]); // Clear municipalities on error
            } else {
              const municipalitiesData: Place[] = await municipalitiesResponse.json();
              setMunicipalities(municipalitiesData);
            }
          } catch (e: any) {
            console.error("Error fetching municipalities:", e);
             // Don't set main screen error for this, just log it
            setMunicipalities([]);
          }
        };
        fetchMunicipalitiesApi();
      } else {
        setMunicipalities([]); // Clear municipalities if no region is selected
      }
      setSelectedMunicipalities([]); // reset odabranih opcina kad se mijenja regija
    };

    fetchMunicipalitiesForRegion(selectedRegion);
     // Dependencies: selectedRegion, baseURL, USE_DUMMY_DATA
  }, [selectedRegion, baseURL, USE_DUMMY_DATA]);


  // Effect for fetching Store Products (Search/Filter) - existing logic
  const fetchStoreProducts = async () => {
    console.log("Triggering fetchStoreProducts...");
    setLoading(true); // Start main loading for product search
    setError(null); // Clear previous product search error

    // Map selected IDs to names for API call
    const regionName = selectedRegion
      ? regions.find(r => r.id === selectedRegion)?.name : null;

    const categoryName = selectedCategory
      ? categories.find(c => c.id === selectedCategory)?.name : null;

    let selectedMunicipalityNames: string[] = [];
    if (municipalities && selectedMunicipalities && selectedMunicipalities.length > 0) {
      selectedMunicipalityNames = municipalities
        .filter(m => selectedMunicipalities.includes(m.id)) // Filter municipalities that are selected
        .map(m => m.name); // Map to their names
    }

    console.log(`Fetching - Reg: ${regionName}, Opc: ${selectedMunicipalityNames.join(',')}, Cat: ${categoryName}, Query: ${searchQuery || 'Nema'}`);


     if (USE_DUMMY_DATA) {
        // Simulate filtering dummy store/product data
        let filteredStores = DUMMY_STORES_WITH_PRODUCTS.map(storeWithProducts => ({
            ...storeWithProducts,
            products: storeWithProducts.products.filter(product => {
                // Filter by search query
                const matchesQuery = searchQuery
                    ? product.name.toLowerCase().includes(searchQuery.toLowerCase())
                    : true;
                // Filter by category
                const matchesCategory = selectedCategory === null || product.productCategory.id === selectedCategory;

                return matchesQuery && matchesCategory;
            }),
        }));

         // Filter by selected municipalities (dummy logic based on simple ID matching)
         // This dummy logic assumes a mapping between store.id and municipality.id or store.place
         // This is complex with current dummy data structure, let's simplify or skip complex dummy filtering
         // For demonstration, let's assume store ID might map to municipality ID or just filter stores where ANY product matches a filter
         // Skipping complex dummy geographical filtering for this example to keep it focused on ads integration.
         // In a real app, DUMMY_STORES_WITH_PRODUCTS might need 'place' property matching DUMMY_MUNICIPALITIES.id

        // Filter out stores that have no products after filtering
        filteredStores = filteredStores.filter(storeWithProducts => storeWithProducts.products.length > 0);


        // Simulate network delay
        setTimeout(() => {
             setStoresWithProducts(filteredStores);
             setLoading(false);
        }, 500);
        return;
     }


    const authToken = await SecureStore.getItemAsync('auth_token');
    if (!authToken) {
      console.error('Authentication token not found for product search.');
       setLoading(false); // Stop loading if auth is required and missing
       setError(new Error('Authentication required to search products.'));
       return;
    }

    const baseUrl = baseURL + '/api/Catalog/filter';
    const params = new URLSearchParams();

    if (regionName) {
      params.append('region', regionName);
    }

    if (selectedMunicipalityNames && selectedMunicipalityNames.length > 0) {
      selectedMunicipalityNames.forEach(municipalityName => {
        params.append('places', municipalityName); // Use 'places' parameter name as per API
      });
    }

    if (categoryName) {
      params.append('category', categoryName);
    }

    if (searchQuery) {
      params.append('query', searchQuery);
    }

    const queryString = params.toString();
    const url = `${baseUrl}${queryString ? `?${queryString}` : ''}`;

    console.log('Fetching Product Search URL:', url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error fetching products! status: ${response.status}, message: ${errorBody}`);
      }

      const data: StoreWithProducts[] = await response.json();
      console.log("Fetched product search results:", data);
      setStoresWithProducts(data);

    } catch (e: any) {
      console.error("Error fetching products:", e);
      setError(e instanceof Error ? e : new Error('An unknown error occurred while fetching products'));
    } finally {
      setLoading(false); // Stop main loading after product search
    }
  };

  // Effect to trigger product search when filters or query change (existing logic + ads dependency)
  useEffect(() => {
    // Debounce fetchStoreProducts
    const debounceFetch = setTimeout(() => {
      // Only fetch products/stores if initial data (categories/regions) has loaded
      // or if it's a dummy data scenario.
       if (!loading || USE_DUMMY_DATA) {
           fetchStoreProducts();
       } else {
           console.log("Initial data still loading, skipping product search fetch.");
       }

    }, 500); // Debounce delay

    return () => clearTimeout(debounceFetch);
    // Add relevant dependencies: search query, category, municipalities, region (indirectly via municipalities fetch)
    // Also adding 'ads' here is incorrect, ads fetch independently. Removed 'loading' as dependency trigger.
  }, [searchQuery, selectedCategory, selectedMunicipalities, baseURL, USE_DUMMY_DATA, regions, categories]); // Include things that affect API call params


  // Combine Ads and StoresWithProducts for FlatList (Ads first)
  const combinedData: CombinedDataItem[] = React.useMemo(() => {
      const data: CombinedDataItem[] = [];

      // Add all valid ProcessedAds first
      ads.forEach(processedAd => {
           // Filtering happens primarily in fetchAds now, this is an extra check
           if (processedAd.advertisement && processedAd.advertisement.adData && processedAd.advertisement.adData.length > 0 && typeof processedAd.advertisement.adData[0].productId === 'number') {
               data.push({ type: 'ad', data: processedAd });
           } else {
               console.warn("Skipping ad with incomplete data for combined list:", processedAd.advertisement?.id);
           }
      });

      // Then add all store groups
      storesWithProducts.forEach(storeGroup => {
           // Only include store groups that actually have products
           if (storeGroup.products && storeGroup.products.length > 0) {
              data.push({ type: 'storeGroup', data: storeGroup });
           }
      });

      return data;
  }, [ads, storesWithProducts]); // Recompute when ads or store products change


  // Handle Product Item Press (existing logic, updated navigation path)
  const handleProductPress = (product: Product) => {
     // Navigate to the common product details screen
    router.push(`/screens/ads/${product.id}`); // Ensure this matches the path in your ProductDetailsScreen file system
  };

  // Handle Ad Item Press (NEW logic - same as in StoresScreen)
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
       pathname: navigationPath,
       params: {
           productId: firstAdData.productId, // This is the dynamic segment
           adId: ad.id, // Pass the ad ID
           featureVec: JSON.stringify(processedAd.featureVec), // Pass featureVec as a string
           conversionPrice: ad.conversionPrice, // Pass conversionPrice
       }
    });
};


  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
     // No need to close modal here, user might want to select other filters
  };

  const resetFilters = async () => {
    setSelectedCategory(null);
    setSelectedRegion(null);
    setSelectedMunicipalities([]);
     // Don't close modal automatically, user might want to apply reset
    // setIsRegionDropdownVisible(false);
    // setIsCategoryDropdownVisible(false);
  };

  const handleMunicipalityCheckboxChange = (municipalityId: number) => {
    setSelectedMunicipalities(prev => {
      if (prev.includes(municipalityId)) {
        return prev.filter(id => id !== municipalityId);
      } else {
        return [...prev, municipalityId];
      }
    });
  };

  // Show main loader if products/stores are loading AND no combined data exists yet
  // Don't block render if only ads are loading
  // Add check for adsLoading as well to prevent showing "No Results" while ads are still fetching
  if (loading && adsLoading && combinedData.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4e8d7c" />
         <Text style={{ marginTop: 10, color: '#555' }}>{t('loading_products')}</Text> {/* Add translation */}
      </View>
    );
  }

  // Show error only if product search failed and no combined data is available
  if (error && combinedData.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{t('error_fetching_data')}: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder={t('search_products_placeholder')}
        value={searchQuery}
        onChangeText={setSearchQuery}
        clearButtonMode="while-editing"
      />

      {/* Filter Modal */}
      <Modal
          animationType="slide"
          transparent={true}
          visible={isFilterModalVisible}
          onRequestClose={closeFilterModal}
      >
          {/* Use a TouchableWithoutFeedback over the overlay to close modal */}
          <TouchableWithoutFeedback onPress={closeFilterModal}>
              <View style={styles.modalOverlay}>
                  {/* Prevent closing when tapping inside the modal container */}
                  <TouchableWithoutFeedback onPress={() => { /* Do nothing */ }}>
                      <View style={styles.modalContainer}>
                          <Text style={styles.modalTitle}>{t('filter_products')}</Text>

                          {/* Regije */}
                          {regions.length > 0 && (
                              <View style={styles.filterSection}>
                                  <Text style={styles.filterLabel}>{t('select_region')}:</Text>
                                  <TouchableOpacity
                                      style={styles.filterItem}
                                      onPress={() => setIsRegionDropdownVisible(!isRegionDropdownVisible)}
                                  >
                                      <Text style={styles.filterItemText}>
                                      {selectedRegion ? regions.find(r => r.id === selectedRegion)?.name : t('all')}
                                      </Text>
                                  </TouchableOpacity>

                                  {/* Dropdown za regije */}
                                  {isRegionDropdownVisible && (
                                      <ScrollView
                                        style={{ maxHeight: 150 }} // Limit height
                                        nestedScrollEnabled={true}
                                        contentContainerStyle={styles.dropdownContainer}
                                      >
                                        {/* Opcija: Sve regije */}
                                        <TouchableOpacity
                                          style={[
                                            styles.dropdownItem,
                                            selectedRegion === null && styles.selectedFilterItem,
                                          ]}
                                          onPress={() => {
                                            setSelectedRegion(null); // poništi selekciju
                                            setIsRegionDropdownVisible(false); // Zatvori dropdown
                                          }}
                                        >
                                          <Text
                                            style={[
                                              styles.filterItemText,
                                              selectedRegion === null && styles.selectedFilterItemText,
                                            ]}
                                          >
                                            {t('all')}
                                          </Text>
                                        </TouchableOpacity>

                                        {/* Sve ostale regije */}
                                        {regions.map((region) => (
                                          <TouchableOpacity
                                            key={`region-${region.id}`} // Unique key
                                            style={[
                                              styles.dropdownItem,
                                              selectedRegion === region.id && styles.selectedFilterItem,
                                            ]}
                                            onPress={() => {
                                              setSelectedRegion(region.id);
                                              setIsRegionDropdownVisible(false); // Zatvori dropdown
                                            }}
                                          >
                                            <Text
                                              style={[
                                                styles.filterItemText,
                                                selectedRegion === region.id && styles.selectedFilterItemText,
                                              ]}
                                            >
                                              {region.name}
                                            </Text>
                                          </TouchableOpacity>
                                        ))}
                                      </ScrollView>
                                  )}
                              </View>
                          )}

                          {/* Opcine */}
                          {selectedRegion !== null && municipalities.length > 0 && (
                              <View style={styles.filterSection}>
                                  <Text style={styles.filterLabel}>{t('select_municipalities')}:</Text>
                                  <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled={true}> {/* Limit height */}
                                      <View style={styles.checkboxContainer}>
                                          {municipalities.map((municipality) => (
                                              <View key={`mun-${municipality.id}`} style={styles.checkboxItem}>
                                                  <Checkbox
                                                      value={selectedMunicipalities.includes(municipality.id)}
                                                      onValueChange={() => handleMunicipalityCheckboxChange(municipality.id)}
                                                  />
                                                  <Text style={styles.checkboxLabel}>{municipality.name}</Text>
                                              </View>
                                          ))}
                                      </View>
                                  </ScrollView>
                              </View>
                          )}
                           {/* Message if no municipalities for selected region */}
                            {selectedRegion !== null && !loading && municipalities.length === 0 && (
                                <Text style={styles.noResultsText}>{t('no_municipalities_found')}</Text>
                            )}


                          {/* Kategorije */}
                          {categories.length > 0 && (
                              <View style={styles.filterSection}>
                                  <Text style={styles.filterLabel}>{t('select_category')}:</Text>
                                  <TouchableOpacity
                                      style={styles.filterItem}
                                      onPress={() => setIsCategoryDropdownVisible(!isCategoryDropdownVisible)}
                                  >
                                      <Text style={styles.filterItemText}>
                                      {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : t('all')}
                                      </Text>
                                  </TouchableOpacity>

                                  {/* Dropdown za kategorije */}
                                  {isCategoryDropdownVisible && (
                                      <ScrollView
                                        style={{ maxHeight: 150 }} // Limit height
                                        nestedScrollEnabled={true}
                                        contentContainerStyle={styles.dropdownContainer}
                                      >
                                        {/* Opcija: Sve kategorije */}
                                        <TouchableOpacity
                                          style={[
                                            styles.dropdownItem,
                                            selectedCategory === null && styles.selectedFilterItem,
                                          ]}
                                          onPress={() => {
                                            handleCategorySelect(null); // poništi selekciju
                                            setIsCategoryDropdownVisible(false);
                                          }}
                                        >
                                          <Text
                                            style={[
                                              styles.filterItemText,
                                              selectedCategory === null && styles.selectedFilterItemText,
                                            ]}
                                          >
                                            {t('all')}
                                          </Text>
                                        </TouchableOpacity>

                                        {/* Sve ostale kategorije */}
                                        {categories.map((category) => (
                                          <TouchableOpacity
                                            key={`category-${category.id}`} // Unique key
                                            style={[
                                              styles.dropdownItem,
                                              selectedCategory === category.id && styles.selectedFilterItem,
                                            ]}
                                            onPress={() => {
                                              handleCategorySelect(category.id);
                                              setIsCategoryDropdownVisible(false); // Zatvori dropdown
                                            }}
                                          >
                                            <Text
                                              style={[
                                                styles.filterItemText,
                                                selectedCategory === category.id && styles.selectedFilterItemText,
                                              ]}
                                            >
                                              {category.name}
                                            </Text>
                                          </TouchableOpacity>
                                        ))}
                                      </ScrollView>
                                  )}
                              </View>
                          )}
                          {/* Message if no categories found */}
                          {categories.length === 0 && !loading && (
                               <Text style={styles.noResultsText}>{t('no_categories_found')}</Text>
                           )}


                          <View style={styles.modalButtons}>
                              <Button title={t('reset_filters')} onPress={resetFilters} color='#dc3545'/> {/* Changed reset color */}
                              <Button title={t('apply_filters')} onPress={closeFilterModal} color='#4e8d7c' /> {/* Added Apply button */}
                              <Button title={t('close')} onPress={closeFilterModal} color="gray" />
                          </View>
                      </View>
                  </TouchableWithoutFeedback>
              </View>
          </TouchableWithoutFeedback>
      </Modal>


        {/* Main FlatList rendering Ads and Store Groups */}
      <FlatList
        data={combinedData} // Use the combined data source
        keyExtractor={(item, index) =>
            item.type === 'storeGroup'
                ? `storeGroup-${item.data.id}` // Key for a store group
                 // Key for an ad, use ad ID and index for uniqueness
                : `ad-${item.data.advertisement.id}-${index}`
        }
        renderItem={({ item }) => {
            if (item.type === 'ad') {
                 // Render AdItem
                 const processedAd = item.data; // item.data is ProcessedAd
                 const ad = processedAd.advertisement; // Get the Advertisement object
                 const firstAdData = ad.adData && ad.adData.length > 0 ? ad.adData[0] : null;

                 // Ensure we have display data and a productId before rendering the AdItem
                 // Note: The AdItem component itself now also checks for valid productId before rendering its content.
                 // This check here ensures we don't even render the AdItem wrapper if the data is fundamentally bad.
                 if (!firstAdData) { // Removed redundant type/value check as AdItem does it
                    console.warn("Ad item in combinedData has no adData[0], skipping render:", ad.id);
                    return null; // Don't render if no valid data to display
                 }

                 return (
                    <View style={styles.adItemContainer}> {/* Use a simple view wrapper */}
                        <AdItem
                           adData={firstAdData} // Pass AdData for rendering details (image, description)
                           ad={ad} // Pass the Advertisement object to AdItem
                           featureVec={processedAd.featureVec} // Pass the featureVec
                           // Pass a handler that calls the main handleAdPress with the necessary context
                           onPress={() => handleAdPress(processedAd)} // AdItem's onPress signature matches handleAdPress expectation now
                         />
                    </View>
                 );
            } else if (item.type === 'storeGroup') {
                // Render Store Group (existing structure)
                 const storeGroup = item.data; // item.data is StoreWithProducts
                return (
                  <View style={styles.storeContainer}>
                    <Text style={styles.storeName}>{storeGroup.name}</Text>
                    <TouchableOpacity style={styles.storeButton} onPress={() => router.push({
                      pathname: `/screens/store/[storeId]`, // Adjust path if needed
                      params: { storeId: storeGroup.id },
                    })}>
                      <Text style = {{color:'white'}}>{t('details')}</Text>
                    </TouchableOpacity>
                    {storeGroup.products && storeGroup.products.length > 0 ? ( // Check if products array exists and is not empty
                      <FlatList
                        data={storeGroup.products}
                        keyExtractor={(product) => product.id.toString()} // Key for product item
                        renderItem={({ item: product }) => (
                          <View style={styles.productWrapper}>
                            {/* ProductItem onPress navigates to product details without ad context */}
                            <ProductItem product={product} onPress={() => handleProductPress(product)} />
                          </View>
                        )}
                         // REMOVE horizontal prop here
                         // REMOVE showsHorizontalScrollIndicator prop here
                      />
                    ) : (
                      <Text style={styles.noProductsInStore}>{t('no_products_in_store')}</Text>
                    )}
                  </View>
                );
            }
             return null; // Should not happen
        }}
         // numColumns is NOT used here as the main list is a single column of mixed item types
         // add contentContainerStyle with paddingBottom to ensure space above floating button
        contentContainerStyle={combinedData.length > 0 ? { paddingBottom: 80 } : {}} // Add padding if list is not empty
      />

        {/* Message if no combined data found */}
        {combinedData.length === 0 && !loading && !adsLoading && (
             <Text style={styles.noResultsText}>{t('no_results_found')}</Text>
         )}


      <TouchableOpacity style={styles.floatingFilterButton} onPress={openFilterModal}>
        <Text style={styles.floatingFilterButtonText}>{t('filter')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  storeButton: {
    backgroundColor: '#4e8d7c',
    padding: 7,
    borderRadius: 9,
    alignItems: 'center',
    marginBottom: 10,
    position: 'absolute', // Keep position absolute for store detail button
    right: 27,
    top: 7,
    elevation: 3,
    height: 33,
    width: 90,
  },
   adItemContainer: {
    // Simple wrapper view for ad item
    marginBottom: 15, // Space below the ad
   },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#fff',
    marginTop: 5,
    // Removed overflow: 'scroll' from style, use maxHeight on ScrollView instead
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  floatingFilterButton: {
    position: 'absolute',
    left: screenWidth / 2 - buttonWidth / 2,
    bottom: 20,
    backgroundColor: '#4e8d7c',
    borderRadius: 30,
    width: buttonWidth,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10, // Ensure button is above list items if they overlap during scroll
  },
  floatingFilterButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%', // Limit modal height
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  filterSection: {
    marginBottom: 16,
    backgroundColor: '#fff', // Consider removing background if modal has one
    padding: 12,
    borderRadius: 5,
    borderColor: '#eee',
    borderWidth: 1,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  filterItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    // marginBottom: 8, // Removed, handled by dropdownContainer margin-top
  },
  selectedFilterItem: {
    backgroundColor: '#4e8d7c',
    borderColor: '#4e8d7c',
  },
  filterItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedFilterItemText: {
    color: 'white',
  },
  checkboxContainer: {
    marginLeft: 8,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkboxLabel: {
    marginLeft: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  filterButton: { // This style is unused
    backgroundColor: '#4e8d7c',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 10,
  },
  filterButtonText: { // This style is unused
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  storeContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15, // Space between store groups
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderColor: '#4e8d7c',
    borderWidth: 1
  },
  container: {
    flex: 1,
    padding: 10, // Add padding around the main container
    backgroundColor: '#f8f8f8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  loadingMoreIndicator: { // This style seems unused
      marginVertical: 10,
  },
  listContainer: { // This style seems unused
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noResultsText: {
      textAlign: 'center',
      marginTop: 20,
      fontSize: 16,
      color: '#555',
      paddingBottom: 80, // Ensure space for the floating button
  },
  storeGroup: { // This style seems unused, replaced by storeContainer
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productWrapper: {
    // Removed marginRight for horizontal spacing
    marginBottom: 10, // Added marginBottom for vertical spacing between products in a store group
  },
  noProductsInStore: {
    fontStyle: 'italic',
    color: '#777',
    marginTop: 5,
  },
   // Styles for AdItem are inside proba-package/ad-item/index.tsx
});

export default SearchProductsScreen;
