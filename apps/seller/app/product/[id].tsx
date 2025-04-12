import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Pressable, Dimensions } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { mockProducts } from '../data/mockProducts'; /// OVO ĆEŠ IZBACITI
import { useNavigation } from '@react-navigation/native';

export const options = {
  title: 'Pregled proizvoda',
};

// 🔁 BACKEND: kad spojiš sa backendom, koristi stvarnu funkciju
// import { apiGetProductById } from '../services/api';
// import { Product } from '../types';

export default function ProductScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  /// OVO ĆEŠ IZBACITI
  const product = mockProducts.find((p) => p.id === id); // koristiš mock podatke
  /// OVO IZNAD ĆEŠ IZBACITI

  // 🔁 BACKEND: koristićeš ovaj state za pravi proizvod
  /*
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await apiGetProductById(id as string); // dohvati proizvod po ID-u
        setProduct(data);
        setError(null);
      } catch (err) {
        setError('Greška pri dohvaćanju proizvoda');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);
  */

  /*
  // 🔁 BACKEND: fallback ako ne postoji proizvod
  if (loading) {
    return (
      <View style={styles.errorContainer}>
        <ActivityIndicator size="large" color="#4E8D7C" />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Proizvod nije pronađen'}</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Nazad</Text>
        </Pressable>
      </View>
    );
  }
  */

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <ArrowLeft size={24} color="#007AFF" />
            </Pressable>
          ),
          title: product.name,
        }}
      />
      <ScrollView style={styles.container}>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.imageUrls[currentImageIndex] }}
            style={styles.image}
          />
          {currentImageIndex > 0 && (
            <Pressable style={[styles.imageNav, styles.imageNavLeft]} onPress={previousImage}>
              <ChevronLeft size={24} color="#FFFFFF" />
            </Pressable>
          )}
          {currentImageIndex < product.imageUrls.length - 1 && (
            <Pressable style={[styles.imageNav, styles.imageNavRight]} onPress={nextImage}>
              <ChevronRight size={24} color="#FFFFFF" />
            </Pressable>
          )}
          <View style={styles.imageDots}>
            {product.imageUrls.map((_: string, index: number) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentImageIndex && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.name}>{product.name}</Text>
              <Text style={styles.category}>{product.category}</Text>
            </View>
            <Text style={styles.price}>{product.price}</Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Weight/Volume</Text>
              <Text style={styles.detailValue}>{product.weight}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{product.category}</Text>
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  imageContainer: {
    height: 300,
    position: 'relative',
  },
  image: {
    width: Dimensions.get('window').width,
    height: 300,
    resizeMode: 'cover',
  },
  imageNav: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  imageNavLeft: {
    left: 16,
  },
  imageNavRight: {
    right: 16,
  },
  imageDots: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
  },
  infoContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    color: '#8E8E93',
  },
  price: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: '600',
  },
  detailsContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  detailValue: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 8,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#3C3C43',
    lineHeight: 24,
  },
  languageButton: {
    position: 'absolute',
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f1f5f9',
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  languageText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4E8D7C',
    marginTop: 2,
  },
  
});