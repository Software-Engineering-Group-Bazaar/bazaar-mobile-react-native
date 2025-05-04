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
import {
  apiFetchInventoryForProduct,
  apiUpdateProductQuantity,
} from "../api/inventoryApi";
import { t } from "i18next";
import { InventoryItem } from "../types/InventoryItem";
import SubmitButton from "@/components/ui/input/SubmitButton";
import LanguageButton from "@/components/ui/buttons/LanguageButton";

const ZaliheScreen = () => {
  const [storeId, setStoreId] = useState<number>(-1);
  const [productInventories, setProductInventories] = useState<
    { product: Product; inventory: InventoryItem }[]
  >([]);

  useEffect(() => {
    const fetchAndCombineProductInventory = async (storeId: number) => {
      try {
        const products = await apiFetchAllProductsForStore(storeId);

        const combinedData = await Promise.all(
          products.map(async (product) => {
            const inventory = await apiFetchInventoryForProduct(
              storeId,
              product.id
            );
            return { product, inventory };
          })
        );

        setProductInventories(combinedData);
      } catch (err) {
        console.error("Failed to fetch product inventories", err);
      }
    };

    const storeIdString = SecureStore.getItem("storeId");
    if (storeIdString) {
      setStoreId(parseInt(storeIdString));
      fetchAndCombineProductInventory(parseInt(storeIdString));
    } else {
      Alert.alert(t("store_id_error"));
    }
  }, []);

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    setProductInventories((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, inventory: { ...item.inventory, quantity: newQuantity } }
          : item
      )
    );
  };

  const handleSubmit = async () => {
    if (!storeId) {
      Alert.alert(t("store_id_error"));
      return;
    }

    const failures: number[] = [];

    for (const { product, inventory } of productInventories) {
      const updatedInventory = await apiUpdateProductQuantity(
        product.id,
        storeId,
        inventory.quantity
      );

      if (updatedInventory) {
        // Update that specific inventory entry in local state
        setProductInventories((prev) =>
          prev.map((item) =>
            item.product.id === product.id
              ? { ...item, inventory: updatedInventory }
              : item
          )
        );
      } else {
        failures.push(product.id);
      }
    }

    if (failures.length === 0) {
      Alert.alert(t("success"), t("all_quantities_updated"));
    } else {
      Alert.alert(
        t("partial_error"),
        `${t("failed_to_update")} ${failures.length} ${t("products")}.`
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LanguageButton />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          style={{ paddingBottom: "20%" }}
        >
          <View style={styles.container}>
            {productInventories.length != 0 && (
              <FlatList
                style={{ width: "100%" }}
                data={productInventories}
                keyExtractor={(item) => item.product.id.toString()}
                renderItem={({ item }) => (
                  <ProductQuantityCard
                    item={item.product}
                    value={item.inventory.quantity}
                    onChange={(newQuantity) =>
                      handleQuantityChange(item.product.id, newQuantity)
                    }
                  />
                )}
              />
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <View style={styles.buttonWrapper}>
        <SubmitButton buttonText={t("save_changes")} onPress={handleSubmit} />
      </View>
    </View>
  );
};

export default ZaliheScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  buttonWrapper: {
    position: "absolute",
    backgroundColor: "white",
    bottom: 80,
    padding: 20,
  },
});
