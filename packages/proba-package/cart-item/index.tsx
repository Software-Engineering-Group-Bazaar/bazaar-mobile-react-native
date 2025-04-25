import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useCart } from '../../../apps/buyer/context/CartContext';
import { Swipeable } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

interface ProductCategory {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  productCategory: ProductCategory;
  retailPrice: number;
  wholesalePrice: number;
  weight?: number;
  weightUnit?: string;
  volume?: number;
  volumeUnit?: string;
  storeId: number;
  photos: string[];
  isActive: boolean;
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
  const { handleQuantityChange, removeFromCart } = useCart();
  const { t } = useTranslation();

  const increment = () => handleQuantityChange(product, quantity + 1);
  const decrement = () => {
    if (quantity > 1) {
      handleQuantityChange(product, quantity - 1);
    } else {
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
      <TouchableOpacity onPress={() => { handleQuantityChange(product, 0); removeFromCart(product.id); }}>
        <Animated.View style={[styles.deleteButton, { transform: [{ scale }] }]}>
          <Text style={styles.deleteButtonText}>Ukloni</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const isWholesale = product.wholesaleThreshold !== undefined && quantity > product.wholesaleThreshold;
  const unitPrice = isWholesale ? product.wholesalePrice : product.retailPrice;
  const totalPrice = unitPrice * quantity;

  const firstImageUrl = product.photos && product.photos.length > 0 ? product.photos[0] : undefined;

  return (
    <View style={styles.cartItemContainer}>
      <Swipeable renderRightActions={renderRightActions}>
        <TouchableOpacity style={styles.productContainer} onPress={() => onPress?.(product)}>
          {firstImageUrl && (
            <Image source={{ uri: firstImageUrl }} style={styles.image} />
          )}
          
          {/* Levak: naziv, cena, težina, zapremina */}
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{product.name}</Text>
            <Text style={[styles.price, { color: 'green' }]}>
              {isWholesale ? `${unitPrice.toFixed(2)} KM` : `${unitPrice.toFixed(2)} KM`}
            </Text>
            {product.weight && product.weightUnit && (
              <Text style={styles.details}>{product.weight} {product.weightUnit}</Text>
            )}
            {product.volume && product.volumeUnit && (
              <Text style={styles.details}>{product.volume} {product.volumeUnit}</Text>
            )}
          </View>
  
          {/* Desna strana: ukupna cena i količina */}
          <View style={styles.rightInfoContainer}>
            <Text style={styles.totalPrice}>{totalPrice.toFixed(2)} KM</Text>
            <Text style={{ marginTop: 8 }}>{t('quantity')}: {quantity}</Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    </View>
  );
};

const styles = StyleSheet.create({
  cartItemContainer: {
    marginBottom: 12,
  },
  productContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  image: {
    width: 100,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  rightInfoContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  price: {
    fontSize: 14,
    marginBottom: 2,
  },
  details: {
    fontSize: 12,
    color: 'gray',
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'green',
    marginLeft: 10,
  },
  quantityWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: '#fafafa',
    borderRadius: 6,
    alignSelf: 'flex-end',
    marginTop: -3,
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
