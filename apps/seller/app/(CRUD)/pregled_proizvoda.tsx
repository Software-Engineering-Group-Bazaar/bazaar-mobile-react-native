import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { apiFetchAllProductsForStore } from "../api/productApi";

import { Product } from "../types/proizvod";
import ProductCard from "@/components/ui/cards/ProductCard";
import CreateButton from "@/components/ui/buttons/CreateButton";

import { CopilotStep, walkthroughable } from "react-native-copilot";

import HelpAndLanguageButton from "@/components/ui/buttons/HelpAndLanguageButton";

const { height } = Dimensions.get("window");
const COLUMN_GAP = 16;

export default function ProductsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const storeId = params.storeId ? Number(params.storeId) : null;

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const WalkthroughableView = walkthroughable(View);

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
      {/* Fiksirano dugme za promjenu jezika */}
      <HelpAndLanguageButton />

      <ScrollView
        style={styles.scrollWrapper}
        contentContainerStyle={styles.scrollContent}
      >
        <CopilotStep
          text={t("help_add_product_button")}
          order={1}
          name="add_product_button"
        >
          <WalkthroughableView>
            <CreateButton
              text={t("add_a_product")}
              loading={loading}
              onPress={() =>
                router.push(`./dodaj_proizvod/?storeId=${storeId}`)
              }
            />
          </WalkthroughableView>
        </CopilotStep>

        <CopilotStep
          text={t("help_products_list")}
          order={2}
          name="product_list"
        >
          <WalkthroughableView>
            <FlatList
              data={products}
              renderItem={({ item }) => <ProductCard item={item} />}
              keyExtractor={(item: Product) => item.id.toString()}
              numColumns={2}
              contentContainerStyle={styles.listContainer}
              columnWrapperStyle={styles.columnWrapper}
              scrollEnabled={false}
            />
          </WalkthroughableView>
        </CopilotStep>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topButtonsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 20,
  },

  languageWrapper: {
    flexShrink: 1,
  },

  helpButton: {
    marginLeft: 10,
    padding: 6,
  },
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
