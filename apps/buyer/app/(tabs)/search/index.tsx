import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TextInput } from 'react-native';
import ProductItem from 'proba-package/product-item/index';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { TouchableOpacity, Modal, Button, Dimensions, ScrollView, TouchableWithoutFeedback } from 'react-native';
import Checkbox from 'expo-checkbox';

const screenWidth = Dimensions.get('window').width;
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
  isAvailable: boolean;
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
  Store: Store;
  Products: Product[];
}

interface Region {
  id: number;
  naziv: string;
}

interface Municipality {
  id: number;
  naziv: string;
  idRegije: number;
}

const USE_DUMMY_DATA = true; // Postavite na true za testiranje s dummy podacima

const DUMMY_PRODUCTS: Product[] = [
  { id: 101, name: 'Mlijeko 1L', productCategory: { id: 1, name: 'Mliječni proizvodi' }, retailPrice: 2.50, wholesalePrice: 2.20, storeId: 1, photos: ['https://via.placeholder.com/300/ADD8E6/000000?Text=Mlijeko'], isAvailable: true, wholesaleThreshold: 10 },
  { id: 102, name: 'Hljeb', productCategory: { id: 2, name: 'Pekarski proizvodi' }, retailPrice: 1.20, wholesalePrice: 1.00, storeId: 1, photos: ['https://via.placeholder.com/300/F0E68C/000000?Text=Hljeb'], isAvailable: true },
  { id: 103, name: 'Jabuke 1kg', productCategory: { id: 3, name: 'Voće' }, retailPrice: 1.80, wholesalePrice: 1.50, weight: 1, weightUnit: 'kg', storeId: 1, photos: ['https://via.placeholder.com/300/90EE90/000000?Text=Jabuke'], isAvailable: true, wholesaleThreshold: 50 },
  { id: 104, name: 'Banane 1kg', productCategory: { id: 3, name: 'Voće' }, retailPrice: 2.00, wholesalePrice: 1.70, weight: 1, weightUnit: 'kg', storeId: 1, photos: ['https://via.placeholder.com/300/FFFF00/000000?Text=Banane'], isAvailable: false },
  { id: 105, name: 'Kruh pšenični', productCategory: { id: 2, name: 'Pekarski proizvodi' }, retailPrice: 1.50, wholesalePrice: 1.30, storeId: 2, photos: ['https://via.placeholder.com/300/F0E68C/000000?Text=Kruh'], isAvailable: true, wholesaleThreshold: 20 },
  { id: 106, name: 'Jogurt 500g', productCategory: { id: 1, name: 'Mliječni proizvodi' }, retailPrice: 1.10, wholesalePrice: 0.90, weight: 500, weightUnit: 'g', storeId: 2, photos: ['https://via.placeholder.com/300/ADD8E6/000000?Text=Jogurt'], isAvailable: true },
  { id: 107, name: 'Apple iPhone 13', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 999, wholesalePrice: 950, storeId: 4, photos: ['https://via.placeholder.com/300/87CEEB/FFFFFF?Text=Iphone'], isAvailable: true, wholesaleThreshold: 5 },
  { id: 108, name: 'Samsung Galaxy S21', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 950, wholesalePrice: 900, storeId: 4, photos: ['https://via.placeholder.com/300/87CEEB/FFFFFF?Text=Samsung'], isAvailable: true },
  { id: 109, name: 'Slušalice Bose', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 200, wholesalePrice: 180, storeId: 4, photos: ['https://via.placeholder.com/300/D3D3D3/000000?Text=Slušalice'], isAvailable: true, wholesaleThreshold: 15 },
  { id: 110, name: 'Dell Monitor 24" Full HD', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 300, wholesalePrice: 280, storeId: 4, photos: ['https://via.placeholder.com/300/87CEEB/FFFFFF?Text=Monitor'], isAvailable: true },
  { id: 111, name: 'Čaj Zeleni', productCategory: { id: 5, name: 'Pića' }, retailPrice: 3.00, wholesalePrice: 2.50, storeId: 2, photos: ['https://via.placeholder.com/300/32CD32/000000?Text=Čaj'], isAvailable: true, wholesaleThreshold: 100 },
  { id: 112, name: 'Kafa Moka', productCategory: { id: 5, name: 'Pića' }, retailPrice: 5.50, wholesalePrice: 5.00, storeId: 3, photos: ['https://via.placeholder.com/300/D2691E/000000?Text=Kafa'], isAvailable: true },
  { id: 113, name: 'Vino Cabernet Sauvignon', productCategory: { id: 6, name: 'Alkoholna pića' }, retailPrice: 15.00, wholesalePrice: 13.00, storeId: 5, photos: ['https://via.placeholder.com/300/8B0000/FFFFFF?Text=Vino'], isAvailable: true, wholesaleThreshold: 30 },
  { id: 114, name: 'Pivo Heineken', productCategory: { id: 6, name: 'Alkoholna pića' }, retailPrice: 1.80, wholesalePrice: 1.50, storeId: 5, photos: ['https://via.placeholder.com/300/00FF00/FFFFFF?Text=Pivo'], isAvailable: true },
  { id: 115, name: 'Računarski miš Logitech', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 25.00, wholesalePrice: 22.00, storeId: 5, photos: ['https://via.placeholder.com/300/D3D3D3/000000?Text=Miš'], isAvailable: true, wholesaleThreshold: 25 },
  { id: 116, name: 'Gaming Monitor 27"', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 400, wholesalePrice: 380, storeId: 4, photos: ['https://via.placeholder.com/300/87CEEB/FFFFFF?Text=Gaming+Monitor'], isAvailable: true },
  { id: 117, name: 'LED TV 40"', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 350, wholesalePrice: 330, storeId: 4, photos: ['https://via.placeholder.com/300/87CEEB/FFFFFF?Text=TV'], isAvailable: true, wholesaleThreshold: 10 },
  { id: 118, name: 'Knjiga "The Great Gatsby"', productCategory: { id: 7, name: 'Knjige' }, retailPrice: 15.00, wholesalePrice: 12.00, storeId: 1, photos: ['https://via.placeholder.com/300/FF6347/FFFFFF?Text=Knjiga'], isAvailable: true },
  { id: 119, name: 'Knjiga "1984"', productCategory: { id: 7, name: 'Knjige' }, retailPrice: 10.00, wholesalePrice: 8.00, storeId: 4, photos: ['https://via.placeholder.com/300/FF6347/FFFFFF?Text=Knjiga'], isAvailable: true, wholesaleThreshold: 50 },
];

