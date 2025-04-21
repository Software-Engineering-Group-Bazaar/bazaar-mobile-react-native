import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next"; // Assuming you're using react-i18next for translation
import { Product } from "../../../app/types/proizvod";

interface ProductCardProps {
  item: Product;
}

const { width } = Dimensions.get("window");
const COLUMN_GAP = 16;
const ITEM_WIDTH = (width - COLUMN_GAP * 3) / 2;

const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => {
        console.log("Idemo na porizvod");
        router.push(`/(CRUD)/proizvod_detalji?product=${JSON.stringify(item)}`);
      }}
    >
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>
          {t("Price")}: {item.retailPrice.toString()} KM
        </Text>
        <Text style={styles.productCategory}>
          {t("Category")}: {item.productCategory.name}
        </Text>
        {/* Display weight and volume if available */}
        {item.weight && (
          <Text style={styles.productCategory}>
            {t("Weight")}: {item.weight.toString()} {item.weightUnit || ""}
          </Text>
        )}
        {item.volume && (
          <Text style={styles.productCategory}>
            {t("Volume")}: {item.volume.toString()} {item.volumeUnit || ""}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});

export default ProductCard;
