// screens/orders/review.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { t } from 'i18next';
import * as SecureStore from 'expo-secure-store';

const USE_DUMMY_DATA = true;

export default function ReviewScreen() {
  const { orderId, storeId } = useLocalSearchParams();
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleRating = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmitReview = async () => {
    if (!rating) {
      setError(t('review_error_rating', 'Molimo odaberite ocjenu.'));
      return;
    }

    setError('');

    const reviewData = {
      storeId: storeId,
      orderId: orderId,
      rating: rating,
      comment: comment,
    };

    console.log('Podaci za recenziju:', reviewData);

    if (!USE_DUMMY_DATA) {
      try {
        const authToken = await SecureStore.getItemAsync('auth_token');
        const response = await fetch('https://bazaar-system.duckdns.org/api/Review', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(reviewData),
        });

        if (response.ok) {
          console.log('Recenzija uspješno poslana!');
          router.back(); // vracanje na prethodni ekran
        } else {
          const errorBody = await response.text();
          console.error('Greška pri slanju recenzije:', response.status, errorBody);
          setError(t('review_error_submit', 'Došlo je do greške pri slanju recenzije.'));
        }
      } catch (error: any) {
        console.error('Greška pri komunikaciji s API-jem:', error.message);
        setError(t('review_error_network', 'Problem s mrežom. Pokušajte ponovo.'));
      }
    } else {
      // simulacija slanja s dummy
      console.log('Recenzija uspješno poslana (dummy)!');
      router.back();
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleRating(i)}
          style={styles.starButton}
        >
          <FontAwesome
            name={rating !== null && rating >= i ? 'star' : 'star-o'}
            size={30}
            color="#ffd700"
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.ratingContainer}>{stars}</View>;
  };

  return (
    <View style={styles.container}>

      <View style={styles.content}>
        <Text style={styles.label}>{t('rating')}:</Text>
        {renderStars()}

        <Text style={styles.label}>{t('comment')}:</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={4}
          value={comment}
          onChangeText={setComment}
          placeholder={t('comment_placeholder')}
          textAlignVertical="top"
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReview}>
          <Text style={styles.submitButtonText}>{t('submit_review')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#4e8d7c',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 21,
    backgroundColor: '#4e8d7c',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
  backButton: {
    marginRight: 15,
  },
  headerText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
    flex: 1,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 20,
    color: '#4e8d7c',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-around',
  },
  starButton: {},
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4e8d7c',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});