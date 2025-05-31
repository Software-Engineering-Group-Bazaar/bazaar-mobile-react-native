import React, { useState, useEffect, useRef } from "react";
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
  Switch,
  Dimensions
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
import { Ionicons } from "@expo/vector-icons";
import Tooltip from "react-native-walkthrough-tooltip";

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
  pointRate?: number;
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
  //walkthrough
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);
  const flatListContainerRef = useRef(null); 
  const usePointsSwitchRef = useRef(null);
  const addressPickerRef = useRef(null); 
  const submitOrderButtonRef = useRef(null);

  //fje za help
  const startWalkthrough = () => {
    // Provjeri da li ima stavki u korpi prije pokretanja
    if (cartItems.length > 0) {
      setShowWalkthrough(true);
      setWalkthroughStep(1); // Počni od prvog koraka
    } else {
      Alert.alert(t('no_items_for_tutorial_title'), t('no_items_for_tutorial_message'));
    }
  };

  const goToNextStep = () => {
    setWalkthroughStep(prevStep => prevStep + 1);
  };

  const goToPreviousStep = () => {
    setWalkthroughStep(prevStep => prevStep - 1);
  };

  const finishWalkthrough = () => {
    setShowWalkthrough(false);
    setWalkthroughStep(0);
  };

  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  //nova stanja za poene
  const [usePoints, setUsePoints] = useState<boolean>(false);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [spendingPointRate, setSpendingPointRate] = useState<number>(0);

  const totalPrice = cartItems.reduce((sum, { product, qty }) => {
    const useWholesale =
      product.wholesaleThreshold !== undefined &&
      qty > product.wholesaleThreshold;
    const pricePerUnit = useWholesale
      ? product.wholesalePrice
      : product.retailPrice;
    return sum + pricePerUnit * qty;
  }, 0);
  //racunanje vezano za poene 
  const pointsInMoney = userPoints * spendingPointRate;
  const remainingAmount = usePoints ? Math.max(totalPrice - pointsInMoney, 0) : totalPrice;
  //koliko ce se poena osvojiti 
  const earnedPoints = cartItems.reduce((sum, { product, qty }) => {
    const useWholesale =
      product.wholesaleThreshold !== undefined &&
      qty > product.wholesaleThreshold;
    const pricePerUnit = useWholesale
      ? product.wholesalePrice
      : product.retailPrice;
    return sum + Math.floor(pricePerUnit * qty * (product.pointRate || 0)); 
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

  //fje za dohvacanje poena i stope poena
  const fetchUserPoints= async()=>{
    if(USE_DUMMY_DATA){
      setUserPoints(750)
      setSpendingPointRate(0.05)
      return;
    }else{ 
      try{
        const authToken=await SecureStore.getItemAsync("auth_token");
        if(!authToken){
          console.error("No login token for fetching points.");
          return;
        }
        const responsePoints=await fetch(`${baseURL}/api/Loyalty/users/points/my`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        });
        const responseRate = await fetch(`${baseURL}/api/Loyalty/consts/spending`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        });

        if(responsePoints.ok){
          const pointsData = await responsePoints.text();
          setUserPoints(parseInt(pointsData) || 0); //valjda se vako zove atribut za poene
        }else{
          console.error(`Failed to fetch user points: ${responsePoints.status}`);
          setUserPoints(0)
        }

        if(responseRate.ok){
          const rateData = await responseRate.text();
          setSpendingPointRate(parseFloat(rateData) || 0); //valjda se vako zove atribut za spending rate
        }else{
          console.error(`Failed to fetch spending point rate: ${responseRate.status}`);
          setSpendingPointRate(0);
        }
      }catch(error){
        console.error("Error fetching loyalty data:", error);
        setUserPoints(0);
        setSpendingPointRate(0);
      }
    }
  }

  useEffect(() => {
      fetchUserPoints();
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
      const orderPayload : {storeId: number; orderItems: ProductPayload[], addressId: number, usingPoints: boolean;} = {
        storeId: cartItems[0].product.storeId,
        orderItems: [],
        addressId: parseInt(selectedLocationId),
        usingPoints: usePoints //da li ce se koristiti poeni, valjda je taj naziv
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
      if(usePoints){
        fetchUserPoints();
      }
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
            renderItem={({ item, index }) => {
              if(index===0){
                return(
                  <Tooltip
                  isVisible={showWalkthrough && walkthroughStep === 1}
                  content={
                  <View style={styles.tooltipContent}>
                  <Text style={{ fontSize: 16, marginBottom: 10 }}>
                  {t('tutorial_cartitem_tutorial')}
                  </Text>
                <View style={styles.tooltipButtonContainer}>
                <TouchableOpacity
                  style={[styles.tooltipButtonBase, styles.tooltipNextButton]}
                  onPress={goToNextStep}
                >
                  <Text style={styles.tooltipButtonText}>{t('next')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              }
             placement="bottom"
             onClose={finishWalkthrough}
             tooltipStyle={{ width: Dimensions.get('window').width * 0.8 }}
             useReactNativeModal={true}
             arrowSize={{ width: 16, height: 8 }}
             showChildInTooltip={true}
             >
          <View style={{ flexShrink: 1, width: '100%' }}>
          <CartItem
            product={item.product}
            quantity={item.qty}
            onPress={() => handleProductPress(item.product)}
          />
          </View>
        </Tooltip>
                );
              } else {
                return(
              <CartItem
                product={item.product}
                quantity={item.qty}
                onPress={() => handleProductPress(item.product)}
              />
                );
              }
            }}
          />
          <View style={styles.summary}>
            <Text style={styles.totalText}>
              {t('total')}: {totalPrice.toFixed(2)} KM
            </Text>
              {/* prikaz opcije za trošenje poena i detalja o tome */}
            <View style={styles.pointsOptionContainer}>
              <Text style={styles.summaryLabel}>{t('use_points')}</Text>
              <Tooltip
        isVisible={showWalkthrough && walkthroughStep === 2}
        content={
          <View style={styles.tooltipContent}>
            <Text style={{ fontSize: 16, marginBottom: 10 }}>
              {t('tutorial_use_points')}
            </Text>
            <View style={styles.tooltipButtonContainer}>
              <TouchableOpacity
                style={[styles.tooltipButtonBase, styles.tooltipPrevButton]}
                onPress={goToPreviousStep}
              >
                <Text style={styles.tooltipButtonText}>{t('previous')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tooltipButtonBase, styles.tooltipNextButton]}
                onPress={goToNextStep}
              >
                <Text style={styles.tooltipButtonText}>{t('next')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        placement="left"
        onClose={finishWalkthrough}
        tooltipStyle={{ width: Dimensions.get('window').width * 0.8 }}
        useReactNativeModal={true}
        arrowSize={{ width: 16, height: 8 }}
        showChildInTooltip={true}
      >
              <Switch
                onValueChange={(value) => setUsePoints(value)}
                value={usePoints}
                trackColor={{ false: "#767577", true: "green" }}
                ref={usePointsSwitchRef}
              />
              </Tooltip>
            </View>

            {usePoints && ( // ako cemo trositi poene
              <View style={styles.pointsDetailsContainer}>
                <Text style={styles.summaryLabel}>{t('your_points')}: {userPoints.toFixed(2)}</Text>
                <Text style={styles.summaryLabel}>{t('points_value')}: {pointsInMoney.toFixed(2)} KM</Text>
                <Text style={styles.summaryLabel}>{t('remaining_to_pay')}: {remainingAmount.toFixed(2)} KM</Text>
                <Text style={styles.summaryLabel}>
                  {t('points_after_transaction')}: {Math.max(userPoints - (totalPrice > pointsInMoney ? userPoints : totalPrice / spendingPointRate), 0).toFixed(2)}
                </Text>
              </View>
            )}

            {!usePoints && ( // ako necemo trosit poene
              <View style={styles.pointsDetailsContainer}>
                <Text style={styles.summaryLabel}>{t('points_earned')}: {earnedPoints.toFixed(2)}</Text>
              </View>
            )}
            <Tooltip
        isVisible={showWalkthrough && walkthroughStep === 3}
        content={
          <View style={styles.tooltipContent}>
            <Text style={{ fontSize: 16, marginBottom: 10 }}>
              {t('tutorial_select_address')} 
            </Text>
            <View style={styles.tooltipButtonContainer}>
              <TouchableOpacity
                style={[styles.tooltipButtonBase, styles.tooltipPrevButton]}
                onPress={goToPreviousStep}
              >
                <Text style={styles.tooltipButtonText}>{t('previous')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tooltipButtonBase, styles.tooltipNextButton]}
                onPress={goToNextStep}
              >
                <Text style={styles.tooltipButtonText}>{t('next')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        placement="center"
        onClose={finishWalkthrough}
        tooltipStyle={{ width: Dimensions.get('window').width * 0.8 }}
        useReactNativeModal={true}
        arrowSize={{ width: 16, height: 8 }}
        showChildInTooltip={true}
      >
              <Picker
                selectedValue={selectedLocationId}
                onValueChange={setSelectedLocationId}
                style={styles.picker}
                ref={addressPickerRef}
              >
                <Picker.Item label={t("select_address")} value="" />
                {savedLocations.map(loc => (
                  <Picker.Item key={loc.id} label={loc.address} value={loc.id} />
                ))}
              </Picker>
              </Tooltip>

              <Tooltip
        isVisible={showWalkthrough && walkthroughStep === 4}
        content={
          <View style={styles.tooltipContent}>
            <Text style={{ fontSize: 16, marginBottom: 10 }}>
              {t('tutorial_submit_order')}
            </Text>
            <View style={styles.tooltipButtonContainer}>
              <TouchableOpacity
                style={[styles.tooltipButtonBase, styles.tooltipPrevButton]}
                onPress={goToPreviousStep}
              >
                <Text style={styles.tooltipButtonText}>{t('previous')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tooltipButtonBase, styles.tooltipFinishButton]}
                onPress={finishWalkthrough}
              >
                <Text style={styles.tooltipButtonText}>{t('finish')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        placement="top"
        onClose={finishWalkthrough}
        tooltipStyle={{ width: Dimensions.get('window').width * 0.8 }}
        useReactNativeModal={true}
        arrowSize={{ width: 16, height: 8 }}
        showChildInTooltip={true}
      >
        <View style={styles.submitButtonWrapper}>
              <Button
                title={t('submit_order')}
                onPress={checkoutOrder}
                disabled={!selectedLocationId || cartItems.length === 0}
                color={'#4e8d7c'}
                ref={submitOrderButtonRef} 
              />
              </View>
            </Tooltip>
        </View>
        </>
      )}
      <TouchableOpacity
         style={styles.fab}
           activeOpacity={0.8}
           onPress={startWalkthrough}
          >
          <Ionicons name="help-circle-outline" size={30} color="#fff" />
         </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  submitButtonWrapper: {
    width: '100%',
    alignSelf: 'center', 
  },
  tooltipButtonBase: { 
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25, // Više zaobljeno
        marginHorizontal: 5,
        elevation: 2, // Mala sjena
        minWidth: 80, // Minimalna širina
        alignItems: 'center', // Centriraj tekst
    },
  tooltipContent: {
    alignItems: 'center',
    padding: 5,
  },
  tooltipButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  tooltipNextButton: {
    backgroundColor: '#4E8D7C',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  tooltipPrevButton: {
    backgroundColor: '#4E8D7C', 
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  tooltipFinishButton: {
    backgroundColor: '#4E8D7C',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  tooltipButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#4E8D7C',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
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
  },
  pointsOptionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pointsDetailsContainer: {
    marginBottom: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  picker: { 
    height: 50,
    width: '100%',
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  }
});

export default CartScreen;
