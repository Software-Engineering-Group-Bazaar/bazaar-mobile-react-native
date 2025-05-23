import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Button,
  Touchable,
  Alert,
  TouchableOpacity,
} from "react-native";
import CartItem from "proba-package/cart-item/index";
// Pretpostavka da ova putanja vodi do AŽURIRANE ProductItem komponente
import ProductItem from "proba-package/product-item/index";
import { useTranslation } from "react-i18next";
import * as SecureStore from "expo-secure-store";
import { useCart } from "@/context/CartContext";
import { router } from "expo-router";
import { baseURL, USE_DUMMY_DATA } from "proba-package";
import { Picker } from '@react-native-picker/picker';

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
  retailPrice: number; // Promijenjeno iz price (koristit ćemo maloprodajnu cijenu)
  wholesalePrice: number; // Dodano
  weight?: number; // Promijenjeno iz wieght (ispravljen typo)
  weightUnit?: string; // Promijenjeno iz wieghtunit (ispravljen typo)
  volume?: number;
  volumeUnit?: string;
  storeId: number; // Promijenjeno iz storeID (usklađeno s formatom)
  photos: string[]; // Promijenjeno iz imageUrl u niz stringova
  isActive: boolean;
  wholesaleThreshold?: number;
}

interface ProductPayload {
  id: number;
  productId: number;
  price: number;
  quantity: number;
}

const CartScreen = () => {
  const { t } = useTranslation();
  const { cartItems, handleQuantityChange, clearCart } = useCart();
  interface SavedLocation {
    id: string;
    address: string;
    latitude: number;
    longitude: number;
  }

  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');

  const totalPrice = cartItems.reduce((sum, { product, qty }) => {
    const useWholesale =
      product.wholesaleThreshold !== undefined &&
      qty > product.wholesaleThreshold;
    const pricePerUnit = useWholesale
      ? product.wholesalePrice
      : product.retailPrice;
    return sum + pricePerUnit * qty;
  }, 0);

  const checkAndUpdateQuantitiesOnLoad = async () => {
    let hasQuantityChanged = false;

    for (const cartItem of cartItems) {
      try {
        const authToken = await SecureStore.getItemAsync("auth_token");
        const response = await fetch(
          baseURL +
            `/api/Inventory?productId=${cartItem.product.id}&storeId=${cartItem.product.storeId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          console.error(
            `Failed to fetch quantity for product ID: ${cartItem.product.id}`
          );
          continue;
        }

        let tmp = await response.json();
        console.log(tmp);
        const availableQuantity =
          tmp != null && tmp != undefined && tmp.length > 0
            ? tmp[0].quantity
            : undefined;
        console.log(availableQuantity);
        // const availableQuantity: number = await response.json();

        if (availableQuantity < cartItem.qty) {
          hasQuantityChanged = true;
          Alert.alert(
            t("quantity_changed_title"),
            t("quantity_changed_message", {
              productName: cartItem.product.name,
              availableQuantity,
              selectedQuantity: cartItem.qty,
            })
          );
          handleQuantityChange(cartItem.product, availableQuantity);
        }
      } catch (error) {
        console.error("Error checking inventory:", error);
      }
    }
  };

  useEffect(() => {
      if (USE_DUMMY_DATA) {
        setSavedLocations([
          { id: '1', address: '123 Main St, Springfield', latitude: 43.852, longitude: 18.361 },
          { id: '2', address: '456 Elm St, Springfield', latitude: 43.853, longitude: 18.362 },
        ]);
      } else {
        const authToken = SecureStore.getItem('auth_token');
        if (!authToken) {
          console.error("No login token");
          return;
        }
        fetch(`${baseURL}/api/user-profile/address`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        })
          .then(res => res.json())
          .then((data: SavedLocation[]) => setSavedLocations(data))
          .catch(err => {
            console.error('Load saved locations error:', err);
            Alert.alert('Error', 'Could not load saved locations.');
          });
      }
    }, []);

  useEffect(() => {
    if (cartItems.length > 0)
      checkAndUpdateQuantitiesOnLoad();
  }, [cartItems]);

  const handleProductPress = (product: Product) => {
    router.push(`/cart/details/${product.id}`);
  };

  const checkoutOrder = async () => {
    console.log(cartItems);
    if(cartItems.length && cartItems.length > 0){
      const orderPayload : {storeId: number; orderItems: ProductPayload[], addressId: number} = {
        storeId: cartItems[0].product.storeId,
        orderItems: [],
        addressId: parseInt(selectedLocationId)
      };
      console.log("storeId: " + cartItems[0].product.storeId);
      for (let i in cartItems) {
        let product = {
          id: 0,
          productId: cartItems[i].product.id,
          price:
            cartItems[i].product.wholesaleThreshold &&
            cartItems[i].qty >= cartItems[i].product.wholesaleThreshold
              ? cartItems[i].product.wholesalePrice
              : cartItems[i].product.retailPrice,
          quantity: cartItems[i].qty,
        };
        orderPayload.orderItems.push(product);
        console.log("product " + JSON.stringify(product));
      }

      console.log(JSON.stringify(orderPayload));

      const authToken = await SecureStore.getItemAsync("auth_token");
      const loginRes = await fetch(baseURL + "/api/OrderBuyer/order/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`, // Odkomentariši ako API zahteva token
        },
        body: JSON.stringify(orderPayload),
      });

      const loginData: any = await loginRes.json();

      if (loginRes.status != 201) {
        // Alert.alert(t('login_failed',), t('invalid_credentials'));
        Alert.alert("Narudžba neuspješna");
        return;
      }
      Alert.alert("Narudžba uspješna", "Narudžba je uspješno napravljena.");
      clearCart();
    }
  };

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t("empty_cart")}</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            contentContainerStyle={styles.list}
            keyExtractor={(item) => item.product.id.toString()}
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
              {t('total')}: {totalPrice.toFixed(2)} KM
            </Text>
              <Picker
                selectedValue={selectedLocationId}
                onValueChange={setSelectedLocationId}
              >
                <Picker.Item label="Select address" value="" />
                {savedLocations.map(loc => (
                  <Picker.Item key={loc.id} label={loc.address} value={loc.id} />
                ))}
              </Picker>

              <Button
                title={t('submit_order')}
                onPress={checkoutOrder}
                disabled={!selectedLocationId || cartItems.length === 0}
                color={'#4e8d7c'}
              />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 18, color: "#555" },
  footer: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    // Android elevation
    elevation: 6,
  },
  list: {
    padding: 16,
  },
  summary: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#555",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  checkoutButton: {
    backgroundColor: "#4e8d7c",
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // Android elevation
    elevation: 4,
  },
  checkoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  }
});

export default CartScreen;
