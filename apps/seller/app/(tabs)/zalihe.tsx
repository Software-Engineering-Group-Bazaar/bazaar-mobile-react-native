import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  FlatList,
  Text,
} from "react-native";
import React, { useCallback, useState, useEffect } from "react";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import ProductQuantityCard from "@/components/ui/cards/ProductQuantityCard";
import { apiFetchAllProductsForStore } from "../api/productApi";
import { Product } from "../types/proizvod";
import * as SecureStore from "expo-secure-store";
import {
  apiFetchInventoryForProduct,
  apiUpdateProductQuantity,
} from "../api/inventoryApi";
import { useTranslation } from "react-i18next";
import { InventoryItem } from "../types/InventoryItem";
import SubmitButton from "@/components/ui/input/SubmitButton";
import { CopilotStep, walkthroughable, useCopilot } from "react-native-copilot";
import HelpAndLanguageButton from "@/components/ui/buttons/HelpAndLanguageButton";

const ZaliheScreen = () => {
  const { t } = useTranslation();
  const [storeId, setStoreId] = useState<number>(-1);
  const [productInventories, setProductInventories] = useState<
    { product: Product; inventory: InventoryItem }[]
  >([]);
  const { stop } = useCopilot();

  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) {
      // Only stop when the screen actually loses focus
      stop();
    }
    // No action on mount/focus
  }, [isFocused, stop]);
  const WalkthroughableView = walkthroughable(View);

  useFocusEffect(
    useCallback(() => {
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
    }, [])
  );

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
      <HelpAndLanguageButton />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          style={{ paddingBottom: "20%" }}
        >
          <View style={styles.container}>
            <Text style={styles.titleText}></Text>
            {productInventories.length != 0 && (
              <FlatList
                style={{ width: "100%" }}
                data={productInventories}
                keyExtractor={(item) => item.product.id.toString()}
                renderItem={({ item }) => {
                  const isOutOfStock = item.inventory.quantity === 0;

                  return (
                    <ProductQuantityCard
                      item={item.product}
                      value={item.inventory.quantity}
                      outOfStock={isOutOfStock}
                      onChange={(newQuantity) =>
                        handleQuantityChange(item.product.id, newQuantity)
                      }
                    />
                  );
                }}
              />
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <View style={styles.buttonWrapper}>
        <CopilotStep
          text="Klikom na ovo dugme će se sačuvati napravljene promjene."
          order={1}
          name="save_button_product_list"
        >
          <WalkthroughableView>
            <SubmitButton
              buttonText={t("save_changes")}
              onPress={handleSubmit}
            />
          </WalkthroughableView>
        </CopilotStep>
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
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#4E8D7C",
    paddingTop: 50,
    marginVertical: 0,
  },
  buttonWrapper: {
    position: "absolute",
    backgroundColor: "white",
    bottom: 80,
    padding: 20,
  },
});
