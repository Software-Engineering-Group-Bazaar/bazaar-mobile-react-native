import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useState, useEffect } from "react";
import ProductQuantityCard from "@/components/ui/cards/ProductQuantityCard";
import { apiFetchAllProductsForStore } from "../api/productApi";
import { Product } from "../types/proizvod";

const ZaliheScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [value, setvalue] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      const productsFetched = await apiFetchAllProductsForStore(1); // Tmp store ID
      console.log(productsFetched);
      setProducts(productsFetched);
    };

    fetchProducts();
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {products.length != 0 && (
            <>
              <ProductQuantityCard
                item={products[0]}
                value={value}
                onChange={setvalue}
              />
              <ProductQuantityCard
                item={products[0]}
                value={value}
                onChange={setvalue}
              />
            </>
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
