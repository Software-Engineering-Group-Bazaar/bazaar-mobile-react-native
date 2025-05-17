// components/ui/cards/OrderProductList.tsx
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

type Item = {
  id: number;
  productImageUrl: string;
  productName: string;
  quantity: number;
  price: number;
};

type Props = {
  items: Item[];
  total: number;
  t: (key: string) => string;
};

export const OrderProductList: React.FC<Props> = ({ items, total, t }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{t("Products")}</Text>
    {items.map((item) => (
      <View key={item.id} style={styles.product}>
        <Image source={{ uri: item.productImageUrl }} style={styles.img} />
        <View style={{ flex: 1 }}>
          <Text>{item.productName}</Text>
          <Text>x{item.quantity}</Text>
        </View>
        <Text>{item.price} KM</Text>
      </View>
    ))}
    <View style={styles.totalContainer}>
      <Text style={styles.totalLabel}>{t("Total Amount")}:</Text>
      <Text style={styles.totalAmount}>{total} KM</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  product: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  img: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 16,
    color: "#4E8D7C",
    fontWeight: "600",
  },
});
