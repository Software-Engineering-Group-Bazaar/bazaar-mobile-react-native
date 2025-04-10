import { View, Text, Image, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

interface Store {
  id: string;
  name: string;
  address: string;
  description?: string;
  image: string;
}
  
// Mock data for stores
const Store =
  {
    id: '1',
    name: 'Green Market',
    address: '123 Main Street, City',
    description: 'Fresh organic produce and local goods.',
    categoryLabel: 'Market',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=500&q=80',
  }

export default function PregledProdavnice() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'bs' : 'en');
  };

  const handleSave = () => {
    router.push('../(CRUD)/dodaj_proizvod'); 
  };

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: 'Pregled prodavnice', 
    });
  }, [navigation]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>

        <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
          <FontAwesome name="language" size={18} color="#4E8D7C" />
          <Text style={styles.languageText}>{i18n.language.toUpperCase()}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{t('store_overview')}</Text>

        {Store.image ? (
          <Image source={{ uri: Store.image }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <FontAwesome name="image" size={40} color="#ccc" />
          </View>
        )}

        <View style={styles.infoBox}>
          <FontAwesome5 name="store" size={18} color="#4E8D7C" />
          <Text style={styles.label}>{t('store_name')}:</Text>
          <Text style={styles.value}>{Store.name}</Text>
        </View>

        <View style={styles.infoBox}>
          <FontAwesome name="map-marker" size={18} color="#4E8D7C" />
          <Text style={styles.label}>{t('address')}:</Text>
          <Text style={styles.value}>{Store.address}</Text>
        </View>

        <View style={styles.infoBox}>
          <FontAwesome name="tag" size={18} color="#4E8D7C" />
          <Text style={styles.label}>{t('category')}:</Text>
          <Text style={styles.value}>{Store.categoryLabel}</Text>
        </View>

        <View style={styles.infoBox}>
          <FontAwesome name="file-text" size={18} color="#4E8D7C" />
          <Text style={styles.label}>{t('description')}:</Text>
          <Text style={styles.value}>{Store.description}</Text>
        </View>

        <TouchableOpacity style={styles.imageButton} onPress={handleSave} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.buttonText}> {t('view_all_products')}</Text>
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
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  imageButton: {
    backgroundColor: '#4E8D7C',
    width: '100%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
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
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4E8D7C',
    marginBottom: 30,
    textAlign: 'center',
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: 10,
    marginBottom: 25,
  },
  placeholderImage: {
    width: 220,
    height: 220,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: '#f0f0f0',
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 5,
  },
  value: {
    fontSize: 16,
    color: '#4E8D7C',
    marginTop: 3,
  },
});
