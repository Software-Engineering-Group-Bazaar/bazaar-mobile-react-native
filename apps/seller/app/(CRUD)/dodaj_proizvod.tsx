import React, { useState, useEffect,useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation,useFocusEffect } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiFetchCategories ,apiFetchProductDetails,
  apiUpdateProductPrices,
  apiUpdateProductAvailability} from '../api/productApi'; //DODANO
import api from '../api/defaultApi';


import * as FileSystem from 'expo-file-system';


const weightUnits = ["kg", "g", "lbs"];
const volumeUnits = ["L", "ml", "oz"];

  
export default function AddProductScreen() {
  
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const router = useRouter(); // Premesti ovde
  const productId = params.productId ? Number(params.productId) : null;
  const storeId = params.storeId ? Number(params.storeId):null; // Dodaj i storeId ovde
  const isEditing = productId !== null;
  const [name, setName] = useState('');
  const [price, setPrice] = useState(''); // Ovo će biti Maloprodajna
  const [wholesaleThreshold, setWholesaleThreshold] = useState(''); // NOVO: Prag
  const [wholesalePrice, setWholesalePrice] = useState('');         // NOVO: Veleprodajna 
  const [weight, setWeight] = useState('');
  const [volume, setVolume] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [weightOpen, setWeightOpen] = useState(false);
  const [weightUnit, setWeightUnit] = useState(weightUnits[0]);
  const [weightItems, setWeightItems] = useState(
    weightUnits.map((unit) => ({ label: unit, value: unit }))
  );

  const [volumeOpen, setVolumeOpen] = useState(false);
  const [volumeUnit, setVolumeUnit] = useState(volumeUnits[0]);
  const [volumeItems, setVolumeItems] = useState(
    volumeUnits.map((unit) => ({ label: unit, value: unit }))
  );

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [category, setCategory] = useState<number | null>(null);// Inicijalizacija na null

  const [categories, setCategories] = useState<any[]>([]);
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);


  const [isAvailable, setIsAvailable] = useState(true);



  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });
  
    if (!result.canceled) {
      setImages(result.assets);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await apiFetchCategories();
      const formattedCategories = data.map((cat: { id: number; name: string }) => ({
        label: cat.name,
        value: cat.id,
      }));

      setCategories(formattedCategories);
      console.log("Fetched categories:", formattedCategories);
    };
  
    fetchCategories();
  }, []);

