import { View, Text, StyleSheet, Image } from "react-native";
import { Product } from "@/app/types/proizvod";
import QuantityPicker from "../input/QuantityPicker";

interface ProductQuantityProps {
  item: Product;
  value: number;
  onChange: (newQuantity: number) => void;
}

const ProductQuantityCard: React.FC<ProductQuantityProps> = ({
  item,
  value,
  onChange,
}) => {
  return (
    <View style={styles.cardBody}>
      {/* <View style={styles.line} /> */}
      <View style={styles.cardInnerBody}>
        <View style={styles.imageAdnTextContainer}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.productImage}
          />
          <View>
            <Text style={styles.titleText}>{item.name}</Text>
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
    marginVertical: 10,
    width: "100%",
  },
  cardInnerBody: {
    paddingRight: 10,
    justifyContent: "space-between",
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  productImage: {
    width: "26%",
    height: "100%",
    resizeMode: "contain",
    marginHorizontal: 10,
  },
  line: {
    height: 1,
    backgroundColor: "#ccc",
    marginHorizontal: 16, // makes the line not reach the edges
    marginVertical: 5,
  },
  imageAdnTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleText: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#333",
  },
  categoryText: {
    fontWeight: "200",
    fontSize: 14,
  },
});
