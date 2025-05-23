import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ToastAndroid } from 'react-native';
import { useCart } from '../../../apps/buyer/context/CartContext';

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
  isActive: boolean;
  wholesaleThreshold?: number;
}

interface ProductItemProps {
  product: Product;
  onPress?: (product: Product) => void; // Proslijeđuje cijeli (novi) Product objekt
  onAddToCart?: (product: Product) => void;
}

const ProductItem: React.FC<ProductItemProps> = ({ product, onPress, onAddToCart }) => {
  // Destrukturiranje svojstava iz novog Product objekta
  const { name, retailPrice, photos, weight, weightUnit, volume, volumeUnit, isActive } = product;
  // <Image source={{ uri: "http://192.168.0.25:5054" + firstImageUrl }} style={styles.image} />

  // Dohvaćanje prve slike iz niza 'photos', ako postoji
  const firstImageUrl = photos && photos.length > 0 ? photos[0] : undefined;
  console.log(JSON.stringify(product))
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress && onPress(product)}>
      {firstImageUrl && (
        <Image source={{ uri: firstImageUrl }} style={styles.image} />
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
      <View style={styles.actionContainer}>
        {isActive ? (
        <TouchableOpacity onPress={() => {if (onAddToCart) {onAddToCart(product); ToastAndroid.show('Dodano u korpu!', ToastAndroid.SHORT);}}} style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>) : 
        (<TouchableOpacity style={styles.addButtonRed}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>)}
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
  addButton: {
    backgroundColor: '#4e8d7c',
    borderRadius: 20,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  addButtonRed: {
    backgroundColor: 'red',
    borderRadius: 20,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionContainer: {
    position: 'absolute',
    top: 35,
    right: 10
  }  
});

export default ProductItem;