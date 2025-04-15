import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FontAwesome } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import styles from '../styles';
import { apiFetchActiveStores } from '../api/storeApi';
import { Store } from '../types/prodavnica';

export default function StoresScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    async function getStores() {
      setLoading(true);
      const activeStores = await apiFetchActiveStores();
      setStores(activeStores);
      setLoading(false);
    }
    getStores();
  }, []);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'bs' : 'en');
  };

  const handleStoreDetails = () => {
    const store = stores[0];
    router.push(`/(CRUD)/prodavnica_detalji?store=${JSON.stringify(store)}`);
  };

  const handleViewOrders = () => {
    router.push('../(CRUD)/pregled_narudzbi');
  };

  const handleCreateStore = () => {
    router.push('../(CRUD)/postavke_prodavnice');
  };

  return (
    <View style={styles.container}>
      {/* Jezik dugme */}
      <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
        <FontAwesome name="language" size={18} color="#4E8D7C" />
        <Text style={styles.languageText}>{i18n.language.toUpperCase()}</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={true}>
        <View style={styles.listContainer}>
          <Text style={styles.title}>{t('my_stores')}</Text>

          {stores.length === 0 ? (
            // 🔁 Seller nema trgovinu → prikazujemo dugme za kreiranje
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateStore}
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
          ) : (
            // ✅ Seller ima trgovinu → prikazujemo prodavnicu + pregled narudžbi
            <>
              {/* Sekcija: Detalji prodavnice */}
              <View style={styles.section}>
                <TouchableOpacity style={styles.storeCard} onPress={handleStoreDetails}>
                  <View style={styles.storeInfo}>
                    <Text style={styles.storeName}>{stores[0].name}</Text>
                    <Text style={styles.storeAddress}>{stores[0].categoryName}</Text>
                    <Text style={styles.storeAddress}>{stores[0].description}</Text>
                    <Text style={styles.storeAddress}>{stores[0].address}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Sekcija: Pregled narudžbi */}
              <View style={styles.section}>
                <TouchableOpacity style={styles.storeCard} onPress={handleViewOrders}>
                  <View style={styles.storeInfo}>
                    <Text style={styles.storeName}>{t('view_orders')}</Text>
                    <Text style={styles.storeAddress}>
                      {t('view_orders_description') || 'View all orders for this store'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
