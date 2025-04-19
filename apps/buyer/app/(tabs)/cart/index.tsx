import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Button, Touchable } from 'react-native';
import CartItem from 'proba-package/cart-item/index';
// Pretpostavka da ova putanja vodi do AŽURIRANE ProductItem komponente
import ProductItem from 'proba-package/product-item/index';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import { useCart } from '@/context/CartContext';
import { router } from 'expo-router';

// Definicija za kategoriju proizvoda (ugniježđeni objekt) - mora biti ista kao u ProductItem
interface ProductCategory {
  id: number;
  name: string;
}

// AŽURIRANA Product interface prema novom formatu
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

const CartScreen = () => {
  const { cartItems, handleQuantityChange } = useCart();

  const totalPrice = cartItems.reduce(
    (sum, { product, qty }) => sum + product.retailPrice * qty,
    0
  );

  const handleProductPress = (product: Product) => {
    router.push(`/cart/details/${product.id}`);
  };

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Tvoja korpa je prazna.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={item => item.product.id.toString()}
            renderItem={({ item }) => (
              <CartItem
                product={item.product}
                quantity={item.qty}
                onPress={() => handleProductPress(item.product)}
              />
            )}
          />
          <View style={styles.summary}>
            <Text style={styles.totalText}>
              Ukupno: KM {totalPrice.toFixed(2)}
            </Text>
            <Button color={'#4e8d7c'} title="Podnesi narudžbu" onPress={() => {console.log(cartItems)}} />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f8f8f8' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#555' },
  summary: {
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  }  
});

export default CartScreen;