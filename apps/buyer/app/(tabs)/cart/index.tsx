import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Button } from 'react-native';
import CartItem from 'proba-package/cart-item/index';
// Pretpostavka da ova putanja vodi do AŽURIRANE ProductItem komponente
import ProductItem from 'proba-package/product-item/index';
import { useTranslation } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';

// Definicija za kategoriju proizvoda (ugniježđeni objekt) - mora biti ista kao u ProductItem
interface ProductCategory {
  id: number;
  name: string;
}

// AŽURIRANA Product interface prema novom formatu
interface Product {
  id: number;
  name: string;
  productCategory: ProductCategory; // Umjesto productcategoryid
  retailPrice: number;             // Umjesto price
  wholesalePrice: number;         // Dodano
  weight?: number;                 // Ispravljen typo
  weightUnit?: string;             // Ispravljen typo
  volume?: number;
  volumeUnit?: string;
  storeId: number;                 // Umjesto storeID
  photos: string[];                // Umjesto imageUrl
}

const USE_DUMMY_DATA = true; // Postavite na true za testiranje sa dummy podacima

// AŽURIRANI DUMMY_PRODUCTS prema novom formatu
const DUMMY_PRODUCTS: Product[] = [
  { id: 101, name: 'Mlijeko 1L', productCategory: { id: 1, name: 'Mliječni proizvodi' }, retailPrice: 2.50, wholesalePrice: 2.20, storeId: 123, photos: ['https://via.placeholder.com/150/ADD8E6/000000?Text=Mlijeko'] },
  { id: 102, name: 'Hljeb', productCategory: { id: 2, name: 'Pekarski proizvodi' }, retailPrice: 1.20, wholesalePrice: 1.00, storeId: 123, photos: ['https://via.placeholder.com/150/F0E68C/000000?Text=Hljeb'] },
  { id: 103, name: 'Jabuke 1kg', productCategory: { id: 3, name: 'Voće' }, retailPrice: 1.80, wholesalePrice: 1.50, weight: 1, weightUnit: 'kg', storeId: 123, photos: ['https://via.placeholder.com/150/90EE90/000000?Text=Jabuke'] },
  { id: 104, name: 'Banane 1kg', productCategory: { id: 3, name: 'Voće' }, retailPrice: 2.00, wholesalePrice: 1.70, weight: 1, weightUnit: 'kg', storeId: 123, photos: ['https://via.placeholder.com/150/FFFF00/000000?Text=Banane'] },
  { id: 105, name: 'Kruh pšenični', productCategory: { id: 2, name: 'Pekarski proizvodi' }, retailPrice: 1.50, wholesalePrice: 1.30, storeId: 123, photos: ['https://via.placeholder.com/150/F0E68C/000000?Text=Kruh'] },
  { id: 106, name: 'Jogurt 500g', productCategory: { id: 1, name: 'Mliječni proizvodi' }, retailPrice: 1.10, wholesalePrice: 0.90, weight: 500, weightUnit: 'g', storeId: 123, photos: ['https://via.placeholder.com/150/ADD8E6/000000?Text=Jogurt'] },
  { id: 107, name: 'Apple iPhone 13', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 999, wholesalePrice: 950, storeId: 456, photos: ['https://via.placeholder.com/150/87CEEB/FFFFFF?Text=Iphone'] },
  { id: 108, name: 'Samsung Galaxy S21', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 950, wholesalePrice: 900, storeId: 456, photos: ['https://via.placeholder.com/150/87CEEB/FFFFFF?Text=Samsung'] },
  { id: 109, name: 'Slušalice Bose', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 200, wholesalePrice: 180, storeId: 456, photos: ['https://via.placeholder.com/150/D3D3D3/000000?Text=Slušalice'] },
  { id: 110, name: 'Dell Monitor 24" Full HD', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 300, wholesalePrice: 280, storeId: 456, photos: ['https://via.placeholder.com/150/87CEEB/FFFFFF?Text=Monitor'] },
  { id: 111, name: 'Čaj Zeleni', productCategory: { id: 5, name: 'Pića' }, retailPrice: 3.00, wholesalePrice: 2.50, storeId: 789, photos: ['https://via.placeholder.com/150/32CD32/000000?Text=Čaj'] },
  { id: 112, name: 'Kafa Moka', productCategory: { id: 5, name: 'Pića' }, retailPrice: 5.50, wholesalePrice: 5.00, storeId: 789, photos: ['https://via.placeholder.com/150/D2691E/000000?Text=Kafa'] },
  { id: 113, name: 'Vino Cabernet Sauvignon', productCategory: { id: 6, name: 'Alkoholna pića' }, retailPrice: 15.00, wholesalePrice: 13.00, storeId: 789, photos: ['https://via.placeholder.com/150/8B0000/FFFFFF?Text=Vino'] },
  { id: 114, name: 'Pivo Heineken', productCategory: { id: 6, name: 'Alkoholna pića' }, retailPrice: 1.80, wholesalePrice: 1.50, storeId: 789, photos: ['https://via.placeholder.com/150/00FF00/FFFFFF?Text=Pivo'] },
  { id: 115, name: 'Računarski miš Logitech', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 25.00, wholesalePrice: 22.00, storeId: 456, photos: ['https://via.placeholder.com/150/D3D3D3/000000?Text=Miš'] },
  { id: 116, name: 'Gaming Monitor 27"', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 400, wholesalePrice: 380, storeId: 456, photos: ['https://via.placeholder.com/150/87CEEB/FFFFFF?Text=Gaming+Monitor'] },
  { id: 117, name: 'LED TV 40"', productCategory: { id: 4, name: 'Elektronika' }, retailPrice: 350, wholesalePrice: 330, storeId: 456, photos: ['https://via.placeholder.com/150/87CEEB/FFFFFF?Text=TV'] },
  { id: 118, name: 'Knjiga "The Great Gatsby"', productCategory: { id: 7, name: 'Knjige' }, retailPrice: 15.00, wholesalePrice: 12.00, storeId: 999, photos: ['https://via.placeholder.com/150/FF6347/FFFFFF?Text=Knjiga'] },
  { id: 119, name: 'Knjiga "1984"', productCategory: { id: 7, name: 'Knjige' }, retailPrice: 10.00, wholesalePrice: 8.00, storeId: 999, photos: ['https://via.placeholder.com/150/FF6347/FFFFFF?Text=Knjiga'] },
];

const CartScreen = () => {
  const [cartItems, setCartItems] = useState<{ product: Product; qty: number }[]>(DUMMY_PRODUCTS.map(product => ({ product, qty: 1 })));

  const handleQuantityChange = (product: Product, newQty: number) => {
    setCartItems(items => {
      const exists = items.find(i => i.product.id === product.id);
      if (exists) {
        if (newQty <= 0) {
          return items.filter(i => i.product.id !== product.id);
        }
        return items.map(i =>
          i.product.id === product.id ? { ...i, qty: newQty } : i
        );
      }
      return [...items, { product, qty: newQty }];
    });
  };

  const totalPrice = cartItems.reduce(
    (sum, { product, qty }) => sum + product.retailPrice * qty,
    0
  );

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
                onQuantityChange={handleQuantityChange}
              />
            )}
          />
          <View style={styles.summary}>
            <Text style={styles.totalText}>
              Ukupno: KM {totalPrice.toFixed(2)}
            </Text>
            <Button title="Podnesi narudžbu" onPress={() => {/* checkout */}} />
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
  },
  quantityWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,            // ← adds 12pt of space above the quantity controls
    /* ...other styles */
  }  
});

export default CartScreen;