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
import {
  CopilotStep,
  walkthroughable,
  useCopilot,
  CopilotProvider,
} from "react-native-copilot";
import HelpAndLanguageButton from "@/components/ui/buttons/HelpAndLanguageButton";

function HiddenHelpStarter() {
  const { start } = useCopilot();

  useEffect(() => {
    // @ts-ignore
    global.triggerHelpTutorial = () => {
      console.log("Tutorial triggered from global method"); // ✅ ADD THIS
      start();
    };
    return () => {
      // @ts-ignore
      delete global.triggerHelpTutorial;
    };
  }, [start]);

  return null;
}

const ZaliheScreen = () => {
  const { t } = useTranslation();
  const [storeId, setStoreId] = useState<number>(-1);
  const [productInventories, setProductInventories] = useState<
    { product: Product; inventory: InventoryItem }[]
  >([]);

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
      <HelpAndLanguageButton showHelpButton={true} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          style={{ paddingBottom: "20%" }}
        >
          <View style={styles.container}>
            {productInventories.length > 0 && (
            <CopilotStep
              text={t("adjust_quantity_tutorial")}
              order={1}
              name="inventoryList"
            >
              <WalkthroughableView>
                <FlatList
                  style={{ width: "100%" }}
                  data={productInventories}
                  keyExtractor={(item: any) => item.product.id.toString()}
                  renderItem={({ item, index }) => {
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
              </WalkthroughableView>
            </CopilotStep>
          )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <View style={styles.buttonWrapper}>
        <CopilotStep
          text={t("SaveInventoryUpdate")}
          order={2}
          name="SaveInventoryUpdate"
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

export default function ZaliheScreenContent() {
  const { t } = useTranslation();
  return (
    <CopilotProvider
      labels={{
        finish: t("Finish"),
        next: t("Next"),
        skip: t("Skip"),
        previous: t("Previous")
      }}>
      <HiddenHelpStarter />
      <ZaliheScreen />
    </CopilotProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 80
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#4E8D7C",
    marginVertical: 50,
    marginHorizontal: 30
  },
  buttonWrapper: {
    position: "absolute",
    backgroundColor: "white",
    bottom: 80,
    padding: 20,
  },
});
