import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import styles from '../styles'; 
import React, { useState } from 'react';

interface Store {
  id: string;
  name: string;
  address: string;
  description?: string;
  image: string;
}
  
// Mock data for stores
const mockStores: Store[] = [
  {
    id: '1',
    name: 'Green Market',
    address: '123 Main Street, City',
    description: 'Fresh organic produce and local goods.',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=500&q=80',
  },
  {
    id: '2',
    name: 'Fresh Foods',
    address: '456 Oak Avenue, Town',
    description: 'Quality groceries and fresh produce.',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&q=80',
  },
];

export default function StoresScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);

  const renderStoreCard = ({ item }: { item: Store }) => (
    <TouchableOpacity
      style={styles.storeCard}
      onPress={() => router.push(`/stores/${item.id}`)}>
      <Image source={{ uri: item.image }} style={styles.storeImage} />
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{item.name}</Text>
        <Text style={styles.storeAddress}>{item.address}</Text>
      </View>
    </TouchableOpacity>
  );

  const handleSave = () => {
    router.push('../(CRUD)/postavke_prodavnice'); 
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'bs' : 'en');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
        <FontAwesome name="language" size={18} color="#4E8D7C" />
        <Text style={styles.languageText}>{i18n.language.toUpperCase()}</Text>
      </TouchableOpacity>

      <View style={styles.titleSpacing} />
      <Text style={styles.title}>{t('my_stores')}</Text>
      <FlatList
        data={mockStores}
        renderItem={renderStoreCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity style={styles.imageButton} onPress={handleSave} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.buttonText}> {t('add_a_new_store')}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
