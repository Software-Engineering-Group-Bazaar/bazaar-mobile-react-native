import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Pressable, Dimensions } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { FontAwesome } from '@expo/vector-icons';

export default function ProductScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();

  const productString = Array.isArray(params.product) ? params.product[0] : params.product;
  const product = productString ? JSON.parse(productString) : null;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === product.imageUrls.length - 1 ? prev : prev + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? prev : prev - 1
    );
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'bs' : 'en');
  };

  useEffect(() => {
    navigation.setOptions({
      title: product.name,
    });
  }, [i18n.language, navigation]);

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Fixed Language Toggle Button */}
      <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
        <FontAwesome name="language" size={20} color="#fff" />
        <Text style={styles.languageText}>{i18n.language.toUpperCase()}</Text>
      </TouchableOpacity>

    <ScrollView style={styles.container}>

      {/* Product Image Section */}
      <View style={styles.imageContainer}>
        {product.photos?.length > 0 ? (
          <Image source={{ uri: product.photos[0] }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>{t('No Image Available')}</Text>
          </View>
        )}
      </View>

      {/* Product Info Section */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.category}>{t('Category')}: {product.productCategory.name}</Text>
        
        {/* Price Section */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{t('Price')}: {product.wholesalePrice}</Text>
        </View>

        {/* Weight & Volume */}
        <View style={styles.detailsContainer}>
          {product.weight && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('Weight')}:</Text>
              <Text style={styles.detailValue}>{product.weight} {product.weightUnit}</Text>
            </View>
          )}
          {product.volume && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('Volume')}:</Text>
              <Text style={styles.detailValue}>{product.volume} {product.volumeUnit}</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: 20,
  },
  languageButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#4E8D7C',
    padding: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorContainer: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 16, 
  }, 
  errorText: { 
    fontSize: 18, 
    color: '#FF3B30', 
    marginBottom: 16, 
  },
  languageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  backButton: { 
    padding: 12, 
    backgroundColor: '#007AFF', 
    borderRadius: 8, 
  }, 
  backButtonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '600', 
  },
  image: {
    width: '90%',
    height: 250,
    borderRadius: 10,
  },
  placeholderImage: {
    width: '90%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  placeholderText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  infoContainer: {
    paddingHorizontal: 20,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  category: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
  },
  priceContainer: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  price: {
    fontSize: 20,
    color: '#2E7D32',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  detailsContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#777',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