useEffect(() => {
    const fetchProductData = async () => {
      // Izvrši samo ako je isEditing true i productId postoji
      if (isEditing && productId) {
        console.log(`EDIT MODE: Fetching data for product ID: ${productId}`);
        setIsFetchingData(true); // Pokaži indikator učitavanja podataka
        setLoading(true); // Može se koristiti i opšti loading
        const productData = await apiFetchProductDetails(productId); // Pozovi API
        if (productData) {
          console.log('Product data fetched:', productData);
          // Popuni state varijable vrednostima iz dobijenog objekta
          setName(productData.name || '');
          // Koristi ?? '' da osiguraš da je string, čak i ako je vrednost null/undefined
          setPrice(productData.retailPrice?.toString() ?? '');
          setWholesaleThreshold(productData.wholesaleThreshold?.toString() ?? '');
          setWholesalePrice(productData.wholesalePrice?.toString() ?? '');
          setWeight(productData.weight?.toString() ?? '');
          setWeightUnit(productData.weightUnit ?? weightUnits[0]); // Vrati na default ako ne postoji
          setVolume(productData.volume?.toString() ?? '');
          setVolumeUnit(productData.volumeUnit ?? volumeUnits[0]); // Vrati na default ako ne postoji
          setCategory(productData.productCategory?.id ?? null); // Postavi ID kategorije
          setIsAvailable(productData.isAvailable ?? true); // Postavi dostupnost (default true)
          // TODO: Popuniti state za postojeće slike ako je potrebno
          // setExistingImages(productData.photos || []);
        } else {
           // Greška pri dohvatanju ili proizvod nije nađen
           console.error(`Product with ID ${productId} not found or failed to fetch.`);
           Alert.alert(t('error'), t('error_fetching_product_data'));
           // Razmotriti automatsko vraćanje korisnika nazad
           // router.back();
        }
        setIsFetchingData(false); // Sakrij indikator učitavanja podataka
        setLoading(false); // Resetuj opšti loading
      }
    };
    // Pozovi funkciju za dohvatanje
    fetchProductData();
    // Ponovo izvrši ako se promeni productId (mada ne bi trebalo u praksi) ili jezik (za Alert)
  }, [productId, isEditing, t]);

  // Postavljanje naslova ekrana dinamički (Dodaj/Uredi Proizvod)
   useEffect(() => {
     navigation.setOptions({
       title: isEditing ? t('edit_product') : t('add_a_product'),
     });
     // Ponovo izvrši ako se promeni mod (isEditing), jezik ili sama navigation instanca
   }, [isEditing, navigation, i18n.language, t]);
  
  

  async function prepareImage(imageUri: string) {
    const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
    return `data:image/jpeg;base64,${base64}`;
  }
  
  const handleSave = async () => {
    if (!name.trim() || !price.trim() || !category  || !wholesaleThreshold.trim() || !wholesalePrice.trim() ) {
      Alert.alert(t("error"), t("fill_all_fields")); // Možda treba specifičnija poruka
      return;
    }
    const isWeightProvided = weight.trim() !== '';
    const isVolumeProvided = volume.trim() !== '';
    if (!isWeightProvided && !isVolumeProvided) {
      Alert.alert(t("error"), t("error_weight_or_volume_required"));
      return;
    }
    if (!storeId && !isEditing) {
        console.error("Store ID missing for create.");
        Alert.alert(t("error"), t("something_went_wrong"));
        return;
    }
    if (!productId && isEditing) {
        console.error("Product ID missing for edit.");
        Alert.alert(t("error"), t("something_went_wrong"));
        return;
    }

    setLoading(true);


    /*setFormData((prevData) => ({
      ...prevData, 
      name: name, 
      ProductCategoryId: category,
      RetailPrice: price,
      WholesalePrice: price,
      Weight: weight,
      WeightUnit: weightUnit,
      Volume: volume,
      VolumeUnit: volumeUnit,
      StoreId: storeId
    }));    

    for (const image of images) {
      const base64Image = await prepareImage(image.uri);
      formData.append("Files", base64Image);
    }*/
    // ✅ Construct JSON object
    /*const productPayload = {
      Name: name,
      ProductCategoryId: category,
      RetailPrice: parseFloat(price),
      WholesalePrice: parseFloat(price),
      Weight: parseFloat(weight),
      WeightUnit: weightUnit,
      Volume: parseFloat(volume),
      VolumeUnit: volumeUnit,
      StoreId: storeId,
      Files: images.map((image, index) => ({
        uri: image.uri,
        name: `photo_${index}.jpg`,
        type: "image/jpeg",
      })), 
    };*/
    const formData = new FormData();
    formData.append("Name", name);
    formData.append("ProductCategoryId", category.toString());
    formData.append("RetailPrice", price.toString());
    formData.append("WholesalePrice", price.toString());
    formData.append("Weight", weight.toString());
    formData.append("WeightUnit", weightUnit);
    formData.append("Volume", volume.toString());
    formData.append("VolumeUnit", volumeUnit);
    formData.append("StoreId", storeId!.toString());
    formData.append("IsAvailable", isAvailable.toString());//novo
    formData.append("RetailPrice", price.trim());
    if (category) { // Provjeri da li je kategorija odabrana
      formData.append("ProductCategoryId", category.toString());
   }
   if (wholesaleThreshold.trim()) {
    formData.append("WholesaleThreshold", wholesaleThreshold.trim()); //novo
   }
   if (wholesalePrice.trim()) {
    formData.append("WholesalePrice", wholesalePrice.trim());     //novo
  }

  if (weight.trim()) {
    formData.append("Weight", weight.trim());
    formData.append("WeightUnit", weightUnit);
  }
  if (volume.trim()) {
    formData.append("Volume", volume.trim());
    formData.append("VolumeUnit", volumeUnit);
  }



    images.forEach((image, index) => {
      formData.append("Files", {
        uri: image.uri,
        type: "image/jpeg",
        name: `photo_${index}.jpg`,
      } as any);
    });

    console.log("Payload to send:", formData);
  
    try {
      setLoading(true);
      const response = await api.post("/Catalog/products/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      console.log("Upload Success:", response.data);
      Alert.alert(t("success"), t("store_updated"));
      router.back();
    } catch (error: any) {
      console.error("Upload Error:", error.response?.data || error.message);
      Alert.alert(t("error"), t("something_went_wrong"));
    } finally {
      setLoading(false);
    }
  };


  const toggleLanguage = () => i18n.changeLanguage(i18n.language === 'en' ? 'bs' : 'en');

  useEffect(() => {
    navigation.setOptions({ title: t('add_a_product') });
  }, [i18n.language, navigation]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
        <FontAwesome name="language" size={18} color="#4E8D7C" />
        <Text style={styles.languageText}>{i18n.language.toUpperCase()}</Text>
      </TouchableOpacity>
        {/* Prikazi overlay dok se učitavaju podaci */}
        {isFetchingData && (
            <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#4E8D7C" />
            </View>
        )}

      {/* Prikazi formu tek kada podaci NISU učitani */}
      {!isFetchingData && (

      <KeyboardAwareScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" enableOnAndroid={true}
      extraScrollHeight={Platform.OS === 'ios' ? 20 : 150}
      showsVerticalScrollIndicator={false}
  >
        <Text style={styles.title}>{t('add_a_product')}</Text>

        <View style={[styles.form, { zIndex: 0 }]}>
          <Text style={styles.label}>{t('product_name')}</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder={t('enter_product_name')} />

          <Text style={styles.label}>{t('retail_price')}</Text>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder={t('enter_retail_price')} keyboardType="decimal-pad" />

    {/* Veleprodajna Cijena */}
    <Text style={styles.label}>{t('wholesale_price')}</Text> 
          <TextInput
            style={styles.input}
            value={wholesalePrice} 
            onChangeText={setWholesalePrice}
            placeholder={t('enter_wholesale_price')} 
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>{t('weight')}</Text>
          <TextInput style={styles.input} value={weight} onChangeText={setWeight} placeholder={t('enter_weight')} keyboardType="decimal-pad" />
          <View style={{ zIndex: 3000 }}>
            <DropDownPicker
              open={weightOpen}
              value={weightUnit}
              items={weightItems}
              setOpen={setWeightOpen}
              setValue={setWeightUnit}
              setItems={setWeightItems}
              placeholder={t('select_unit')}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              listMode="SCROLLVIEW"
            />
          </View>

          <Text style={styles.label}>{t('volume')}</Text>
          <TextInput style={styles.input} value={volume} onChangeText={setVolume} placeholder={t('enter_volume')} keyboardType="decimal-pad" />
          <View style={{ zIndex: 2000 }}>
            <DropDownPicker
              open={volumeOpen}
              value={volumeUnit}
              items={volumeItems}
              setOpen={setVolumeOpen}
              setValue={setVolumeUnit}
              setItems={setVolumeItems}
              placeholder={t('select_unit')}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              listMode="SCROLLVIEW"
            />
          </View>

          <Text style={styles.label}>{t('category')}</Text>
          <View style={{ zIndex: 1000 }}>
            <DropDownPicker
              open={categoryOpen}
              value={category}
              items={categories}
              setOpen={setCategoryOpen}
              setValue={setCategory}
              setItems={setCategories}
              placeholder={t('select_category')}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              listMode="SCROLLVIEW"
            />
          </View>

 {/* << NOVO: Switch za IsAvailable >> */}
          <View style={styles.switchContainer}>
            <Text style={styles.label}>{t('is_available')}</Text>
            <Switch
              trackColor={{ false: "#d1d5db", true: "#a7f3d0" }} // Svetlije boje
              thumbColor={isAvailable ? "#10b981" : "#f9fafb"}   // Zelena/Svetlo siva
              ios_backgroundColor="#e5e7eb"
              onValueChange={setIsAvailable}
              value={isAvailable}
            />
          </View>

          <Text style={styles.label}>{t('images')}</Text>
          <TouchableOpacity style={styles.imageButton} onPress={pickImages}>
            <Text style={styles.imageButtonText}>{t('select_images')}</Text>
          </TouchableOpacity>

          <View style={styles.imagePreviewContainer}>
          {images.length > 0 ? (
            <View style={styles.imagePreviewContainer}>
              {images.map((image, index) => (
                <Image key={index} source={{ uri: image.uri }} style={styles.imagePreview} />
              ))}
            </View>
          ) : (
            <Text>{t('No Images Selected')}</Text>
          )}
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <FontAwesome name="save" size={18} color="#fff" />
                <Text style={styles.buttonText}> {t('save_changes')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>)}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingBottom: 40,
    paddingTop: 80,
  },
  topSpace: {
    height: 80,
    justifyContent: 'center',
  },
  topButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  topRightButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4E8D7C',
    textAlign: 'center',
    marginTop: 20,
  },
  topButton: {
    backgroundColor: '#22C55E',
    padding: 8,
    borderRadius: 8,
  },
  topButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  form: {
    padding: 16,
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  languageButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f1f5f9',
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4E8D7C',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  picker: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    width: "30%",
    height: '75%',
  },
  pickerFull: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 16,
  },
  imageButton: {
    backgroundColor: '#4E8D7C',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  languageText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4E8D7C',
    marginTop: 2,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 10,
  },
  imagePreview: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 10,
  },
  submitButton: {
    backgroundColor: '#4E8D7C',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  dropdown: {
    borderRadius: 8,
    borderColor: '#ccc',
    backgroundColor: '#f7f7f7',
    marginBottom: 16,
  },
  dropdownContainer: {
    borderColor: '#ccc',
    backgroundColor: '#fff',
    zIndex: 1000,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20, // Dodaj malo veći razmak ispod switcha
    paddingVertical: 10, // Vertikalni padding za bolji izgled
     borderTopWidth: 1,
   borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  loadingOverlay: {
    position: 'absolute', // Da prekrije ceo ekran
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center', // Centriraj indikator horizontalno
    justifyContent: 'center', // Centriraj indikator vertikalno
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Poluprovidna bela pozadina
    zIndex: 9999, // Osiguraj da je iznad ostalih elemenata
},
  
});
