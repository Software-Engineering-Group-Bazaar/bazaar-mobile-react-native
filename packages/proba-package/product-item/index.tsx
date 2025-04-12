import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

interface Product {
  id: number;
  name: string;
  productcategoryid: number;
  price: number;
  wieght?: number;
  wieghtunit?: string;
  volume?: number;
  volumeunit?: string;
  storeID: number;
  imageUrl?: string; //polje za URL slike proizvoda
}

interface ProductItemProps {
  product: Product;
  onPress?: (product: Product) => void;
}

const ProductItem: React.FC<ProductItemProps> = ({ product, onPress }) => {
  const { name, price, imageUrl, wieght, wieghtunit, volume, volumeunit } = product;

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress && onPress(product)}>
      {imageUrl && (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.price}>KM {price.toFixed(2)}</Text>
        {wieght && (
          <Text style={styles.details}>{wieght} {wieghtunit}</Text>
        )}
        {volume && (
          <Text style={styles.details}>{volume} {volumeunit}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', 
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center', 
  },
  image: {
    width: 100,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  infoContainer: {
    flex: 1, 
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  price: {
    fontSize: 14,
    color: 'green',
    marginBottom: 2,
  },
  details: {
    fontSize: 12,
    color: 'gray',
  },
});

export default ProductItem;