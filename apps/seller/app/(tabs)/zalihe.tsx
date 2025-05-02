import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  FlatList,
} from "react-native";
import React, { useState, useEffect } from "react";
import ProductQuantityCard from "@/components/ui/cards/ProductQuantityCard";
import { apiFetchAllProductsForStore } from "../api/productApi";
import { Product } from "../types/proizvod";
import * as SecureStore from "expo-secure-store";
import { apiFetchInventoryForProduct } from "../api/inventoryApi";
import { t } from "i18next";
import { InventoryItem } from "../types/InventoryItem";

const ZaliheScreen = () => {
  const [productInventories, setProductInventories] = useState<
    { product: Product; inventory: InventoryItem }[]
  >([]);
  const [value, setvalue] = useState(0);

  useEffect(() => {
    const storeId = SecureStore.getItem("storeId");
    const fetchAndCombineProductInventory = async (storeId: number) => {
      try {
        const products = await apiFetchAllProductsForStore(storeId);
        console.log(`Products: ${JSON.stringify(products, null, 2)}`);

        const combinedData = await Promise.all(
          products.map(async (product) => {
            const inventory = await apiFetchInventoryForProduct(
              storeId,
              product.id
            );
            console.log(
              `Inventory of product ${product.name}: ${JSON.stringify(
                inventory,
                null,
                2
              )}`
            );
            return { product, inventory };
          })
        );

        console.log(`CombinedData: ${JSON.stringify(combinedData, null, 2)}`);

        setProductInventories(combinedData); // or setInventoryItems(combinedData)
      } catch (err) {
        console.error("Failed to fetch product inventories", err);
      }
    };

    if (storeId) {
      fetchAndCombineProductInventory(parseInt(storeId));
    } else {
      Alert.alert(t("store_id_error"));
    }
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {productInventories.length != 0 && (
            <FlatList
              data={productInventories}
              keyExtractor={(item) => item.product.id.toString()}
              renderItem={({ item }) => (
                <ProductQuantityCard
                  item={item.product}
                  value={value}
                  onChange={setvalue}
                />
              )}
            />
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ZaliheScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    // justifyContent: "center",
  },
});
