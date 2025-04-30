import { View, Text, StyleSheet, Image } from "react-native";
import React from "react";

const ProductQuantityCard = () => {
  return (
    <View style={styles.cardBody}>
      <Image
        source={require("../../../assets/images/logo.png")}
        style={styles.productImage}
      />
      <View>
        <Text>Ime proizvoda</Text>
        <Text>Kategorija: Kategorija</Text>
      </View>
    </View>
  );
};

export default ProductQuantityCard;

const styles = StyleSheet.create({
  cardBody: {
    width: "100%",
    height: "20%",
    flexDirection: "row",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  productImage: {
    width: "15%",
    height: "100%",
    resizeMode: "contain",
    marginHorizontal: 10,
  },
});