const DUMMY_STORES_WITH_PRODUCTS: StoreWithProducts[] = [
  {
    Store: { id: 1, isActive: true, categoryid: 101, name: 'Supermarket A', address: 'Glavna ulica 10, Sarajevo', description: 'Veliki izbor prehrambenih proizvoda', logoUrl: 'https://via.placeholder.com/150/FFC107/000000?Text=LogoA',place:1 },
    Products: DUMMY_PRODUCTS.filter(product => product.storeId === 1),
  },
  {
    Store: { id: 2, isActive: false, categoryid: 202, name: 'Elektronika Centar', address: 'Sporedna ulica 5, Tuzla', description: 'Najnovija elektronika po povoljnim cijenama', logoUrl: 'https://via.placeholder.com/150/2196F3/FFFFFF?Text=LogoE',place:2 },
    Products: DUMMY_PRODUCTS.filter(product => product.storeId === 2),
  },
  {
    Store: { id: 4, isActive: true, categoryid: 303, name: 'Knjižara Z', address: 'Pored rijeke 15, Banja Luka', description: 'Širok asortiman knjiga i uredskog materijala', logoUrl: 'https://via.placeholder.com/150/9C27B0/FFFFFF?Text=LogoK',place:1 },
    Products: DUMMY_PRODUCTS.filter(product => product.storeId === 4),
  },
  {
    Store: { id: 5, isActive: true, categoryid: 101, name: 'Pekara Mlin', address: 'Novo Sarajevo 1', description: 'Svježi kruh i peciva', logoUrl: 'https://via.placeholder.com/150/FF9800/FFFFFF?Text=LogoP', place: 3 },
    Products: DUMMY_PRODUCTS.filter(product => product.storeId === 5),
  },
];

const DUMMY_REGIONS: Region[] = [
  { id: 1, naziv: 'Sarajevski kanton' },
  { id: 2, naziv: 'Tuzlanski kanton' },
  { id: 3, naziv: 'Republika Srpska' },
];

