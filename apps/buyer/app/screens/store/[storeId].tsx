import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Button, ActivityIndicator, StyleSheet, Touchable, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams, Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { t } from 'i18next';
import * as SecureStore from 'expo-secure-store';
import { baseURL, USE_DUMMY_DATA } from 'proba-package';

interface ReviewResponse {
  id: number;
  reviewId: number;
  response: string;
  dateTime: string;
}

interface Review {
  id: number;
  buyerId: string;
  storeId: number;
  orderId: number;
  rating: number;
  comment: string;
  dateTime: string;
  isApproved: boolean;
}

// Store details
interface Store {
  id: number;
  name: string;
  address: string;
  description: string;
  isActive: boolean;
  categoryName: string;
  placeName: string;
  regionName: string;
}

interface ReviewResponseContainer {
  review: Review,
  response: ReviewResponse | null
}

interface Rating {
  rating: string
}
  
// Toggle this to switch between dummy data and real API calls
// const USE_DUMMY_DATA = false;

// Dummy data based on provided JSON specs
const DUMMY_STORE = {
  id: 1,
  name: 'Demo Store',
  address: '123 Main St',
  description: 'This is a demo store used for previews.',
  isActive: true,
  categoryName: 'Electronics',
  placeName: 'City Center',
  regionName: 'Demo Region',
};

const DUMMY_REVIEWS : ReviewResponseContainer[] = [
  {
    review: {
    id: 101,
    buyerId: 'alice',
    storeId: 1,
    orderId: 5001,
    rating: 4,
    comment: 'Great service!',
    dateTime: '2025-04-01T10:30:00Z',
    isApproved: true
    },
    response: {
      id: 201,
      reviewId: 101,
      response: 'Thanks for your feedback!',
      dateTime: '2025-04-02T08:00:00Z',
    },
  },
  {
    review: {id: 102,
    buyerId: 'bob',
    storeId: 1,
    orderId: 5002,
    rating: 5,
    comment: 'Excellent products.',
    dateTime: '2025-04-05T14:20:00Z',
    isApproved: true
  },
    response: null,
  },
  {
    review: {id: 103,
    buyerId: 'alice',
    storeId: 1,
    orderId: 5001,
    rating: 3,
    comment: 'Great service!',
    dateTime: '2025-04-01T10:30:00Z',
    isApproved: true},
    response: {
      id: 202,
      reviewId: 103,
      response: 'Thanks for your feedback!',
      dateTime: '2025-04-02T08:00:00Z',
    },
  },
  {
    review: {id: 104,
    buyerId: 'bob',
    storeId: 1,
    orderId: 5002,
    rating: 3,
    comment: 'Excellent products.',
    dateTime: '2025-04-05T14:20:00Z',
    isApproved: true},
    response: null,
  },
  {
    review: {id: 105,
    buyerId: 'alice',
    storeId: 1,
    orderId: 5001,
    rating: 4,
    comment: 'Great service!',
    dateTime: '2025-04-01T10:30:00Z',
    isApproved: true},
    response: {
      id: 203,
      reviewId: 105,
      response: 'Thanks for your feedback!',
      dateTime: '2025-04-02T08:00:00Z',
    },
  },
  {
    review: {id: 106,
    buyerId: 'bob',
    storeId: 1,
    orderId: 5002,
    rating: 2.5,
    comment: 'Excellent products.',
    dateTime: '2025-04-05T14:20:00Z',
    isApproved: true},
    response: null,
  },
];

function renderStars(ratingString: string) {
    const rating = parseFloat(ratingString);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<FontAwesome key={i} name="star" size={16} color="#ffd700" style={styles.star} />);
      } else if (rating >= i - 0.5) {
        stars.push(<FontAwesome key={i} name="star-half-o" size={16} color="#ffd700" style={styles.star} />);
      } else {
        stars.push(<FontAwesome key={i} name="star-o" size={16} color="#ffd700" style={styles.star} />);
      }
    }
    return <View style={styles.starContainer}>{stars}</View>;
  }

