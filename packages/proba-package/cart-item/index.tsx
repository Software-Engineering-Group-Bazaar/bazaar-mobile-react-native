import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import ProductItem from '../product-item'; 
import { useCart } from '../../../apps/buyer/context/CartContext';
import { Swipeable } from 'react-native-gesture-handler';

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
  isAvailable: boolean;
  wholesaleThreshold?: number;
}

interface CartItemProps {
  product: Product;
  quantity: number;
  onPress?: (product: Product) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  product,
  quantity,
  onPress,
}) => {
  const { cartItems, removeFromCart, handleQuantityChange } = useCart();
  // Funkcije za + i –
  const increment = () => handleQuantityChange(product, quantity + 1);
  const decrement = () => {
    if (quantity > 1) {
      handleQuantityChange(product, quantity - 1);
    }
    else {
      removeFromCart(product.id);
    }
  };

  const renderRightActions = (_: any, dragX: Animated.AnimatedInterpolation<number>) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity onPress={() => {handleQuantityChange(product,0); removeFromCart(product.id)}}>
        <Animated.View style={[styles.deleteButton, { transform: [{ scale }] }]}>
          <Text style={styles.deleteButtonText}>Ukloni</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };


  return (
    <View style={styles.cartItemContainer}>
      {/* Iskoristi postojeći ProductItem za prikaz osnovnih podataka */}
      <Swipeable renderRightActions={renderRightActions}>
      <ProductItem
        product={product}
        onPress={onPress}
      />
      </Swipeable>

      {/* UI za prikaz i upravljanje količinom */}
      <View style={styles.quantityWrapper}>
        <TouchableOpacity onPress={decrement} style={styles.qtyButton}>
          <Text style={styles.qtyButtonText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{quantity}</Text>
        <TouchableOpacity onPress={increment} style={styles.qtyButton}>
          <Text style={styles.qtyButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cartItemContainer: {
    marginBottom: 12,
  },
  quantityWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: '#fafafa',
    borderRadius: 6,
    alignSelf: 'flex-end',
    marginTop: -3,            // pozicioniranje iznad ili ispod ProductItem-a
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  qtyButton: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  quantityText: {
    marginHorizontal: 8,
    fontSize: 15,
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginVertical: 6,
    borderRadius: 8,
    flex: 1,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CartItem;