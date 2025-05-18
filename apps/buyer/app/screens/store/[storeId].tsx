import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Button, ActivityIndicator, StyleSheet, Touchable, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams, Tabs } from 'expo-router';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
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
  const navigation = useNavigation();

  const handleConversationPress = async () => {
    const requestBody = {
      storeId: Number(storeId),
      orderId: null,
      productId: null,
    };
    
    const authToken = await SecureStore.getItemAsync('auth_token');

    console.log(JSON.stringify(requestBody));
    
    const response = await fetch(`${baseURL}/api/Chat/conversations/find-or-create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Dodajte Autorizacioni header ako vaš API to zahteva
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log(response);

    // 3. Obradi odgovor od API-ja
    if (!response.ok) {
      // Ako HTTP status nije 2xx, nešto nije u redu
      const errorText = await response.text(); // Pokušajmo pročitati odgovor kao tekst
//       console.error('API Error Response Status:', response.status);
//       console.error('API Error Response Body:', errorText);
         Alert.alert(
           t('Error'),
           t(errorText) // Pružite korisniku specifičnu poruku
         );
      throw new Error(`Greška pri pronalaženju/kreiranju konverzacije: ${response.status}`);
    }

    const data = await response.json(); // Parsiraj JSON odgovor

    console.log("Chat? ", data);

    // Navigate using expo-router
    // The path `/chat/${item.id}` should correspond to a file like `app/chat/[conversationId].js` or `app/chat/[id].js`
    // Params passed here will be available in ChatScreen via `useLocalSearchParams`

      router.push({
      pathname: `(tabs)/chat/${data.id}`, // Dynamic route using conversation ID
      params: {
        // conversationId is already part of the path, but you can pass it explicitly if needed
        // or if your ChatScreen expects it as a query param rather than a path segment.
        // For this example, assuming [conversationId].js handles the path segment.
        sellerUsername: data.sellerUsername,
        buyerUserId: data.buyerUserId,
        buyerUsername: data.buyerUserName,
        otherUserAvatar: data.otherUserAvatar, // || DEFAULT_AVATAR,
        // MOCK_CURRENT_USER_ID is handled within ChatScreen's self-contained logic
      },
    });
  };

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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{store?.name}</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>
        {/* STORE INFO CARD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('details')}</Text>
          <View style={styles.infoRow}>
            <Ionicons name="map" size={18} color="#4e8d7c" style={styles.icon} />
            <Text style={styles.infoText}>{store?.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <FontAwesome name="info-circle" size={18} color="#4e8d7c" style={styles.icon} />
            <Text style={styles.infoText}>{store?.description}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="pricetags-outline" size={18} color="#4e8d7c" style={styles.icon} />
            <Text style={styles.infoText}>{store?.categoryName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#4e8d7c" style={styles.icon} />
            <Text style={styles.infoText}>
              {store?.placeName}, {store?.regionName}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <FontAwesome name={store?.isActive ? 'check-circle' : 'times-circle'} size={18} color="#4e8d7c" style={styles.icon} />
            <Text style={styles.infoText}>{store?.isActive ? 'Active' : 'Inactive'}</Text>
          </View>
          <TouchableOpacity style={styles.chatButton} onPress={handleConversationPress}>
            <FontAwesome name="comments" size={22} color="#fff" />
          </TouchableOpacity>

          {/* AVG RATING */}
          <View style={[styles.cardSubSection, styles.avgRating]}>
            <Text style={styles.subTitle}>{t('average_rating')}</Text>
            {rating !== null && renderStars(rating.rating)}
          </View>
        </View>
        

        {/* REVIEWS */}
        <Text style={styles.sectionHeader}>{t('reviews')}</Text>
        {reviews.map(({ review, response }) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <FontAwesome name="user-circle" size={20} color="#4e8d7c" />
              <Text style={styles.reviewer}>{review.buyerId}</Text>
              <Text style={styles.reviewDate}>{formatted(new Date(review.dateTime))}</Text>
            </View>
            {renderStars(review.rating.toString())}
            <Text style={styles.comment}>{review.comment}</Text>

            {response && (
              <View style={styles.responseCard}>
                <Text style={styles.responseLabel}>{t('response')}</Text>
                <Text style={styles.responseText}>{response.response}</Text>
                <Text style={styles.responseDate}>{formatted(new Date(response.dateTime))}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// keep your renderStars and formatted functions as-is

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#4e8d7c',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backBtn: {
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginRight: 32,
  },
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 32 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#4e8d7c',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  icon: {
    marginTop: 2,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: '#444',
    lineHeight: 20,
  },
  cardSubSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  avgRating: {
justifyContent: 'center',
    alignItems: 'center',
    
    
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },

  chatButton: {
    position: 'absolute',
    right: 16,
    bottom: -24,
    backgroundColor: '#4e8d7c',
    padding: 14,
    borderRadius: 30,
    // shadow
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4e8d7c',
    marginBottom: 12,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewer: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  reviewDate: {
    fontSize: 12,
    color: '#888',
  },
  comment: {
    fontSize: 14,
    color: '#444',
    marginVertical: 8,
    lineHeight: 20,
  },
  responseCard: {
    backgroundColor: '#eef5f2',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  responseLabel: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#4e8d7c',
  },
  responseText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  responseDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    textAlign: 'right',
  },
  starContainer: { flexDirection: 'row', marginVertical: 4 },
    star: { marginRight: 4 },
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
});