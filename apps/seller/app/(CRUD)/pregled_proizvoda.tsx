import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Pressable,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { FontAwesome } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { apiFetchAllProductsForStore } from "../api/productApi";
import { useCallback } from "react";

import { Product } from "../types/proizvod";
import ScreenExplorer from "@/components/debug/ScreenExplorer";
import LanguageButton from "@/components/ui/LanguageButton";
import SetHeaderRight from '../../components/ui/NavHeader';

const { width, height } = Dimensions.get("window");
const COLUMN_GAP = 16;
const NUM_COLUMNS = 2;
const ITEM_WIDTH = (width - COLUMN_GAP * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

export default function ProductsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const storeId = params.storeId ? Number(params.storeId) : null;

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    navigation.setOptions({
      title: t("products_overview"),
    });
  }, [i18n.language, navigation]);

  useFocusEffect(
    useCallback(() => {
      async function loadProducts() {
        if (!storeId) return;
        setLoading(true);
        try {
          const fetchedProducts = await apiFetchAllProductsForStore(storeId);
          setProducts(fetchedProducts);
        } catch (error) {
          console.error("Failed to fetch products:", error);
        } finally {
          setLoading(false);
        }
      }
      loadProducts();
         }, [storeId])
 );
  
   const renderProductCard = ({ item }: { item: Product }) => (
  <TouchableOpacity
    style={styles.productCard}
    onPress={() => router.push(`/(CRUD)/proizvod_detalji?product=${JSON.stringify(item)}`)}
  >
       <View style={styles.productInfo}>
         <Text style={styles.productName}>{item.name}</Text>
         <Text style={styles.productPrice}>{t('Price')}: {item.retailPrice.toString()} KM</Text>
         <Text style={styles.productCategory}>{t('Category')}: {item.productCategory.name}</Text>
  
         {/* Display weight and volume if available */}
         {item.weight && (
           <Text style={styles.productCategory}>
             {t('Weight')}: {item.weight.toString()} {item.weightUnit || ''}
           </Text>
         )}
         {item.volume && (
           <Text style={styles.productCategory}>
             {t('Volume')}: {item.volume.toString()} {item.volumeUnit || ''}
           </Text>
         )}
       </View>
     </TouchableOpacity>
   );
  
   return (
   <View style={{ flex: 1 }}>
     <SetHeaderRight title="Pregled proizvoda" />
     {/* Fiksirano dugme za promjenu jezika */}
     <LanguageButton />

     <ScrollView style={styles.scrollWrapper} contentContainerStyle={styles.scrollContent}>
        {/*---------------------Screen Explorer Button----------------------*/}
          <ScreenExplorer route="../(tabs)/screen_explorer" />
        {/*-----------------------------------------------------------------*/}

       <TouchableOpacity
         style={styles.createButton}
         onPress={() => router.push(`./dodaj_proizvod/?storeId=${storeId}`)}
         disabled={loading}
       >
         {loading ? (
           <ActivityIndicator color="#fff" />
         ) : (
           <>
             <FontAwesome name="plus" size={14} color="#fff" style={{ marginRight: 6 }} />
             <Text style={styles.createButtonText}>{t('add_a_product')}</Text>
           </>
         )}
       </TouchableOpacity>


       <FlatList
         data={products}
         renderItem={renderProductCard}
         keyExtractor={(item: Product) => item.id.toString()}
         numColumns={2}
         contentContainerStyle={styles.listContainer}
         columnWrapperStyle={styles.columnWrapper}
         scrollEnabled={false}
       />
     </ScrollView>
   </View>
 );
}

const styles = StyleSheet.create({
  scrollWrapper: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  scrollContent: {
    paddingTop: height * 0.08,
    paddingBottom: height * 0.1,
  },
  addButton: {
    backgroundColor: "#4E8D7C",
    marginHorizontal: 16,
    marginBottom: 10,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  listContainer: {
    paddingHorizontal: COLUMN_GAP,
  },
  columnWrapper: {
    gap: COLUMN_GAP,
    marginBottom: COLUMN_GAP,
    justifyContent: "space-between",
  },
  productCard: {
    width: ITEM_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  productImage: {
    width: "100%",
    height: ITEM_WIDTH,
    resizeMode: "cover",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: "#4E8D7C",
    fontWeight: "500",
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: "#8E8E93",
  },
  createButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4E8D7C",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginLeft: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});