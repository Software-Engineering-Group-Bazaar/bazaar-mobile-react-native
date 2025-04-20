import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Pressable,
  Switch,
  TextInput,
  Button,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { FontAwesome } from "@expo/vector-icons";
import ScreenExplorer from "@/components/debug/ScreenExplorer";
import LanguageButton from "@/components/ui/LanguageButton";
import SetHeaderRight from '../../components/ui/NavHeader';
import { apiUpdateProductPrices, apiUpdateProductAvailability}  from '../api/productApi'

export default function ProductScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  const productString = Array.isArray(params.product)
    ? params.product[0]
    : params.product;
  const product = productString ? JSON.parse(productString) : null;

  const photos = product?.photos || [];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isActive, setIsActive] = useState<boolean>(false); 

  const nextImage = () => {
    //  zamijeni mockPhotos sa photos
    if (currentImageIndex < photos.length - 1 /* photos.length - 1 */) {
      setCurrentImageIndex((prev) => prev + 1);
    }
  };

  const previousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex((prev) => prev - 1);
    }
  };

  // Funkcije za izmjenu dostupnosti i cijene
  const updateAvailability = async (newValue: boolean) => {
    try {
      await apiUpdateProductAvailability(product.id, newValue);
      console.log("Availability updated!");
    } catch (error) {
      console.error("Error updating availability:", error);
      setIsActive(!newValue);
    }
  };

  const updatePrices = async () => {
    const payload = {
      productId: product.id,
      retailPrice: product.retailPrice,
      wholesalePrice: product.wholesalePrice,
      wholesaleThreshold: product.wholesaleThreshold,
    };
    await apiUpdateProductPrices(payload);
    console.log('Prices updated!');
  };

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
    <ScrollView style={styles.container}>
      {/* Dugme za promjenu jezika */}
      <SetHeaderRight title="Detalji proizvoda" />
      <LanguageButton />

      {/*---------------------Screen Explorer Button----------------------*/}
      <ScreenExplorer route="../(tabs)/screen_explorer" />
      {/*-----------------------------------------------------------------*/}

      {/* Sekcija sa slikama i strelicama */}
      <View style={styles.imageSection}>
        {/*BACKEND: koristi photos.length > 0 */}
        {photos.length > 0 && (
          <>
            <TouchableOpacity
              style={[styles.navArrow, styles.leftArrow]}
              onPress={previousImage}
              disabled={currentImageIndex === 0}
            >
              <ChevronLeft
                size={40}
                color={currentImageIndex === 0 ? "#ccc" : "#000"}
              />
            </TouchableOpacity>

            <Image
              source={{
                uri: photos[currentImageIndex] /* photos[currentImageIndex] */,
              }}
              style={styles.productImage}
            />

            <TouchableOpacity
              style={[styles.navArrow, styles.rightArrow]}
              onPress={nextImage}
              disabled={
                currentImageIndex === photos.length - 1 /* photos.length - 1 */
              }
            >
              <ChevronRight
                size={40}
                color={
                  currentImageIndex === photos.length - 1 ? "#ccc" : "#000"
                }
              />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Podaci o proizvodu */}
      <View style={styles.infoSection}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.price}>{product.wholesalePrice} KM</Text>
      </View>

      <View style={styles.detailsSection}>
    
        {/* Retail Price */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('retail_price')}:</Text>
          <TextInput
            style={styles.detailValue}
            value={product.retailPrice.toString()}
            keyboardType="numeric"
            onChangeText={(text) => product.setRetailPrice(parseFloat(text))}
          />
        </View>

        {/* Wholesale Threshold */}
        {product.wholesaleThreshold != null && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('wholesale_threshold')}:</Text>
            <TextInput
              style={styles.detailValue}
              value={product.wholesaleThreshold ? product.wholesaleThreshold.toString() : ''}
              keyboardType="numeric"
              onChangeText={(text) => product.setWholesaleThreshold(parseInt(text))}
            />
          </View>
        )}

        {/* Wholesale Price */}
        {product.wholesalePrice != null && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('wholesale_price')}:</Text>
            <TextInput
              style={styles.detailValue}
              value={product.wholesalePrice ? product.wholesalePrice.toString() : ''}
              keyboardType="numeric"
              onChangeText={(text) => product.setWholesalePrice(parseFloat(text))}
            />
          </View>
        )}
        {/* Save Changes Button */}
        <Button title="Save Changes" onPress={updatePrices} />

        {/* Kategorija */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('Category')}:</Text>
          <Text style={styles.detailValue}>{product.productCategory.name}</Text>
        </View>
          
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

        {/* Availability */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('availability')}:</Text>
          <Switch
            value={isActive}
            onValueChange={(newValue) => {
              setIsActive(newValue);  // Update local state
              updateAvailability(newValue);  // Call the function that handles the update
            }}
          />
        </View>
      </View>
    </ScrollView>
 );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  imageSection: {
    position: "relative",
    width: "100%",
    height: 350,
    backgroundColor: "#f5f5f5",
    marginBottom: 20,
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  navArrow: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -20 }],
    zIndex: 2,
    padding: 10,
  },
  leftArrow: {
    left: 10,
  },
  rightArrow: {
    right: 10,
  },
  infoSection: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  price: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4E8D7C",
    marginBottom: 20,
  },
  detailsSection: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 15,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  detailLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    color: "#FF3B30",
    marginBottom: 16,
  },
  backButton: {
    padding: 12,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
