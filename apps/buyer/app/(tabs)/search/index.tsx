import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  SafeAreaView, Platform
} from "react-native";
import ProductItem from "proba-package/product-item/index";
import { useTranslation } from "react-i18next";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import {
  TouchableOpacity,
  Modal,
  Button,
  Dimensions,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import Checkbox from "expo-checkbox";
import { baseURL, USE_DUMMY_DATA } from "proba-package";
import { Ionicons } from "@expo/vector-icons";
import Tooltip from "react-native-walkthrough-tooltip";

const screenWidth = Dimensions.get("window").width;
const buttonWidth = screenWidth * 0.3; // 30% širine ekrana

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
  place: number; //opcina
}

interface StoreWithProducts {
  //   Store: Store;
  id: number;
  name: string;
  products: Product[];
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

// const USE_DUMMY_DATA = false; // Postavite na true za testiranje s dummy podacima

const DUMMY_PRODUCTS: Product[] = [
  {
    id: 101,
    name: "Mlijeko 1L",
    productCategory: { id: 1, name: "Mliječni proizvodi" },
    retailPrice: 2.5,
    wholesalePrice: 2.2,
    storeId: 1,
    photos: ["https://via.placeholder.com/300/ADD8E6/000000?Text=Mlijeko"],
    isActive: true,
    wholesaleThreshold: 10,
  },
  {
    id: 102,
    name: "Hljeb",
    productCategory: { id: 2, name: "Pekarski proizvodi" },
    retailPrice: 1.2,
    wholesalePrice: 1.0,
    storeId: 1,
    photos: ["https://via.placeholder.com/300/F0E68C/000000?Text=Hljeb"],
    isActive: true,
  },
  {
    id: 103,
    name: "Jabuke 1kg",
    productCategory: { id: 3, name: "Voće" },
    retailPrice: 1.8,
    wholesalePrice: 1.5,
    weight: 1,
    weightUnit: "kg",
    storeId: 1,
    photos: ["https://via.placeholder.com/300/90EE90/000000?Text=Jabuke"],
    isActive: true,
    wholesaleThreshold: 50,
  },
  {
    id: 104,
    name: "Banane 1kg",
    productCategory: { id: 3, name: "Voće" },
    retailPrice: 2.0,
    wholesalePrice: 1.7,
    weight: 1,
    weightUnit: "kg",
    storeId: 1,
    photos: ["https://via.placeholder.com/300/FFFF00/000000?Text=Banane"],
    isActive: false,
  },
  {
    id: 105,
    name: "Kruh pšenični",
    productCategory: { id: 2, name: "Pekarski proizvodi" },
    retailPrice: 1.5,
    wholesalePrice: 1.3,
    storeId: 2,
    photos: ["https://via.placeholder.com/300/F0E68C/000000?Text=Kruh"],
    isActive: true,
    wholesaleThreshold: 20,
  },
  {
    id: 106,
    name: "Jogurt 500g",
    productCategory: { id: 1, name: "Mliječni proizvodi" },
    retailPrice: 1.1,
    wholesalePrice: 0.9,
    weight: 500,
    weightUnit: "g",
    storeId: 2,
    photos: ["https://via.placeholder.com/300/ADD8E6/000000?Text=Jogurt"],
    isActive: true,
  },
  {
    id: 107,
    name: "Apple iPhone 13",
    productCategory: { id: 4, name: "Elektronika" },
    retailPrice: 999,
    wholesalePrice: 950,
    storeId: 4,
    photos: ["https://via.placeholder.com/300/87CEEB/FFFFFF?Text=Iphone"],
    isActive: true,
    wholesaleThreshold: 5,
  },
  {
    id: 108,
    name: "Samsung Galaxy S21",
    productCategory: { id: 4, name: "Elektronika" },
    retailPrice: 950,
    wholesalePrice: 900,
    storeId: 4,
    photos: ["https://via.placeholder.com/300/87CEEB/FFFFFF?Text=Samsung"],
    isActive: true,
  },
  {
    id: 109,
    name: "Slušalice Bose",
    productCategory: { id: 4, name: "Elektronika" },
    retailPrice: 200,
    wholesalePrice: 180,
    storeId: 4,
    photos: ["https://via.placeholder.com/300/D3D3D3/000000?Text=Slušalice"],
    isActive: true,
    wholesaleThreshold: 15,
  },
  {
    id: 110,
    name: 'Dell Monitor 24" Full HD',
    productCategory: { id: 4, name: "Elektronika" },
    retailPrice: 300,
    wholesalePrice: 280,
    storeId: 4,
    photos: ["https://via.placeholder.com/300/87CEEB/FFFFFF?Text=Monitor"],
    isActive: true,
  },
  {
    id: 111,
    name: "Čaj Zeleni",
    productCategory: { id: 5, name: "Pića" },
    retailPrice: 3.0,
    wholesalePrice: 2.5,
    storeId: 2,
    photos: ["https://via.placeholder.com/300/32CD32/000000?Text=Čaj"],
    isActive: true,
    wholesaleThreshold: 100,
  },
  {
    id: 112,
    name: "Kafa Moka",
    productCategory: { id: 5, name: "Pića" },
    retailPrice: 5.5,
    wholesalePrice: 5.0,
    storeId: 3,
    photos: ["https://via.placeholder.com/300/D2691E/000000?Text=Kafa"],
    isActive: true,
  },
  {
    id: 113,
    name: "Vino Cabernet Sauvignon",
    productCategory: { id: 6, name: "Alkoholna pića" },
    retailPrice: 15.0,
    wholesalePrice: 13.0,
    storeId: 5,
    photos: ["https://via.placeholder.com/300/8B0000/FFFFFF?Text=Vino"],
    isActive: true,
    wholesaleThreshold: 30,
  },
  {
    id: 114,
    name: "Pivo Heineken",
    productCategory: { id: 6, name: "Alkoholna pića" },
    retailPrice: 1.8,
    wholesalePrice: 1.5,
    storeId: 5,
    photos: ["https://via.placeholder.com/300/00FF00/FFFFFF?Text=Pivo"],
    isActive: true,
  },
  {
    id: 115,
    name: "Računarski miš Logitech",
    productCategory: { id: 4, name: "Elektronika" },
    retailPrice: 25.0,
    wholesalePrice: 22.0,
    storeId: 5,
    photos: ["https://via.placeholder.com/300/D3D3D3/000000?Text=Miš"],
    isActive: true,
    wholesaleThreshold: 25,
  },
  {
    id: 116,
    name: 'Gaming Monitor 27"',
    productCategory: { id: 4, name: "Elektronika" },
    retailPrice: 400,
    wholesalePrice: 380,
    storeId: 4,
    photos: [
      "https://via.placeholder.com/300/87CEEB/FFFFFF?Text=Gaming+Monitor",
    ],
    isActive: true,
  },
  {
    id: 117,
    name: 'LED TV 40"',
    productCategory: { id: 4, name: "Elektronika" },
    retailPrice: 350,
    wholesalePrice: 330,
    storeId: 4,
    photos: ["https://via.placeholder.com/300/87CEEB/FFFFFF?Text=TV"],
    isActive: true,
    wholesaleThreshold: 10,
  },
  {
    id: 118,
    name: 'Knjiga "The Great Gatsby"',
    productCategory: { id: 7, name: "Knjige" },
    retailPrice: 15.0,
    wholesalePrice: 12.0,
    storeId: 1,
    photos: ["https://via.placeholder.com/300/FF6347/FFFFFF?Text=Knjiga"],
    isActive: true,
  },
  {
    id: 119,
    name: 'Knjiga "1984"',
    productCategory: { id: 7, name: "Knjige" },
    retailPrice: 10.0,
    wholesalePrice: 8.0,
    storeId: 4,
    photos: ["https://via.placeholder.com/300/FF6347/FFFFFF?Text=Knjiga"],
    isActive: true,
    wholesaleThreshold: 50,
  },
];

//dummy podaci prodavnica 
const DUMMY_STORES_WITH_PRODUCTS: StoreWithProducts[] = [
  {
    id: 1, // Store ID for Supermarket A
    name: "Supermarket A",
    products: DUMMY_PRODUCTS.filter((product) => product.storeId === 1),
  },
  {
    id: 2, // Store ID for Elektronika Centar (although dummy products are filtered for storeId 2)
    name: "Elektronika Centar",
    products: DUMMY_PRODUCTS.filter((product) => product.storeId === 2),
  },
  {
    id: 3, // Assuming there's a store 3 in dummy data for Kafa Moka
    name: "Kafeterija",
    products: DUMMY_PRODUCTS.filter((product) => product.storeId === 3),
  },
  {
    id: 4, // Store ID for Knjižara Z and Elektronika
    name: "Elektronika Shop",
    products: DUMMY_PRODUCTS.filter((product) => product.storeId === 4),
  },
  {
    id: 5, // Store ID for Pekara Mlin and Alkoholna pića
    name: "Pekara i Pića",
    products: DUMMY_PRODUCTS.filter((product) => product.storeId === 5),
  },
];

// const DUMMY_STORES_WITH_PRODUCTS: StoreWithProducts[] = [
//   {
//     Store: { id: 1, isActive: true, categoryid: 101, name: 'Supermarket A', address: 'Glavna ulica 10, Sarajevo', description: 'Veliki izbor prehrambenih proizvoda', logoUrl: 'https://via.placeholder.com/150/FFC107/000000?Text=LogoA',place:1 },
//     Products: DUMMY_PRODUCTS.filter(product => product.storeId === 1),
//   },
//   {
//     Store: { id: 2, isActive: false, categoryid: 202, name: 'Elektronika Centar', address: 'Sporedna ulica 5, Tuzla', description: 'Najnovija elektronika po povoljnim cijenama', logoUrl: 'https://via.placeholder.com/150/2196F3/FFFFFF?Text=LogoE',place:2 },
//     Products: DUMMY_PRODUCTS.filter(product => product.storeId === 2),
//   },
//   {
//     Store: { id: 4, isActive: true, categoryid: 303, name: 'Knjižara Z', address: 'Pored rijeke 15, Banja Luka', description: 'Širok asortiman knjiga i uredskog materijala', logoUrl: 'https://via.placeholder.com/150/9C27B0/FFFFFF?Text=LogoK',place:1 },
//     Products: DUMMY_PRODUCTS.filter(product => product.storeId === 4),
//   },
//   {
//     Store: { id: 5, isActive: true, categoryid: 101, name: 'Pekara Mlin', address: 'Novo Sarajevo 1', description: 'Svježi kruh i peciva', logoUrl: 'https://via.placeholder.com/150/FF9800/FFFFFF?Text=LogoP', place: 3 },
//     Products: DUMMY_PRODUCTS.filter(product => product.storeId === 5),
//   },
// ];

const DUMMY_REGIONS: Region[] = [
  { id: 1, name: "Sarajevski kanton", countryCode: "BA" },
  { id: 2, name: "Tuzlanski kanton", countryCode: "BA" },
  { id: 3, name: "Republika Srpska", countryCode: "BA" },
];

const DUMMY_MUNICIPALITIES: Place[] = [
  { id: 1, name: "Sarajevo Centar", postalCode: "71000" },
  { id: 2, name: "Sarajevo Novi Grad", postalCode: "71000" },
  { id: 3, name: "Tuzla", postalCode: "75000" },
  { id: 4, name: "Lukavac", postalCode: "75300" },
  { id: 5, name: "Banja Luka", postalCode: "78000" },
  { id: 6, name: "Bijeljina", postalCode: "76300" },
];

const SearchProductsScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [storesWithProducts, setStoresWithProducts] = useState<
    StoreWithProducts[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  //za filtriranje
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [regions, setRegions] = useState<Region[]>(DUMMY_REGIONS); // Koristimo dummy regije
  const [municipalities, setMunicipalities] = useState<Place[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const [selectedMunicipalities, setSelectedMunicipalities] = useState<
    number[]
  >([]);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isRegionDropdownVisible, setIsRegionDropdownVisible] = useState(false);
  const [isCategoryDropdownVisible, setIsCategoryDropdownVisible] =
    useState(false);

  const openFilterModal = () => {
    setIsFilterModalVisible(true);
  };

  const closeFilterModal = () => {
    setIsFilterModalVisible(false);
  };

  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);

