import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FontAwesome } from '@expo/vector-icons';
import styles from '../styles';
import React, { useState, useEffect } from 'react';
import api from '../defaultApi'
import { useNavigation, NavigationProp } from '@react-navigation/native';

interface Store {
  id: number;
  name: string;
  address: string;
  description: string;
  isActive: boolean;
  categoryName: string;
}

type RootStackParamList = {
  '../(CRUD)/prodavnica_detalji': { store: Store };
};

export default function StoresScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState([]);

  // API za dohvacanje svih prodavnica
  useEffect(() => {
    async function fetchStores() {
      try {
        const response = await api.get('/Stores'); 
        console.log(response);
        // filtrira samo aktivne
        const activeStores = response.data.filter((store: Store) => store.isActive === true);
        setStores(activeStores); 
      } catch (error) {
        console.error('Error fetching stores:', error); 
      } finally {
        setLoading(false); 
      }
    }

    fetchStores();
  }, []);

  const renderStoreCard = ({ item }: { item: Store }) => (
  <TouchableOpacity style={styles.storeCard} onPress={() => router.push(`/(CRUD)/prodavnica_detalji?store=${JSON.stringify(item)}`)}>
      {/*<Image source={{ uri: item.image }} style={styles.storeImage} />*/}
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{item.name}</Text>
        <Text style={styles.storeAddress}>{item.categoryName}</Text>
        <Text style={styles.storeAddress}>{item.description}</Text>
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
    <View style={{ flex: 1 }}>
      {/* Fiksirano dugme za jezik */}
      <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
        <FontAwesome name="language" size={18} color="#4E8D7C" />
        <Text style={styles.languageText}>{i18n.language.toUpperCase()}</Text>
      </TouchableOpacity>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={true}
      >
        <View style={[styles.container, { paddingTop: 40 }]}>
          <View style={styles.titleSpacing} />
          <Text style={styles.title}>{t('my_stores')}</Text>

          <TouchableOpacity 
            style={styles.createButton} 
            onPress={handleSave} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <FontAwesome name="plus" size={14} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.createButtonText}>{t('add_a_new_store')}</Text>
              </>
            )}
          </TouchableOpacity>

          <FlatList
            data={stores}
            renderItem={renderStoreCard}
            keyExtractor={(item: Store) => item.id.toString()}
            contentContainerStyle={[styles.listContainer, { paddingBottom: 100 }]} 
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </View>
  );
}
