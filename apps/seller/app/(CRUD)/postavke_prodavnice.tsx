import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from '@react-navigation/native';

// TODO: Kad backend bude spreman, otkomentarisati ove pozive
// import { apiGetStoreCategoriesAsync, apiCreateStoreAsync } from '../api/store';

export default function PostavkeProdavnice() {
  const { t, i18n } = useTranslation();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  /////////////////////////// privremeno tu
  const [categoryItems, setCategoryItems] = useState([
    { label: 'Pekara', value: '1' },
    { label: 'Zdrava hrana', value: '2' },
    { label: 'Mini market', value: '3' },
  ]);
  /////////////////////////// privremeno tu


  useEffect(() => {
    //  OVDJE DOLAZI POZIV NA BACKEND - API #45 za dohvat kategorija
    // async function fetchCategories() {
    //   try {
    //     const data = await apiGetStoreCategoriesAsync();
    //     const formatted = data.map(cat => ({ label: cat.name, value: cat.id }));
    //     setCategoryItems(formatted);
    //   } catch (error) {
    //     console.error('Error fetching categories:', error);
    //     Alert.alert(t('error'), t('something_went_wrong'));
    //   }
    // }
    // fetchCategories();
  }, []);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'bs' : 'en');
  };

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: 'Postavke prodavnice', 
    });
  }, [navigation]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !address.trim() || !description.trim() || !selectedCategoryId || !image) {
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

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
        <FontAwesome name="language" size={18} color="#4E8D7C" />
        <Text style={styles.languageText}>{i18n.language.toUpperCase()}</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <Text style={styles.title}>{t('store_settings')}</Text>

        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          ) : (
            <>
              <FontAwesome name="camera" size={24} color="#4E8D7C" />
              <Text style={styles.imagePickerText}>{t('upload_image')}</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <FontAwesome5 name="store" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={t('store_name')}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <FontAwesome name="map-marker" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={t('address')}
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <View style={styles.dropdownWrapper}>
          <DropDownPicker
            open={open}
            value={selectedCategoryId}
            items={categoryItems}
            setOpen={setOpen}
            setValue={setSelectedCategoryId}
            setItems={setCategoryItems}
            placeholder={t('select_category')}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            placeholderStyle={styles.dropdownPlaceholder}
            listMode="SCROLLVIEW"
          />
        </View>

        <View style={styles.inputContainer}>
          <FontAwesome name="file-text" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={t('description')}
            value={description}
            onChangeText={setDescription}
            multiline
          />
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
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 100,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4E8D7C',
    textAlign: 'center',
    marginBottom: 30,
  },
  imagePickerButton: {
    width: 200,
    height: 200,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    backgroundColor: '#f7f7f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  imagePickerText: {
    marginTop: 10,
    color: '#4E8D7C',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f7f7f7',
    marginBottom: 15,
    zIndex: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  dropdownWrapper: {
    width: '100%',
    zIndex: 1000,
    marginBottom: 15,
  },
  dropdown: {
    borderRadius: 8,
    borderColor: '#ccc',
    backgroundColor: '#f7f7f7',
  },
  dropdownContainer: {
    borderRadius: 8,
    borderColor: '#ccc',
  },
  dropdownPlaceholder: {
    color: '#999',
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
  languageButton: {
    position: 'absolute',
    top: 20,
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
  languageText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4E8D7C',
    marginTop: 2,
  },
});