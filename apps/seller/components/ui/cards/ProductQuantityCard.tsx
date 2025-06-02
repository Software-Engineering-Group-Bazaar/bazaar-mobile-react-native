import { View, Text, StyleSheet, Image } from "react-native";
import { Product } from "@/app/types/proizvod";
import QuantityPicker from "../input/QuantityPicker";

interface ProductQuantityProps {
  item: Product;
  value: number;
  outOfStock?: boolean;
  onChange: (newQuantity: number) => void;
}

const ProductQuantityCard: React.FC<ProductQuantityProps> = ({
  item,
  value,
  onChange,
  outOfStock,
}) => {
  const productImageUri =
    item.photos.length != 0
      ? { uri: item.photos[0] }
      : require("../../../assets/images/no_product.png");

  return (
    <View style={styles.cardBody}>
      {/* <View style={styles.line} /> */}
      <View style={styles.cardInnerBody}>
        <View style={styles.imageAdnTextContainer}>
          <View style={styles.imageContainer}>
            <Image source={productImageUri} style={styles.productImage} />
          </View>
          <View>
            <Text
              style={[
                styles.titleText,
                outOfStock && { color: "#FF4500" }, 
              ]}
            >
              {item.name}
            </Text>
            <Text style={styles.categoryText}>{item.productCategory.name}</Text>
          </View>
        </View>
        <QuantityPicker value={value} onChange={onChange} />
      </View>
      {/* <View style={styles.line} /> */}
    </View>
  );
};

export default ProductQuantityCard;

const styles = StyleSheet.create({
  cardBody: {
    marginVertical: 5,
    width: "100%",
    paddingTop: 5,
  },
  cardInnerBody: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingRight: 15,
  },
  productImage: {
    height: "100%",
    width: "100%",
    resizeMode: "contain",
  },
  imageContainer: {
    marginHorizontal: 10,
    height: 50,
    width: 50,
  },
  line: {
    height: 1,
    backgroundColor: "#ccc",
    marginHorizontal: 16, // makes the line not reach the edges
    marginVertical: 15,
  },
  imageAdnTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1, // Take up remaining space
  },
  titleText: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#333",
    flexShrink: 1, // allow text to wrap if too long
    flexWrap: "wrap",
    marginRight: 10,
  },
  categoryText: {
    fontWeight: "200",
    fontSize: 14,
  },
});
