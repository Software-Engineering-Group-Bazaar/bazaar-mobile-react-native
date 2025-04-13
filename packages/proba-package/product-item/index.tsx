import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

// Definicija za kategoriju proizvoda (ugniježđeni objekt)
interface ProductCategory {
  id: number;
  name: string;
}

// Nova Product interface prema zadatom formatu
interface Product {
  id: number;
  name: string;
  productCategory: ProductCategory; // Promijenjeno iz productcategoryid
  retailPrice: number;             // Promijenjeno iz price (koristit ćemo maloprodajnu cijenu)
  wholesalePrice: number;         // Dodano
  weight?: number;                 // Promijenjeno iz wieght (ispravljen typo)
  weightUnit?: string;             // Promijenjeno iz wieghtunit (ispravljen typo)
  volume?: number;
  volumeUnit?: string;
  storeId: number;                 // Promijenjeno iz storeID (usklađeno s formatom)
  photos: string[];                // Promijenjeno iz imageUrl u niz stringova
}

interface ProductItemProps {
  product: Product;
  onPress?: (product: Product) => void; // Proslijeđuje cijeli (novi) Product objekt
}

const ProductItem: React.FC<ProductItemProps> = ({ product, onPress }) => {
  // Destrukturiranje svojstava iz novog Product objekta
  const { name, retailPrice, photos, weight, weightUnit, volume, volumeUnit } = product;

  // Dohvaćanje prve slike iz niza 'photos', ako postoji
  const firstImageUrl = photos && photos.length > 0 ? photos[0] : undefined;
  console.log(JSON.stringify(product))
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress && onPress(product)}>
      {firstImageUrl && (
        <Image source={{ uri: "http://192.168.0.25:5054" + firstImageUrl }} style={styles.image} />
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.price}>KM {retailPrice.toFixed(2)}</Text>
        {typeof weight === 'number' && weight > 0 && weightUnit && 
        (<Text style={styles.details}>{`${weight} ${weightUnit}`}</Text>)}
        {typeof volume === 'number' && volume > 0 && volumeUnit && (
          <Text style={styles.details}>{`${volume} ${volumeUnit}`}</Text>
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
    // Opcionalno: dodati boju pozadine dok se slika učitava ili ako nema slike
    // backgroundColor: '#eee',
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