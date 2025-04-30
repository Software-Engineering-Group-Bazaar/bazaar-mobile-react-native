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
        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.productImage}
        />
        <View>
          <Text>Ime proizvoda</Text>
          <Text>Kategorija: Kategorija</Text>
        </View>
        <QuantityPicker
          value={value}
          onChange={onChange}
          style={{ marginLeft: 30 }}
        />
      </View>
      {/* <View style={styles.line} /> */}
    </View>
  );
};

export default ProductQuantityCard;

const styles = StyleSheet.create({
  cardBody: {
    width: "100%",
    marginVertical: 10,
  },
  cardInnerBody: {
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
  line: {
    height: 1,
    backgroundColor: "#ccc",
    marginHorizontal: 16, // makes the line not reach the edges
    marginVertical: 5,
  },
});