  const storeDetailsButtonRef = useRef(null);
  const firstProductRef=useRef(null)
  const filterButtonRef=useRef(null)
  const searchInputRef=useRef(null)

  //fje za help
    const startWalkthrough = () => {
      setShowWalkthrough(true);
      setWalkthroughStep(1); // Počni od prvog koraka
    };
  
    const goToNextStep = () => {
      setWalkthroughStep(prevStep => prevStep + 1);
    };
  
    const goToPreviousStep = () => {
      setWalkthroughStep(prevStep => prevStep - 1);
    };
  
    const finishWalkthrough = () => {
      setShowWalkthrough(false);
      setWalkthroughStep(0);
    };

  useEffect(() => {
    const fetchInitialData = async () => {
      if (USE_DUMMY_DATA) {
        const dummyCategories = DUMMY_PRODUCTS.reduce(
          (acc: ProductCategory[], product) => {
            if (!acc.find((cat) => cat.id === product.productCategory.id)) {
              acc.push(product.productCategory);
            }
            return acc;
          },
          []
        );
        setCategories(dummyCategories);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const authToken = await SecureStore.getItemAsync("auth_token");
        if (!authToken) {
          throw new Error("Authentication token not found.");
        }

        //dohvacanje kategorija
        const categoriesResponse = await fetch(
          baseURL + "/api/Catalog/categories",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        if (!categoriesResponse.ok) {
          const errorBody = await categoriesResponse.text();
          throw new Error(
            `HTTP error! status: ${categoriesResponse.status}, message: ${errorBody}`
          );
        }
        const categoriesData: ProductCategory[] =
          await categoriesResponse.json();
        setCategories(categoriesData);

        // dohvacanje regija
        const regionsResponse = await fetch(
          baseURL + "/api/Geography/regions",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        if (!regionsResponse.ok) {
          const errorBody = await regionsResponse.text();
          throw new Error(
            `HTTP error! status: ${regionsResponse.status}, message: ${errorBody}`
          );
        }
        const regionsData: Region[] = await regionsResponse.json();
        setRegions(regionsData);

        setLoading(false);
      } catch (e: any) {
        console.error("Error fetching initial data:", e);
        setError(
          e instanceof Error ? e : new Error("An unknown error occurred")
        );
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchMunicipalitiesForRegion = (regionId: number | null) => {
      if (USE_DUMMY_DATA) {
        // setMunicipalities(DUMMY_MUNICIPALITIES.filter(m => m.idRegije === regionId));
        setMunicipalities(DUMMY_MUNICIPALITIES);
        return;
      }

      setError(null);
      if (regionId) {
        // API poziv za dohvat opcina
        const fetchMunicipalitiesApi = async () => {
          try {
            const authToken = await SecureStore.getItemAsync("auth_token");
            if (!authToken) {
              throw new Error("Authentication token not found.");
            }

            const url = baseURL + `/api/Geography/region/${regionId}`;

            const municipalitiesResponse = await fetch(url, {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            });
            if (!municipalitiesResponse.ok) {
              const errorBody = await municipalitiesResponse.text();
              throw new Error(
                `HTTP error! status: ${municipalitiesResponse.status}, message: ${errorBody}`
              );
            }
            const municipalitiesData: Place[] =
              await municipalitiesResponse.json();
            setMunicipalities(municipalitiesData);
          } catch (e: any) {
            console.error("Error fetching municipalities:", e);
            setError(
              e instanceof Error ? e : new Error("An unknown error occurred")
            );
            setMunicipalities([]);
          }
        };
        fetchMunicipalitiesApi();
      } else {
        setMunicipalities([]);
      }
      setSelectedMunicipalities([]); // reset odabranih opcina kad se mijenja regija
    };

    fetchMunicipalitiesForRegion(selectedRegion);
  }, [selectedRegion]);

  const fetchStoreProducts = async () => {
    console.log(
      "Odabrana regija: ",
      selectedRegion,
      " odabrane opcine: ",
      selectedMunicipalities,
      " i odabrana kategorija: ",
      selectedCategory
    );

    const regionName = selectedRegion
      ? regions.find((r) => r.id === selectedRegion)?.name // Pronađi regiju po ID-u
      : null; // Ako nije odabrana regija

    const categoryName = selectedCategory
      ? categories.find((c) => c.id === selectedCategory)?.name // Pronađi kategoriju po ID-u
      : null; // Ako nije odabrana kategorija

    let selectedMunicipalityNames: string[] = []; // Inicijalizujemo prazan niz za imena

    // Proveravamo da li imamo učitane opštine i da li je neka odabrana
    if (
      municipalities &&
      municipalities.length > 0 &&
      selectedMunicipalities &&
      selectedMunicipalities.length > 0
    ) {
      selectedMunicipalityNames = selectedMunicipalities
        .map((id) => {
          // Za svaki odabrani ID, pronađi odgovarajući objekat opštine
          const municipality = municipalities.find((m) => m.id === id);
          // Vrati ime opštine ako je pronađena, inače undefined
          return municipality?.name;
        })
        // Filtriraj sve rezultate koji su undefined (ako opština nije pronađena iz nekog razloga)
        // i osiguraj da TypeScript zna da je rezultat niz stringova
        .filter((name): name is string => name !== undefined);
    }

    // Ispiši nazive umesto ID-jeva
    console.log(
      `Pokretanje pretrage - Regija: ${regionName}, Općine: ${selectedMunicipalityNames}, Kategorija: ${categoryName}, Upit: ${
        searchQuery || "Nema"
      }`
    );

    setLoading(false);
    setError(null);

    //namjestanje da radi i sa dummy podacima 
    if (USE_DUMMY_DATA) {
    let filteredProducts = DUMMY_PRODUCTS.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === null ||
        product.productCategory.id === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    let filteredStoresWithProducts: StoreWithProducts[] = [];

    if (selectedRegion || selectedMunicipalities.length > 0) {
      filteredProducts = filteredProducts.filter((product) => {
        const storeForProduct = DUMMY_STORES_WITH_PRODUCTS.find(
          (store) => store.id === product.storeId
        );

        if (!storeForProduct) return false;

        const dummyStore = {
          id: storeForProduct.id,
          name: storeForProduct.name,
          address: "Dummy Adresa",
          description: "Dummy Opis",
          isActive: true,
          categoryid: 1,
          place: DUMMY_MUNICIPALITIES.find(
            (m) => m.name === "Sarajevo Centar"
          )?.id,
        };

        const storeMunicipality = DUMMY_MUNICIPALITIES.find(
          (m) => m.id === dummyStore.place
        );
        const storeRegion = DUMMY_REGIONS.find((r) =>
          DUMMY_MUNICIPALITIES.some(
            (m) => m.id === dummyStore.place && r.name.includes("Sarajevski")
          )
        ); 

        const matchesRegion =
          selectedRegion === null ||
          (storeRegion && storeRegion.id === selectedRegion);

        const matchesMunicipalities =
          selectedMunicipalities.length === 0 ||
          selectedMunicipalities.includes(dummyStore.place as number); 

        return matchesRegion && matchesMunicipalities;
      });
    }

    const groupedProducts: { [storeId: number]: Product[] } = {};
    filteredProducts.forEach((product) => {
      if (!groupedProducts[product.storeId]) {
        groupedProducts[product.storeId] = [];
      }
      groupedProducts[product.storeId].push(product);
    });

    for (const storeId in groupedProducts) {
      const storeInfo = DUMMY_STORES_WITH_PRODUCTS.find(
        (store) => store.id === parseInt(storeId)
      );
      if (storeInfo) {
        filteredStoresWithProducts.push({
          id: storeInfo.id,
          name: storeInfo.name,
          products: groupedProducts[storeId],
        });
      }
    }

    setStoresWithProducts(filteredStoresWithProducts);
    setLoading(false);
    return;
  }

    // if (USE_DUMMY_DATA) {
    //   let filteredStores = DUMMY_STORES_WITH_PRODUCTS.map(storeWithProducts => ({
    //     ...storeWithProducts,
    //     Products: storeWithProducts.Products.filter(product =>
    //       product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    //       (selectedCategory === null || product.productCategory.id === selectedCategory)
    //     ),
    //   }));

    //   if (selectedRegion) {
    //     filteredStores = filteredStores.filter(store => {
    //       const storeMunicipalityId = store.Store.place;
    //       const municipality = DUMMY_MUNICIPALITIES.find(m => m.id === storeMunicipalityId);
    //       return municipality &&
    //              (selectedMunicipalities.length === 0 || selectedMunicipalities.includes(storeMunicipalityId));
    //     });
    //   } else if (selectedMunicipalities.length > 0) {
    //     filteredStores = filteredStores.filter(store => selectedMunicipalities.includes(store.Store.place));
    //   }

    //   setStoresWithProducts(filteredStores.filter(storeWithProducts => storeWithProducts.Products.length > 0));
    //   setLoading(false);
    //   return;
    // }

    const authToken = await SecureStore.getItemAsync("auth_token");
    if (!authToken) {
      throw new Error("Authentication token not found.");
    }

    // const body = {
    //   region: selectedRegion,
    //   municipality: selectedMunicipalities.length > 0 ? selectedMunicipalities : null,
    //   category: selectedCategory,
    //   searchQuery: searchQuery,
    // };

    // const response = await fetch('https://bazaar-system.duckdns.org/api/Catalog/filter', {
    //   method: 'GET',
    //   headers: {
    //     'Authorization': `Bearer ${authToken}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(body),
    // });

    const baseUrl = baseURL + "/api/Catalog/filter";

    // Koristimo URLSearchParams za lako kreiranje query stringa
    const params = new URLSearchParams();

    // Dodajemo parametre samo ako imaju vrednost
    if (regionName) {
      params.append("region", regionName);
    }

    // Za niz 'municipality', dodajemo svaki element kao poseban parametar sa istim imenom
    if (selectedMunicipalityNames && selectedMunicipalityNames.length > 0) {
      selectedMunicipalityNames.forEach((municipality) => {
        // Server bi trebalo da bude konfigurisan da prihvati više parametara sa istim imenom kao niz
        params.append("places", municipality);
      });
    }

    if (categoryName) {
      params.append("category", categoryName);
    }

    if (searchQuery) {
      params.append("query", searchQuery);
    }

    // Kreiramo kompletan URL sa query parametrima
    // params.toString() će automatski enkodirati vrednosti i spojiti ih sa '&'
    const queryString = params.toString();
    const url = `${baseUrl}${queryString ? `?${queryString}` : ""}`; // Dodajemo '?' samo ako ima parametara

    console.log("Fetching URL:", url); // Za debugovanje

    try {
      const response = await fetch(url, {
        method: "GET", // Metoda je GET
        headers: {
          Authorization: `Bearer ${authToken}`,
          // 'Content-Type' nije potreban za GET bez body-ja
          // Možda želite 'Accept' header ako očekujete JSON nazad:
          // 'Accept': 'application/json',
        },
        // NEMA 'body' property za GET zahteve
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorBody}`
        );
      }

      console.log("Odgovor");
      console.log(response.body);

      const data: StoreWithProducts[] = await response.json();

      console.log("parsirano");
      console.log(data);

      setStoresWithProducts(data);
    } catch (e: any) {
      console.error("Error fetching products:", e);
      setError(e instanceof Error ? e : new Error("An unknown error occurred"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceFetch = setTimeout(() => {
      fetchStoreProducts();
    }, 500);
    return () => clearTimeout(debounceFetch);
  }, [searchQuery, selectedCategory, selectedMunicipalities]);

  const handleProductPress = (product: Product) => {
    router.push(`/search/details/${product.id}`);
  };

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  const resetFilters = async () => {
    setSelectedCategory(null);
    setSelectedRegion(null);
    setSelectedMunicipalities([]);
    setIsRegionDropdownVisible(false);
    setIsCategoryDropdownVisible(false);
  };

  const handleMunicipalityCheckboxChange = (municipalityId: number) => {
    setSelectedMunicipalities((prev) => {
      if (prev.includes(municipalityId)) {
        return prev.filter((id) => id !== municipalityId);
      } else {
        return [...prev, municipalityId];
      }
    });
  };

  if (loading && storesWithProducts.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4e8d7c" />
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.headerContainer}>
            {/* Lijeva strana - prazna ili za back dugme */}
            <View style={styles.sideContainer} /> 
            
            {/* Naslov headera */}
            <View style={styles.titleContainer}>
              <Text style={styles.headerText} numberOfLines={1} ellipsizeMode="tail">
                {t('search')}
              </Text>
            </View>
            
            {/* Desna strana - dugme za pomoć */}
            <View style={[styles.sideContainer, styles.rightSideContainer]}>
              <TouchableOpacity onPress={startWalkthrough} style={styles.iconButton}>
                <Ionicons name="help-circle-outline" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          {t("error_fetching_data")}: {error.message}
        </Text>
      </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.headerContainer}>
            {/* Lijeva strana - prazna ili za back dugme */}
            <View style={styles.sideContainer} /> 
            
            {/* Naslov headera */}
            <View style={styles.titleContainer}>
              <Text style={styles.headerText} numberOfLines={1} ellipsizeMode="tail">
                {t('search')}
              </Text>
            </View>
            
            {/* Desna strana - dugme za pomoć */}
            <View style={[styles.sideContainer, styles.rightSideContainer]}>
              <TouchableOpacity onPress={startWalkthrough} style={styles.iconButton}>
                <Ionicons name="help-circle-outline" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
    <View style={styles.container}>
       {/* Search Bar with Icon */}

       <Tooltip
                isVisible={showWalkthrough && walkthroughStep === 1} 
                content={
                  <View style={styles.tooltipContent}>
                    <Text style={{ fontSize: 16, marginBottom: 10 }}>
                      {t('tutorial_search_products')}
                    </Text>
                    <View style={styles.tooltipButtonContainer}>
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
                onClose={finishWalkthrough}
                tooltipStyle={{ width: Dimensions.get('window').width * 0.8 }}
                useReactNativeModal={true}
                arrowSize={{ width: 16, height: 8 }}
                showChildInTooltip={true} 
              >
    <View style={styles.searchContainer}>
      <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder={t('search_products_placeholder')}
        value={searchQuery}
        onChangeText={setSearchQuery}
        clearButtonMode="while-editing"
      />
    </View>
    </Tooltip>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={closeFilterModal}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            closeFilterModal();
          }}
        >
          <View style={styles.modalOverlay}>
            <View
              style={styles.modalContainer}
              onStartShouldSetResponder={() => true}
            >
              <Text style={styles.modalTitle}>{t("filter_products")}</Text>

              {/* Regije */}
              {regions.length > 0 && (
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>{t("select_region")}:</Text>
                  <TouchableOpacity
                    style={styles.filterItem}
                    onPress={() =>
                      setIsRegionDropdownVisible(!isRegionDropdownVisible)
                    }
                  >
                    <Text style={styles.filterItemText}>
                      {selectedRegion
                        ? regions.find((r) => r.id === selectedRegion)?.name
                        : t("all")}
                    </Text>
                  </TouchableOpacity>

                  {/* Dropdown za regije */}
                  {isRegionDropdownVisible && (
                    <ScrollView
                      style={{ maxHeight: 200 }}
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
                            selectedRegion === null &&
                              styles.selectedFilterItemText,
                          ]}
                        >
                          {t("all")}
                        </Text>
                      </TouchableOpacity>

                      {/* Sve ostale regije */}
                      {regions.map((region) => (
                        <TouchableOpacity
                          key={region.id}
                          style={[
                            styles.dropdownItem,
                            selectedRegion === region.id &&
                              styles.selectedFilterItem,
                          ]}
                          onPress={() => {
                            setSelectedRegion(region.id);
                            setIsRegionDropdownVisible(false); // Zatvori dropdown
                          }}
                        >
                          <Text
                            style={[
                              styles.filterItemText,
                              selectedRegion === region.id &&
                                styles.selectedFilterItemText,
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
                  <Text style={styles.filterLabel}>
                    {t("select_municipalities")}:
                  </Text>
                  <View style={styles.checkboxContainer}>
                    {municipalities.map((municipality) => (
                      <View key={municipality.id} style={styles.checkboxItem}>
                        <Checkbox
                          value={selectedMunicipalities.includes(
                            municipality.id
                          )}
                          onValueChange={() =>
                            handleMunicipalityCheckboxChange(municipality.id)
                          }
                        />
                        <Text style={styles.checkboxLabel}>
                          {municipality.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Kategorije */}
              {categories.length > 0 && (
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>
                    {t("select_category")}:
                  </Text>
                  <TouchableOpacity
                    style={styles.filterItem}
                    onPress={() =>
                      setIsCategoryDropdownVisible(!isCategoryDropdownVisible)
                    }
                  >
                    <Text style={styles.filterItemText}>
                      {selectedCategory
                        ? categories.find((c) => c.id === selectedCategory)
                            ?.name
                        : t("all")}
                    </Text>
                  </TouchableOpacity>

                  {/* Dropdown za kategorije */}
                  {isCategoryDropdownVisible && (
                    <ScrollView
                      style={{ maxHeight: 200 }}
                      nestedScrollEnabled={true}
                      contentContainerStyle={styles.dropdownContainer}
                    >
                      {/* Opcija: Sve kategorije */}
                      <TouchableOpacity
                        style={[
                          styles.dropdownItem,
                          selectedCategory === null &&
                            styles.selectedFilterItem,
                        ]}
                        onPress={() => {
                          handleCategorySelect(null); // poništi selekciju
                          setIsCategoryDropdownVisible(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.filterItemText,
                            selectedCategory === null &&
                              styles.selectedFilterItemText,
                          ]}
                        >
                          {t("all")}
                        </Text>
                      </TouchableOpacity>

                      {/* Sve ostale kategorije */}
                      {categories.map((category) => (
                        <TouchableOpacity
                          key={category.id}
                          style={[
                            styles.dropdownItem,
                            selectedCategory === category.id &&
                              styles.selectedFilterItem,
                          ]}
                          onPress={() => {
                            handleCategorySelect(category.id);
                            setIsCategoryDropdownVisible(false); // Zatvori dropdown
                          }}
                        >
                          <Text
                            style={[
                              styles.filterItemText,
                              selectedCategory === category.id &&
                                styles.selectedFilterItemText,
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

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalBtn, styles.closeBtn]} onPress={closeFilterModal}>
     <Text style={styles.modalBtnText}>{t('close')}</Text>
   </TouchableOpacity>
                 <TouchableOpacity style={[styles.modalBtn, styles.resetBtn]} onPress={resetFilters}>
     <Text style={styles.modalBtnText}>{t('reset_filters')}</Text>
   </TouchableOpacity>
   
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <FlatList
        data={storesWithProducts}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index: storeIndex }) => (
          <View style={styles.storeContainer}>
            <Text style={styles.storeName}>{item.name}</Text>
            <Tooltip
                isVisible={storeIndex===0 && showWalkthrough && walkthroughStep === 2} 
               content={
                   <View style={styles.tooltipContent}>
                   <Text style={{ fontSize: 16, marginBottom: 10 }}>{t('tutorial_store_details_button')}</Text>
                  <View style={styles.tooltipButtonContainer}>
                  <TouchableOpacity
                  style={[styles.tooltipButtonBase, styles.tooltipPrevButton]}
                  onPress={goToPreviousStep}
                  >
                 <Text style={styles.tooltipButtonText}>{t('previous')}</Text>
                 </TouchableOpacity>
                 <TouchableOpacity
                 style={[styles.tooltipButtonBase, styles.tooltipNextButton]}
                 onPress={goToNextStep}
                >
                <Text style={styles.tooltipButtonText}>{t('next')}</Text>
                </TouchableOpacity>
               </View>
              </View>
               }
                placement="left"
                onClose={finishWalkthrough}
                tooltipStyle={{ width: Dimensions.get('window').width * 0.8 }}
                useReactNativeModal={true}
                arrowSize={{ width: 16, height: 8 }}
                showChildInTooltip={true} 
              >
           <TouchableOpacity
  style={styles.detailsButton}
  onPress={() =>
    router.push({
      pathname: `/screens/store/[storeId]`,
      params: { storeId: item.id },
    })
  }
  ref={storeDetailsButtonRef}
>
  <Ionicons name="storefront-outline" size={24} color="#fff" />
</TouchableOpacity>
</Tooltip>
            {item.products.length > 0 ? (
              <FlatList
                data={item.products}
                keyExtractor={(product) => product.id.toString()}
                renderItem={({ item: product, index: productIndex }) => (
                  <Tooltip
                   isVisible={storeIndex===0 && productIndex===0 && showWalkthrough && walkthroughStep === 3}
                   content={
                   <View style={styles.tooltipContent}>
                   <Text style={{ fontSize: 16, marginBottom: 10 }}>{t('tutorial_first_product_description')}</Text>
                  <View style={styles.tooltipButtonContainer}>
                  <TouchableOpacity
                  style={[styles.tooltipButtonBase, styles.tooltipPrevButton]}
                  onPress={goToPreviousStep}
                  >
                 <Text style={styles.tooltipButtonText}>{t('previous')}</Text>
                 </TouchableOpacity>
                 <TouchableOpacity
                 style={[styles.tooltipButtonBase, styles.tooltipNextButton]}
                 onPress={goToNextStep}
                >
                <Text style={styles.tooltipButtonText}>{t('next')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        placement="bottom"
        onClose={finishWalkthrough}
        tooltipStyle={{ width: Dimensions.get('window').width * 0.8 }}
        useReactNativeModal={true}
        arrowSize={{ width: 16, height: 8 }}
        showChildInTooltip={true}
      >
                  <View style={styles.productWrapper}>
                    <ProductItem
                      product={product}
                      onPress={() => handleProductPress(product)}
                    />
                  </View>
                  </Tooltip>
                )}
              />
            ) : (
              <Tooltip
                   isVisible={showWalkthrough && walkthroughStep === 3}
                   content={
                   <View style={styles.tooltipContent}>
                   <Text style={{ fontSize: 16, marginBottom: 10 }}>{t('tutorial_no_products_in_store')}</Text>
                  <View style={styles.tooltipButtonContainer}>
                  <TouchableOpacity
                  style={[styles.tooltipButtonBase, styles.tooltipPrevButton]}
                  onPress={goToPreviousStep}
                  >
                 <Text style={styles.tooltipButtonText}>{t('previous')}</Text>
                 </TouchableOpacity>
                 <TouchableOpacity
                 style={[styles.tooltipButtonBase, styles.tooltipNextButton]}
                 onPress={goToNextStep}
                >
                <Text style={styles.tooltipButtonText}>{t('next')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        placement="bottom"
        onClose={finishWalkthrough}
        tooltipStyle={{ width: Dimensions.get('window').width * 0.8 }}
        useReactNativeModal={true}
        arrowSize={{ width: 16, height: 8 }}
        showChildInTooltip={true}
      >
              <Text style={styles.noProductsInStore}>
                {t("no_products_in_store")}
              </Text>
              </Tooltip>
            )}
          </View>
        )}
      />

       <Tooltip
        isVisible={showWalkthrough && walkthroughStep === 4}
        content={
          <View style={styles.tooltipContent}>
            <Text style={{ fontSize: 16, marginBottom: 10 }}>
              {t('tutorial_filter_products_stores')} 
            </Text>
                <View style={styles.tooltipButtonContainer}>
                  <TouchableOpacity
                    style={[styles.tooltipButtonBase, styles.tooltipPrevButton]}
                    onPress={goToPreviousStep}
                  >
                    <Text style={styles.tooltipButtonText}>{t('previous')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tooltipButtonBase, styles.tooltipFinishButton]}
                    onPress={finishWalkthrough}
                  >
                    <Text style={styles.tooltipButtonText}>{t('finish')}</Text>
                  </TouchableOpacity>
                </View>
          </View>
        }
        placement="left"
        onClose={finishWalkthrough}
        tooltipStyle={{ width: Dimensions.get('window').width * 0.8 }}
        useReactNativeModal={true}
        arrowSize={{ width: 16, height: 8 }}
        showChildInTooltip={true}
      >
      <TouchableOpacity
  style={styles.floatingFilterButton}
  onPress={openFilterModal}
  ref={filterButtonRef}
>
  <Ionicons name="options-outline" size={30} color="#fff" />
</TouchableOpacity>
</Tooltip>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  storeButton: {
    backgroundColor: "#4e8d7c",
    padding: 7,
    borderRadius: 9,
    alignItems: "center",
    marginBottom: 10,
    position: "absolute",
    right: 27,
    top: 7,
    elevation: 3,
    height: 33,
    width: 90,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#333',
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#fff",
    marginTop: 5,
    overflow: "scroll",
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  
  floatingFilterButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: "50%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  filterSection: {
    marginBottom: 16,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 5,
    borderColor: "#eee",
    borderWidth: 1,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  filterItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 8,
  },
  selectedFilterItem: {
    backgroundColor: "#4e8d7c",
    borderColor: "#4e8d7c",
  },
  filterItemText: {
    fontSize: 16,
    color: "#333",
  },
  selectedFilterItemText: {
    color: "white",
  },
  checkboxContainer: {
    marginLeft: 8,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  checkboxLabel: {
    marginLeft: 8,
  },
   modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
     borderRadius: 24,
  },
  filterButton: {
    backgroundColor: "#4e8d7c",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    margin: 10,
  },
  filterButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  storeContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderColor: "#4e8d7c",
    borderWidth: 1,
  },
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f8f8f8",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginHorizontal: 20,
  },
  loadingMoreIndicator: {
    marginVertical: 10,
  },
  listContainer: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noResultsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#555",
  },
  storeGroup: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  productWrapper: {
    marginRight: 10,
    flexShrink:1,
    width:'100%'
  },
  noProductsInStore: {
    fontStyle: "italic",
    color: "#777",
    marginTop: 5,
  },
  
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 8,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    borderRadius: 24,        // <-- pill shape
    alignItems: 'center',
  },
  resetBtn: {
    backgroundColor: '#4e8d7c',
  },
  closeBtn: {
    backgroundColor: '#c90202',
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  detailsButton: {
  position: 'absolute',
  top: -40,
  right: 6,
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: '#4e8d7c',
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.3,
  shadowRadius: 2,
  elevation: 4,
},
floatingFilterButton: {
  position: 'absolute',
  bottom: 30,
  right: 30,
  width: 60,
  height: 60,
  borderRadius: 28,
  backgroundColor: '#4e8d7c',
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 6,
},
});


export default SearchProductsScreen;
