import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const weightUnits = ['g', 'kg', 'oz', 'lb'];
const volumeUnits = ['ml', 'L', 'fl oz'];

export default function AddProductScreen() {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState(weightUnits[0]);
  const [volume, setVolume] = useState('');
  const [volumeUnit, setVolumeUnit] = useState(volumeUnits[0]);
  const [categories, setCategories] = useState<string[]>([]); // array of strings
  const [category, setCategory] = useState<string>('');       // selected category
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  /////////// Fja za odabir vise slika
  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImages(result.assets.map(asset => asset.uri));
    }
  };

  /////////////// API pozivi za dohvacanje kategorija
  const apiFetchCategoriesAsync = async () => {
    try {
      const response = await fetch('http://10.0.2.2:5054/api/Store/categories');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: { id: string; name: string }[] = await response.json();
      const names = data.map(category => category.name);
      setCategories(names);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  apiFetchCategoriesAsync();

  //////////// POST zahtjev za dodavanje proizvoda
  const handleSave = async () => {
      if (!name.trim() || !price.trim() || !weight.trim() || !volume) {
        Alert.alert(t('error'), t('fill_all_fields'));
        return;
      }

      setLoading(true);

      try {
        // 👇 OVDJE DOLAZI POZIV NA BACKEND - API /api/store #44
        // const payload = {
        //   name,
        //   address,
        //   description,
        //   storeCategoryId: selectedCategoryId,
        //   imageBase64: image, // ako backend podržava slanje slike kao base64
        // };
        // const response = await apiCreateStoreAsync(payload);
        // Alert.alert(t('success'), t('store_created_successfully'));
      

        ///pr umjesto ovog iznad
        Alert.alert(t('success'), t('store_updated'));
      } catch (error) {
        console.error(error);
        Alert.alert(t('error'), t('something_went_wrong'));
      } finally {
        setLoading(false);
      }
    };

    // Za ispravan ispis labele
    const navigation = useNavigation();
    useEffect(() => {
      navigation.setOptions({
        title: 'Kreiraj novi proizvod', 
      });
    }, [navigation]);

    // Za promjenu jezika
    const toggleLanguage = () => {
      i18n.changeLanguage(i18n.language === 'en' ? 'bs' : 'en');
    };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>

      <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
        <FontAwesome name="language" size={18} color="#4E8D7C" />
        <Text style={styles.languageText}>{i18n.language.toUpperCase()}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{t('add_a_product')}</Text>

      <View style={styles.form}>
        <Text style={styles.label}>{t('product_name')}</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={t('enter_product_name')}
        />

        <Text style={styles.label}>{t('price')}</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder={t('enter_price')}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>{t('weight')}</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.flex1]}
            value={weight}
            onChangeText={setWeight}
            placeholder={t('enter_weight')}
            keyboardType="decimal-pad"
          />
          <View style={styles.picker}>
            <Picker
              selectedValue={weightUnit}
              onValueChange={setWeightUnit}>
              {weightUnits.map(unit => (
                <Picker.Item key={unit} label={unit} value={unit} />
              ))}
            </Picker>
          </View>
        </View>

        <Text style={styles.label}>{t('volume')}</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.flex1]}
            value={volume}
            onChangeText={setVolume}
            placeholder={t('enter_volume')}
            keyboardType="decimal-pad"
          />
          <View style={styles.picker}>
            <Picker
              selectedValue={volumeUnit}
              onValueChange={setVolumeUnit}>
              {volumeUnits.map(unit => (
                <Picker.Item key={unit} label={unit} value={unit} />
              ))}
            </Picker>
          </View>
        </View>

        <Text style={styles.label}>{t('category')}</Text>
        <View style={styles.pickerFull}>
          <Picker
            selectedValue={category}
            onValueChange={setCategory}>

            <Picker.Item
              label={t('select_category')}
              value=""
              enabled={false}
              color="#555" 
            />

            {categories.map(cat => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>{t('images')}</Text>
        <TouchableOpacity style={styles.imageButton} onPress={pickImages}>
          <Text style={styles.imageButtonText}>{t('select_images')}</Text>
        </TouchableOpacity>

        <View style={styles.imagePreviewContainer}>
          {images.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.imagePreview} />
          ))}
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
    </ScrollView>
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
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
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
});
