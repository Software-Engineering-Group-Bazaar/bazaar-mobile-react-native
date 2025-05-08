
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FontAwesome } from '@expo/vector-icons'; 
import { Review, SubmitResponsePayload } from '../../../app/types/review'; 
import { apiSubmitSellerResponse } from '../../../app/api/reviewApi';  

interface ReviewCardProps {
  review: Review;
  onResponseSubmitted: (updatedReview: Review) => void;
}

export default function ReviewCard({ review, onResponseSubmitted }: ReviewCardProps) {
  const { t } = useTranslation();
  const [responseText, setResponseText] = useState(review.sellerResponse?.text || '');
  const [isRespondingActive, setIsRespondingActive] = useState(!review.sellerResponse);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) {
      Alert.alert(t('error'), t('review_response_cannot_be_empty'));
      return;
    }
    setIsLoading(true);
    try {
      const updatedReview = await apiSubmitSellerResponse({ reviewId: review.id, responseText });
      if (updatedReview) {
        onResponseSubmitted(updatedReview);
     setIsRespondingActive(false); // da se sakrije forma poslije slanja
        Alert.alert(t('success'), t('review_response_submitted_successfully'));
      } else {
        Alert.alert(t('error'), t('review_failed_to_submit_response'));
      }
    } catch (error) {
      console.error("Error submitting response:", error);
      Alert.alert(t('error'), t('something_went_wrong'));
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  const handleEditResponse = () => {
    setResponseText(review.sellerResponse?.text || '');
    setIsRespondingActive(true); 
  };

  const handleCancelEdit = () => {
    setResponseText(review.sellerResponse?.text || ''); 
    setIsRespondingActive(false); 
  };

  return (
    <View style={styles.card}>
      {/* Informacije o kupcu i recenziji */}
      <View style={styles.reviewHeader}>
        <Text style={styles.buyerName}>{review.buyer.name}</Text>
        <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
      </View>

      <View style={styles.ratingContainer}>
        {[...Array(5)].map((_, i) => (
          <FontAwesome
            key={`star-${review.id}-${i}`}
            name={i < review.rating ? 'star' : 'star-o'}
            size={18} 
            color={i < review.rating ? '#FFBF00' : '#D1D5DB'} 
            style={styles.star}
          />
        ))}
      </View>

      <Text style={styles.commentText}>{review.comment}</Text>

      {/* Prikaz postojećeg odgovora prodavca */}
      {review.sellerResponse && !isRespondingActive && (
        <View style={styles.sellerResponseSection}>
          <View style={styles.responseSubHeader}>
            <Text style={styles.yourResponseLabel}>{t('your_response')}:</Text>
            <Text style={styles.date}>{formatDate(review.sellerResponse.createdAt)}</Text>
          </View>
          <Text style={styles.sellerResponseText}>{review.sellerResponse.text}</Text>
          <TouchableOpacity style={styles.editButton} onPress={handleEditResponse}>
            <Text style={styles.editButtonText}>{t('edit_response')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Forma za unos ili izmjenu odgovora */}
      {isRespondingActive && (
        <View style={styles.respondFormSection}>
          <Text style={styles.formLabel}>
            {review.sellerResponse ? t('edit_your_response') : t('respond_to_this_review')}
          </Text>
          <TextInput
            style={styles.responseInput}
            placeholder={t('type_your_response_here')}
            value={responseText}
            onChangeText={setResponseText}
            multiline
            numberOfLines={3} 
            textAlignVertical="top" 
          />
          <View style={styles.formActions}>
            {/* Pokaži "Cancel" samo ako se edituje postojeći odgovor */}
            {review.sellerResponse && (
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancelEdit}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, styles.submitButton]}
              onPress={handleSubmitResponse}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {review.sellerResponse ? t('update_response') : t('submit_response')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,     
    padding: 16,
    marginBottom: 16,
   
    elevation: 3, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5, 
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  buyerName: {
    fontSize: 16,          
    fontWeight: '600',      
    color: '#1C1C1E',       
  },
  date: {
    fontSize: 12,
    color: '#8E8E93',      
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  star: {
    marginRight: 3,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151', 
    marginBottom: 12,
  },
  // Sekcija za prikaz odgovora prodavca
  sellerResponseSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#E5E7EB', 
  },
  responseSubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  yourResponseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4E8D7C',       
  },
  sellerResponseText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  editButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  editButtonText: {
    fontSize: 13,
    color: '#4E8D7C', 
    fontWeight: '500',
  },
  // Sekcija za formu za unos/izmjenu
  respondFormSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  responseInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8, 
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 12,
    minHeight: 70, 
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10, 
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8, 
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: '#4E8D7C', 
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#E5E7EB', 

  },
  cancelButtonText: {
    color: '#374151', 
    fontSize: 14,
    fontWeight: '600',
  },
});