const DUMMY_MUNICIPALITIES: Municipality[] = [
  { id: 1, naziv: 'Sarajevo Centar', idRegije: 1 },
  { id: 2, naziv: 'Sarajevo Novi Grad', idRegije: 1 },
  { id: 3, naziv: 'Tuzla', idRegije: 2 },
  { id: 4, naziv: 'Lukavac', idRegije: 2 },
  { id: 5, naziv: 'Banja Luka', idRegije: 3 },
  { id: 6, naziv: 'Bijeljina', idRegije: 3 },
];

const SearchProductsScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [storesWithProducts, setStoresWithProducts] = useState<StoreWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  //za filtriranje 
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [regions, setRegions] = useState<Region[]>(DUMMY_REGIONS); // Koristimo dummy regije
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
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

  useEffect(() => {
    const fetchInitialData = async () => {
      if (USE_DUMMY_DATA) {
        const dummyCategories = DUMMY_PRODUCTS.reduce((acc: ProductCategory[], product) => {
          if (!acc.find(cat => cat.id === product.productCategory.id)) {
            acc.push(product.productCategory);
          }
          return acc;
        }, []);
        setCategories(dummyCategories);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const authToken = await SecureStore.getItemAsync('auth_token');
        if (!authToken) {
          throw new Error('Authentication token not found.');
        }

        //dohvacanje kategorija
        const categoriesResponse = await fetch('https://bazaar-system.duckdns.org/api/Catalog/categories', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });
        if (!categoriesResponse.ok) {
          const errorBody = await categoriesResponse.text();
          throw new Error(`HTTP error! status: ${categoriesResponse.status}, message: ${errorBody}`);
        }
        const categoriesData: ProductCategory[] = await categoriesResponse.json();
        setCategories(categoriesData);

        // dohvacanje regija
        const regionsResponse = await fetch('https://bazaar-system.duckdns.org/api/locations/regions', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });
        if (!regionsResponse.ok) {
          const errorBody = await regionsResponse.text();
          throw new Error(`HTTP error! status: ${regionsResponse.status}, message: ${errorBody}`);
        }
        const regionsData: Region[] = await regionsResponse.json();
        setRegions(regionsData);

        setLoading(false);
      } catch (e: any) {
        console.error("Error fetching initial data:", e);
        setError(e instanceof Error ? e : new Error('An unknown error occurred'));
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchMunicipalitiesForRegion = (regionId: number | null) => {
      if (USE_DUMMY_DATA) {
        setMunicipalities(DUMMY_MUNICIPALITIES.filter(m => m.idRegije === regionId));
        return;
      }

      setError(null);
      if (regionId) {
        // API poziv za dohvat opcina
        const fetchMunicipalitiesApi = async () => {
          try {
            const authToken = await SecureStore.getItemAsync('auth_token');
            if (!authToken) {
              throw new Error('Authentication token not found.');
            }

            const url = `https://bazaar-system.duckdns.org/api/locations/municipalities?region=${regionId}`;

            const municipalitiesResponse = await fetch(url, {
              headers: {
                'Authorization': `Bearer ${authToken}`,
              },
            });
            if (!municipalitiesResponse.ok) {
              const errorBody = await municipalitiesResponse.text();
              throw new Error(`HTTP error! status: ${municipalitiesResponse.status}, message: ${errorBody}`);
            }
            const municipalitiesData: Municipality[] = await municipalitiesResponse.json();
            setMunicipalities(municipalitiesData);
          } catch (e: any) {
            console.error("Error fetching municipalities:", e);
            setError(e instanceof Error ? e : new Error('An unknown error occurred'));
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
    console.log("Odabrana regija: ",selectedRegion, " odabrane opcine: ",selectedMunicipalities, " i odabrana kategorija: ",selectedCategory)
    setLoading(true);
    setError(null);

    if (USE_DUMMY_DATA) {
      let filteredStores = DUMMY_STORES_WITH_PRODUCTS.map(storeWithProducts => ({
        ...storeWithProducts,
        Products: storeWithProducts.Products.filter(product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          (selectedCategory === null || product.productCategory.id === selectedCategory)
        ),
      }));

      if (selectedRegion) {
        filteredStores = filteredStores.filter(store => {
          const storeMunicipalityId = store.Store.place;
          const municipality = DUMMY_MUNICIPALITIES.find(m => m.id === storeMunicipalityId);
          return municipality && municipality.idRegije === selectedRegion &&
                 (selectedMunicipalities.length === 0 || selectedMunicipalities.includes(storeMunicipalityId));
        });
      } else if (selectedMunicipalities.length > 0) {
        filteredStores = filteredStores.filter(store => selectedMunicipalities.includes(store.Store.place));
      }

      setStoresWithProducts(filteredStores.filter(storeWithProducts => storeWithProducts.Products.length > 0));
      setLoading(false);
      return;
    }

    try {
      const authToken = await SecureStore.getItemAsync('auth_token');
      if (!authToken) {
        throw new Error('Authentication token not found.');
      }

      const body = {
        region: selectedRegion,
        municipality: selectedMunicipalities.length > 0 ? selectedMunicipalities : null,
        category: selectedCategory,
        searchQuery: searchQuery,
      };

      const response = await fetch('https://bazaar-system.duckdns.org/api/Catalog/filter', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody}`);
      }

      const data: StoreWithProducts[] = await response.json();
      setStoresWithProducts(data);

    } catch (e: any) {
      console.error("Error fetching products:", e);
      setError(e instanceof Error ? e : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const debounceFetch = setTimeout(() => {
      fetchStoreProducts();
    }, 500);
    return () => clearTimeout(debounceFetch);
  }, [searchQuery, selectedCategory,selectedMunicipalities]);

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
    setSelectedMunicipalities(prev => {
      if (prev.includes(municipalityId)) {
        return prev.filter(id => id !== municipalityId);
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

<Modal
    animationType="slide"
    transparent={true}
    visible={isFilterModalVisible}
    onRequestClose={closeFilterModal}
>
<TouchableWithoutFeedback onPress={() => { 
        closeFilterModal();  // Close the modal
    }}>
    <View style={styles.modalOverlay}>
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
                        {selectedRegion ? regions.find(r => r.id === selectedRegion)?.naziv : t('all')}
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
          selectedRegion === null && styles.selectedFilterItemText,
        ]}
      >
        {t('all')}
      </Text>
    </TouchableOpacity>

    {/* Sve ostale regije */}
    {regions.map((region) => (
      <TouchableOpacity
        key={region.id}
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
          {region.naziv}
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
                    <View style={styles.checkboxContainer}>
                        {municipalities.map((municipality) => (
                            <View key={municipality.id} style={styles.checkboxItem}>
                                <Checkbox
                                    value={selectedMunicipalities.includes(municipality.id)}
                                    onValueChange={() => handleMunicipalityCheckboxChange(municipality.id)}
                                />
                                <Text style={styles.checkboxLabel}>{municipality.naziv}</Text>
                            </View>
                        ))}
                    </View>
                </View>
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
    style={{ maxHeight: 200 }}
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
        key={category.id}
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

            <View style={styles.modalButtons}>
            <Button title={t('reset_filters')} onPress={resetFilters} color='#4e8d7c'/>
                <Button title={t('close')} onPress={closeFilterModal} color="gray" />
            </View>
        </View>
    </View>
    </TouchableWithoutFeedback>
</Modal>


      <FlatList
        data={storesWithProducts}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.storeContainer}>
            <Text style={styles.storeName}>{item.Store.name}</Text>
            {item.Products.length > 0 ? (
              <FlatList
                data={item.Products}
                keyExtractor={(product) => product.id.toString()}
                renderItem={({ item: product }) => (
                  <View style={styles.productWrapper}>
                    <ProductItem product={product} onPress={() => handleProductPress(product)} />
                  </View>
                )}
              />
            ) : (
              <Text style={styles.noProductsInStore}>{t('no_products_in_store')}</Text>
            )}
          </View>
        )}
      />

      <TouchableOpacity style={styles.floatingFilterButton} onPress={openFilterModal}>
        <Text style={styles.floatingFilterButtonText}>{t('filter')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#fff',
    marginTop: 5,
    overflow: 'scroll',
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
    minHeight: '50%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  filterSection: {
    marginBottom: 16,
    backgroundColor: '#fff',
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
    marginBottom: 8,
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
  filterButton: {
    backgroundColor: '#4e8d7c',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 10,
  },
  filterButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  storeContainer: {
    backgroundColor: '#fff', 
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
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
    padding: 10,
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
  loadingMoreIndicator: {
      marginVertical: 10,
  },
  listContainer: {
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
  },
  storeGroup: {
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
    marginRight: 10,
  },
  noProductsInStore: {
    fontStyle: 'italic',
    color: '#777',
    marginTop: 5,
  }
});

export default SearchProductsScreen;