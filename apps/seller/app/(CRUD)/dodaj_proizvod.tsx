import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useLocalSearchParams } from 'expo-router';
import { apiFetchCategories } from '../api/productApi'; 
import api from '../api/defaultApi'

const weightUnits = ['g', 'kg', 'oz', 'lb'];
const volumeUnits = ['ml', 'L', 'fl oz'];

export default function AddProductScreen() {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [volume, setVolume] = useState('');
  const [loading, setLoading] = useState(false);

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
  const [category, setCategory] = useState<number>(0);

  const [categories, setCategories] = useState<any[]>([]);
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const router = useRouter();
  const { storeId } = useLocalSearchParams();

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

  const handleSave = async () => {
    if (!name.trim() || !price.trim() || !weight.trim() || !volume.trim()) {
      Alert.alert(t('error'), t('fill_all_fields'));
      return;
    }
    const formData = new FormData();

    formData.append("Name", name);
    formData.append("ProductCategoryId", category.toString());
    formData.append("RetailPrice", parseFloat(price).toString());
    formData.append("WholesalePrice", parseFloat(price).toString());
    formData.append("Weight", parseFloat(weight).toString());
    formData.append("WeightUnit", weightUnit);
    formData.append("Volume", parseFloat(volume).toString());
    formData.append("VolumeUnit", volumeUnit);
    formData.append("StoreId", storeId.toString());
    
    images.forEach((image, index) => {
      const file = {
        uri: image.uri,
        name: `photo_${index}.jpg`,
        type: "image/jpeg",
      };
    
      formData.append("Files", file as any);
    });

    try {
    setLoading(true);
    const response = await api.post("/Catalog/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Access-Control-Allow-Origin": "*",
      },
    });

      console.log("Upload Success:", response.data);
      Alert.alert(t("success"), t("store_updated"));
      router.push(`./pregled_proizvoda?storeId=${storeId}`);
    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert(t("error"), t("something_went_wrong"));
    } finally {
      setLoading(false);
    }
  };

  const navigation = useNavigation();
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

      <KeyboardAwareScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{t('add_a_product')}</Text>

        <View style={[styles.form, { zIndex: 0 }]}>
          <Text style={styles.label}>{t('product_name')}</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder={t('enter_product_name')} />

          <Text style={styles.label}>{t('price')}</Text>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder={t('enter_price')} keyboardType="decimal-pad" />

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
      </KeyboardAwareScrollView>
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
});
