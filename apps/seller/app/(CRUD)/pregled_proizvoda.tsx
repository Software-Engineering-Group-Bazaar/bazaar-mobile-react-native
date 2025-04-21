import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { FontAwesome } from "@expo/vector-icons";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { apiFetchAllProductsForStore } from "../api/productApi";

import { Product } from "../types/proizvod";
import ScreenExplorer from "@/components/debug/ScreenExplorer";
import LanguageButton from "@/components/ui/LanguageButton";
import SetHeaderRight from "../../components/ui/NavHeader";
import ProductCard from "@/components/ui/cards/ProductCard";

const { width, height } = Dimensions.get("window");
const COLUMN_GAP = 16;
const NUM_COLUMNS = 2;
const ITEM_WIDTH = (width - COLUMN_GAP * 3) / 2;

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

  return (
    <View style={{ flex: 1 }}>
      <SetHeaderRight title="Pregled proizvoda" />
      {/* Fiksirano dugme za promjenu jezika */}
      <LanguageButton />

      <ScrollView
        style={styles.scrollWrapper}
        contentContainerStyle={styles.scrollContent}
      >
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
              <FontAwesome
                name="plus"
                size={14}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.createButtonText}>{t("add_a_product")}</Text>
            </>
          )}
        </TouchableOpacity>

        <FlatList
          data={products}
          renderItem={({ item }) => <ProductCard item={item} />}
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
