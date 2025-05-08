import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Dimensions, ScrollView, RefreshControl, Text } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { apiFetchStoreReviews } from '../api/reviewApi'; 
import { Review } from '../types/review'; 
import LanguageButton from '@/components/ui/buttons/LanguageButton';
import ReviewCard from '@/components/ui/cards/ReviewCard'; 

const { height } = Dimensions.get('window');

export default function StoreReviewsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const storeId = params.storeId ? Number(params.storeId) : null;
  const storeName = params.storeName ? decodeURIComponent(params.storeName as string) : t('store_reviews');

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: storeName });
  }, [navigation, storeName]);

  const fetchReviews = useCallback(async () => {
    if (!storeId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const fetchedReviews = await apiFetchStoreReviews(storeId);
      fetchedReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReviews(fetchedReviews);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [storeId]);

  useEffect(() => {
    setLoading(true);
    fetchReviews();
  }, [fetchReviews]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };

  const handleResponseSubmitted = (updatedReview: Review) => {
    setReviews(prevReviews =>
      prevReviews.map(r => (r.id === updatedReview.id ? updatedReview : r))
    );
  };

  if (loading && !refreshing) { 
    return (
      <View style={styles.centeredLoader}>
        <LanguageButton />
        <ActivityIndicator size="large" color="#4E8D7C" />
      </View>
    );
  }

  if (!storeId) {
    return (
        <View style={styles.centeredLoader}>
            <LanguageButton />
            <Text style={styles.errorText}>{t('store_id_missing')}</Text>
        </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <LanguageButton />
      <FlatList
        data={reviews}
        renderItem={({ item }) => (
          <ReviewCard review={item} onResponseSubmitted={handleResponseSubmitted} />
        )}
        keyExtractor={(item) => item.id.toString()}
        style={styles.scrollWrapper} 
        contentContainerStyle={styles.listContainer} 
        ListHeaderComponent={<View style={{ height: height * 0.09 }} />} // Da content ne ide ispod LanguageButton-a i headera
        ListEmptyComponent={
          !loading ? ( // Pokaži samo ako nije učitavanje i nema review-a
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('no_reviews_yet')}</Text> {/* Treba prevod */}
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#4E8D7C']} tintColor={'#4E8D7C'}/>
        }
      />
    </View>
  );
}


const styles = StyleSheet.create({
  scrollWrapper: {
    flex: 1,
    backgroundColor: '#F2F2F7', 
  },
  listContainer: {
    paddingHorizontal: 16, 
    paddingTop: 10, 
    paddingBottom: height * 0.1,
  },
  centeredLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});