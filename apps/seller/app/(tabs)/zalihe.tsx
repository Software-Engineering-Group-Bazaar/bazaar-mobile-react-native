import { View, Text, StyleSheet } from "react-native";
import React from "react";
import ProductQuantityCard from "@/components/ui/cards/ProductQuantityCard";

const ZaliheScreen = () => {
  return (
    <View style={styles.container}>
      <ProductQuantityCard />
    </View>
  );
};

export default ZaliheScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
