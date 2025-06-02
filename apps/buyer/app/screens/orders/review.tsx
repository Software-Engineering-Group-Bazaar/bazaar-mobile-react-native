// screens/orders/review.tsx
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView , Alert, Dimensions, Platform} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { t } from 'i18next';
import * as SecureStore from 'expo-secure-store';
import Tooltip from 'react-native-walkthrough-tooltip'; // Import Tooltip
import { Ionicons } from '@expo/vector-icons';

import Constants from 'expo-constants';

const baseURL = Constants.expoConfig!.extra!.apiBaseUrl as string;
const USE_DUMMY_DATA = Constants.expoConfig!.extra!.useDummyData as boolean;


// const USE_DUMMY_DATA = true;

export default function ReviewScreen() {
  const { orderId, storeId } = useLocalSearchParams();
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);

  const commentInputRef = useRef(null);
  const submitButtonRef = useRef(null);

  const startWalkthrough = () => {
    setShowWalkthrough(true);
    setWalkthroughStep(1); // Počinjemo od prvog koraka (input za komentar)
  };

  const goToNextStep = () => {
    setWalkthroughStep(prevStep => prevStep + 1);
  };

  const goToPreviousStep = () => {
    setWalkthroughStep(prevStep => prevStep - 1);
  };

  const finishWalkthrough = () => {
    setShowWalkthrough(false);
    setWalkthroughStep(0);
  };

  const handleRating = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmitReview = async () => {
    if (!rating) {
      setError(t('review_error_rating', 'Molimo odaberite ocjenu.'));
      return;
    }
    if(comment.length<4 || comment.length>1000){
      setError(t('review_error_comment'));
      return
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
        const response = await fetch(baseURL + '/api/Review', {
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
          if (response.status === 409) {
            Alert.alert(
              t('review_already_exists_title', 'Recenzija već postoji'),
              t('review_already_exists_message', 'Već ste poslali recenziju za ovu narudžbu.')
              );}
            else {
              setError(t('review_error_submit', 'Došlo je do greške pri slanju recenzije.'));
            }
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
    <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.headerContainer}>
            {/* Lijeva strana - prazna ili za back dugme */}
            <View style={styles.sideContainer} /> 
            
            {/* Naslov headera */}
            <View style={styles.titleContainer}>
              <Text style={styles.headerText} numberOfLines={1} ellipsizeMode="tail">
                {t('review')}
              </Text>
            </View>
            
            {/* Desna strana - dugme za pomoć */}
            <View style={[styles.sideContainer, styles.rightSideContainer]}>
              <TouchableOpacity onPress={startWalkthrough} style={styles.iconButton}>
                <Ionicons name="help-circle-outline" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
    <View style={styles.container}>

      <View style={styles.content}>
        <Text style={styles.label}>{t('rating')}:</Text>
        {renderStars()}

        <Text style={styles.label}>{t('comment')}:</Text>

         {/* <-- TOOLTIP ZA INPUT KOMENTARA --> */}
        <Tooltip
          isVisible={showWalkthrough && walkthroughStep === 1}
          content={
            <View style={styles.tooltipContent}>
              <Text style={{ fontSize: 16, marginBottom: 10 }}>
                {t('tutorial_review_comment_input')}
              </Text>
              <View style={styles.tooltipButtonContainer}>
                <TouchableOpacity
                  style={[styles.tooltipButtonBase, styles.tooltipNextButton]}
                  onPress={goToNextStep}
                >
                  <Text style={styles.tooltipButtonText}>{t('next')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          placement="top" // Ili "top" ovisno gdje želite da se tooltip pojavi
          onClose={finishWalkthrough}
          tooltipStyle={{ width: Dimensions.get('window').width * 0.8 }}
          useReactNativeModal={true}
          arrowSize={{ width: 16, height: 8 }}
          showChildInTooltip={true}
        >
        <TextInput
          style={styles.input}
          ref={commentInputRef}
          multiline
          numberOfLines={4}
          value={comment}
          onChangeText={setComment}
          placeholder={t('comment_placeholder')}
          textAlignVertical="top"
        />
        </Tooltip>

        {error && <Text style={styles.error}>{error}</Text>}

        {/* <-- TOOLTIP ZA SUBMIT DUGME --> */}
        <Tooltip
          isVisible={showWalkthrough && walkthroughStep === 2}
          content={
            <View style={styles.tooltipContent}>
              <Text style={{ fontSize: 16, marginBottom: 10 }}>
                {t('tutorial_review_submit_button')}
              </Text>
              <View style={styles.tooltipButtonContainer}>
                <TouchableOpacity
                  style={[styles.tooltipButtonBase, styles.tooltipPrevButton]}
                  onPress={goToPreviousStep}
                >
                  <Text style={styles.tooltipButtonText}>{t('previous')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tooltipButtonBase, styles.tooltipFinishButton]}
                  onPress={finishWalkthrough}
                >
                  <Text style={styles.tooltipButtonText}>{t('finish')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          placement="top" // Ili "bottom"
          onClose={finishWalkthrough}
          tooltipStyle={{ width: Dimensions.get('window').width * 0.8 }}
          useReactNativeModal={true}
          arrowSize={{ width: 16, height: 8 }}
          showChildInTooltip={true}
        >
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReview}>
          <Text style={styles.submitButtonText}>{t('submit_review')}</Text>
        </TouchableOpacity>
        </Tooltip>
      </View>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
      backgroundColor: '#4e8d7c',
      flex: 1, // Omogućava da SafeAreaView zauzme cijeli ekran
      marginTop:30
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#4e8d7c',
      paddingVertical: Platform.OS === 'ios' ? 12 : 18, // Prilagođeno za iOS/Android
      paddingHorizontal: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 4,
    },
    sideContainer: {
      width: 40, // Održava razmak na lijevoj strani za potencijalno dugme nazad
      justifyContent: 'center',
    },
    rightSideContainer: {
      alignItems: 'flex-end', // Poravnava dugme za pomoć desno
    },
    titleContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 5,
    },
    headerText: {
      color: '#fff',
      fontSize: 22,
      fontWeight: 'bold',
      letterSpacing: 1,
      textAlign: 'center',
    },
    iconButton: {
      padding: 5, // Dodao padding za lakši klik
    },
  tooltipButtonBase: { 
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25, // Više zaobljeno
        marginHorizontal: 5,
        elevation: 2, // Mala sjena
        minWidth: 80, // Minimalna širina
        alignItems: 'center', // Centriraj tekst
    },
  tooltipContent: {
    alignItems: 'center',
    padding: 5,
  },
  tooltipButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  tooltipNextButton: {
    backgroundColor: '#4E8D7C',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  tooltipPrevButton: {
    backgroundColor: '#4E8D7C', 
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  tooltipFinishButton: {
    backgroundColor: '#4E8D7C',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  tooltipButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#4E8D7C',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  backButton: {
    marginRight: 15,
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
    alignSelf:'stretch'
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
    alignSelf:'stretch'
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