export default function StoreScreen() {
  const router = useRouter();
  const { storeId } = useLocalSearchParams();

  const [store, setStore] = useState<Store | null>(null); 
  const [reviews, setReviews] = useState<ReviewResponseContainer[]>([]);  
  const [rating, setRating] = useState<Rating | null>(null);
  const [loading, setLoading] = useState(true);

  const dateFmt = new Intl.DateTimeFormat('de-DE', {
    day:   '2-digit',
    month: '2-digit',
    year:  'numeric',
  });
  
  const timeFmt = new Intl.DateTimeFormat('de-DE', {
    hour:   '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const formatted = (raw:Date) => `${dateFmt.format(raw)}. ${timeFmt.format(raw)}`;

  useEffect(() => {
    async function fetchData() {
      if (USE_DUMMY_DATA) {
        setStore(DUMMY_STORE);
        setReviews(DUMMY_REVIEWS);
        const avgRating = (
          DUMMY_REVIEWS.reduce((sum, r) => sum + r.review.rating, 0) / DUMMY_REVIEWS.length
        ).toFixed(1);
        setRating({rating: avgRating});
      } else {
        try {
          const authToken = await SecureStore.getItemAsync('auth_token');
          if (!authToken) {
            throw new Error('Authentication token not found.');
          }

          const [storeRes, reviewsRes, ratingRes] = await Promise.all([
            fetch(baseURL + `/api/Stores/${storeId}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              }
            }),
            fetch(baseURL + `/api/Review/store/${storeId}/approved`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              }
            }),
            fetch(baseURL + `/api/Review/store/${storeId}/rating`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              }
            })
          ]);

          console.log(baseURL + `/api/Stores/${storeId}`);
          console.log(storeRes);
          console.log(storeRes.body);


          const storeData = await storeRes.json();
          const reviewsData = await reviewsRes.json();
          const ratingData = await ratingRes.json();

          console.log(storeData);
          console.log(reviewsData);
          console.log(ratingData);

          setStore(storeData);
          // setReviews(
          //   reviewsData.map((r: { reviewResponse: any; }) => ({
          //     ...r,
          //     response: r.reviewResponse || null,
          //   }))
          // );
          setReviews(reviewsData);
          setRating(ratingData);
          console.log("Valja?");
          console.log(reviews[0]);
        } catch (error) {
          console.error('Error fetching store data:', error);
        }
      }
      setLoading(false);
    }

    fetchData();
  }, [storeId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', left: 21, top: 21 }}>
                    <FontAwesome name="arrow-left" size={21} color="white" />
                </TouchableOpacity>
              <Text style={styles.headerText}>{store?.name}</Text>
            </View>
          </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>      
        {/* Store Details */}
        <View style={[styles.section, styles.main]}>
          <Text style={styles.sectionTitle}>{t('details')}</Text>
          <Text style={styles.plain}>{t('address')}: {store?.address}</Text>
          <Text style={styles.plain}>{t('description')}: {store?.description}</Text>
          <Text style={styles.plain}>{t('category')}: {store?.categoryName}</Text>
          <Text style={styles.plain}>{t('location')}: {store?.placeName}, {store?.regionName}</Text>
          <Text style={styles.plain}>{t('status')}: {store?.isActive ? 'Active' : 'Inactive'}</Text>

            <View style={[styles.section, styles.avgrating]}>
                <Text style={styles.sectionTitle}>{t('average_rating')}</Text>
                {rating !== null && renderStars(rating.rating)}
            </View>
        </View>

        

        {/* Reviews List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('reviews')}</Text>
          {reviews.map(review => (
            <View key={review.review.id} style={styles.reviewCard}>
              <Text style={styles.reviewBuyer}>{review.review.buyerId}</Text>
              {renderStars(review.review.rating.toString())}
              <Text style={[styles.plain, styles.bold]}>{t('comment')}: {review.review.comment}</Text> 
              <Text style={styles.responseDate}>{formatted(new Date(review.review.dateTime))}</Text>
              {review.response && (
                <View style={styles.responseCard}>
                  <Text style={styles.responseLabel}>{t('response')}:</Text>
                  <Text>{review.response.response}</Text>
                  <Text style={styles.responseDate}>{formatted(new Date(review.response.dateTime))}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#4e8d7c',
    },
    headerContainer: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4e8d7c',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 4,
    },
    headerText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 10 },
    section: { marginBottom: 20, fontSize: 20},
    sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 5, color: '#4e8d7c' },
    rating: { fontSize: 24, fontWeight: 'bold' },
    reviewCard: { padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 15, marginBottom: 10 },
    reviewBuyer: { fontWeight: 'bold', fontSize: 17 },
    responseCard: { marginTop: 10, padding: 8, backgroundColor: '#eef', borderRadius: 11 },
    responseLabel: { fontWeight: 'bold' },
    responseDate: { marginTop: 4, fontSize: 12, color: '#555' },
    starContainer: { flexDirection: 'row', marginVertical: 4 },
    star: { marginRight: 4 },
    main: { 
        padding: 20, 
        backgroundColor: '#fff', 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.2, 
        shadowRadius: 2, 
        elevation: 4,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 19,
        fontSize: 22,
    },
    avgrating: {
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 15,
        marginBottom: 10,
        marginTop: 20,
        alignItems: 'center',
    },
    plain: { fontSize: 16, marginBottom: 1 },
    bold: { fontWeight: 'bold' },
});