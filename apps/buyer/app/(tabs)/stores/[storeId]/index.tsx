import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import * as SecureStore from "expo-secure-store";
import { useCart } from "@/context/CartContext";
import { baseURL, USE_DUMMY_DATA } from "proba-package";

interface ProductCategory {
  id: number;
  name: string;
}
interface Product {
  id: number;
  name: string;
  productCategory: ProductCategory; // Umjesto productcategoryid
  retailPrice: number; // Umjesto price
  wholesalePrice: number; // Dodano
  weight?: number; // Ispravljen typo
  weightUnit?: string; // Ispravljen typo
  volume?: number;
  volumeUnit?: string;
  storeId: number; // Umjesto storeID
  photos: string[]; // Umjesto imageUrl
  isActive: boolean;
  wholesaleThreshold?: number;
}

const DUMMY_PRODUCTS: Product[] = [
  {
    id: 101,
    name: "Mlijeko 1L",
    productCategory: { id: 1, name: "Mliječni proizvodi" },
    retailPrice: 2.5,
    wholesalePrice: 2.2,
    storeId: 1,
    photos: ["https://via.placeholder.com/300/ADD8E6/000000?Text=Mlijeko"],
    isActive: true,
    wholesaleThreshold: 10,
  },
  {
    id: 102,
    name: "Hljeb",
    productCategory: { id: 2, name: "Pekarski proizvodi" },
    retailPrice: 1.2,
    wholesalePrice: 1.0,
    storeId: 1,
    photos: ["https://via.placeholder.com/300/F0E68C/000000?Text=Hljeb"],
    isActive: true,
  },
  {
    id: 103,
    name: "Jabuke 1kg",
    productCategory: { id: 3, name: "Voće" },
    retailPrice: 1.8,
    wholesalePrice: 1.5,
    weight: 1,
    weightUnit: "kg",
    storeId: 1,
    photos: ["https://via.placeholder.com/300/90EE90/000000?Text=Jabuke"],
    isActive: true,
    wholesaleThreshold: 50,
  },
  {
    id: 104,
    name: "Banane 1kg",
    productCategory: { id: 3, name: "Voće" },
    retailPrice: 2.0,
    wholesalePrice: 1.7,
    weight: 1,
    weightUnit: "kg",
    storeId: 1,
    photos: ["https://via.placeholder.com/300/FFFF00/000000?Text=Banane"],
    isActive: false,
  },
  {
    id: 105,
    name: "Kruh pšenični",
    productCategory: { id: 2, name: "Pekarski proizvodi" },
    retailPrice: 1.5,
    wholesalePrice: 1.3,
    storeId: 2,
    photos: ["https://via.placeholder.com/300/F0E68C/000000?Text=Kruh"],
    isActive: true,
    wholesaleThreshold: 20,
  },
  {
    id: 106,
    name: "Jogurt 500g",
    productCategory: { id: 1, name: "Mliječni proizvodi" },
    retailPrice: 1.1,
    wholesalePrice: 0.9,
    weight: 500,
    weightUnit: "g",
    storeId: 2,
    photos: ["https://via.placeholder.com/300/ADD8E6/000000?Text=Jogurt"],
    isActive: true,
  },
  {
    id: 107,
    name: "Apple iPhone 13",
    productCategory: { id: 4, name: "Elektronika" },
    retailPrice: 999,
    wholesalePrice: 950,
    storeId: 4,
    photos: ["https://via.placeholder.com/300/87CEEB/FFFFFF?Text=Iphone"],
    isActive: true,
    wholesaleThreshold: 5,
  },
  {
    id: 108,
    name: "Samsung Galaxy S21",
    productCategory: { id: 4, name: "Elektronika" },
    retailPrice: 950,
    wholesalePrice: 900,
    storeId: 4,
    photos: ["https://via.placeholder.com/300/87CEEB/FFFFFF?Text=Samsung"],
    isActive: true,
  },
  {
    id: 109,
    name: "Slušalice Bose",
    productCategory: { id: 4, name: "Elektronika" },
    retailPrice: 200,
    wholesalePrice: 180,
    storeId: 4,
    photos: ["https://via.placeholder.com/300/D3D3D3/000000?Text=Slušalice"],
    isActive: true,
    wholesaleThreshold: 15,
  },
  {
    id: 110,
    name: 'Dell Monitor 24" Full HD',
    productCategory: { id: 4, name: "Elektronika" },
    retailPrice: 300,
    wholesalePrice: 280,
    storeId: 4,
    photos: ["https://via.placeholder.com/300/87CEEB/FFFFFF?Text=Monitor"],
    isActive: true,
  },
  {
    id: 111,
    name: "Čaj Zeleni",
    productCategory: { id: 5, name: "Pića" },
    retailPrice: 3.0,
    wholesalePrice: 2.5,
    storeId: 2,
    photos: ["https://via.placeholder.com/300/32CD32/000000?Text=Čaj"],
    isActive: true,
    wholesaleThreshold: 100,
  },
  {
    id: 112,
    name: "Kafa Moka",
    productCategory: { id: 5, name: "Pića" },
    retailPrice: 5.5,
    wholesalePrice: 5.0,
    storeId: 3,
    photos: ["https://via.placeholder.com/300/D2691E/000000?Text=Kafa"],
    isActive: true,
  },
  {
    id: 113,
    name: "Vino Cabernet Sauvignon",
    productCategory: { id: 6, name: "Alkoholna pića" },
    retailPrice: 15.0,
    wholesalePrice: 13.0,
    storeId: 5,
    photos: ["https://via.placeholder.com/300/8B0000/FFFFFF?Text=Vino"],
    isActive: true,
    wholesaleThreshold: 30,
  },
  {
    id: 114,
    name: "Pivo Heineken",
    productCategory: { id: 6, name: "Alkoholna pića" },
    retailPrice: 1.8,
    wholesalePrice: 1.5,
    storeId: 5,
    photos: ["https://via.placeholder.com/300/00FF00/FFFFFF?Text=Pivo"],
    isActive: true,
  },
  {
    id: 115,
    name: "Računarski miš Logitech",
    productCategory: { id: 4, name: "Elektronika" },
    retailPrice: 25.0,
    wholesalePrice: 22.0,
    storeId: 5,
    photos: ["https://via.placeholder.com/300/D3D3D3/000000?Text=Miš"],
    isActive: true,
    wholesaleThreshold: 25,
  },
  {
    id: 116,
    name: 'Gaming Monitor 27"',
    productCategory: { id: 4, name: "Elektronika" },
    retailPrice: 400,
    wholesalePrice: 380,
    storeId: 4,
    photos: [
      "https://via.placeholder.com/300/87CEEB/FFFFFF?Text=Gaming+Monitor",
    ],
    isActive: true,
  },
  {
    id: 117,
    name: 'LED TV 40"',
    productCategory: { id: 4, name: "Elektronika" },
    retailPrice: 350,
    wholesalePrice: 330,
    storeId: 4,
    photos: ["https://via.placeholder.com/300/87CEEB/FFFFFF?Text=TV"],
    isActive: true,
    wholesaleThreshold: 10,
  },
  {
    id: 118,
    name: 'Knjiga "The Great Gatsby"',
    productCategory: { id: 7, name: "Knjige" },
    retailPrice: 15.0,
    wholesalePrice: 12.0,
    storeId: 1,
    photos: ["https://via.placeholder.com/300/FF6347/FFFFFF?Text=Knjiga"],
    isActive: true,
  },
  {
    id: 119,
    name: 'Knjiga "1984"',
    productCategory: { id: 7, name: "Knjige" },
    retailPrice: 10.0,
    wholesalePrice: 8.0,
    storeId: 4,
    photos: ["https://via.placeholder.com/300/FF6347/FFFFFF?Text=Knjiga"],
    isActive: true,
    wholesaleThreshold: 50,
  },
];

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

export default function StoreProductsScreen() {
  const { storeId: storeIdString } = useLocalSearchParams<{
    storeId: string;
  }>();
  const storeId = storeIdString ? +storeIdString : undefined;
  const router = useRouter();
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<number>(0);

  useEffect(() => {
    if (!storeId || isNaN(storeId)) {
      setError(new Error(t("invalid_store_id") || "Invalid Store ID"));
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      setError(null);
      if (USE_DUMMY_DATA) {
        const dummy = DUMMY_PRODUCTS.filter((p) => p.storeId === storeId);
        setTimeout(() => {
          setProducts(dummy);
          setLoading(false);
        }, 300);
        return;
      }
      try {
        const token = await SecureStore.getItemAsync("auth_token");
        const res = await fetch(
          `${baseURL}/api/Catalog/products?storeId=${encodeURIComponent(
            storeId
          )}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setProducts(await res.json());
      } catch (e: any) {
        setError(e instanceof Error ? e : new Error(t("fetch-error")!));
      } finally {
        setLoading(false);
      }
    })();
  }, [storeId]);

  const categories = useMemo(() => {
    const uniq = Array.from(
      new Map(
        products.map((p) => [p.productCategory.id, p.productCategory])
      ).values()
    );
    return [{ id: 0, name: t("all") || "All" }, ...uniq];
  }, [products]);

  const filtered = useMemo(() => {
    return selectedCategory === 0
      ? products
      : products.filter((p) => p.productCategory.id === selectedCategory);
  }, [products, selectedCategory]);

  const goToDetails = () =>
    router.push({
      pathname: "/screens/store/[storeId]",
      params: { storeId: storeIdString },
    });

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4e8d7c" />
      </View>
    );
  if (error)
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error.message}</Text>
      </View>
    );

  return (
    <>
      {/* 1) header config */}
      <Stack.Screen
        options={{
          headerTitle: t("store_products") || "Proizvodi",
          headerRight: () => (
            <TouchableOpacity
              onPress={goToDetails}
              style={styles.headerButton}
              activeOpacity={0.7}
            >
              <Ionicons name="storefront-outline" size={24} color="#4e8d7c" />
            </TouchableOpacity>
          ),
        }}
      />

      <SafeAreaView style={styles.container}>
        {/* Floating Store Details */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.7}
          onPress={() =>
            router.push({
              pathname: "/screens/store/[storeId]",
              params: { storeId: storeIdString },
            })
          }
        >
          <Ionicons name="storefront-outline" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>{t("store_products") || "Proizvodi"}</Text>

        {/* 2) category chips */}
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipContainer}
          keyExtractor={(c) => c.id.toString()}
          renderItem={({ item }) => {
            const isSel = item.id === selectedCategory;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item.id)}
                style={[styles.chip, isSel && styles.chipSelected]}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.chipText, isSel && styles.chipTextSelected]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* 3) product grid */}
        <FlatList
          data={filtered}
          keyExtractor={(p) => p.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => router.push(`/stores/${storeId}/${item.id}`)}
            >
              <Image source={{ uri: item.photos[0] }} style={styles.image} />
              <Text numberOfLines={1} style={styles.name}>
                {item.name}
              </Text>
              <View style={styles.bottomRow}>
                <Text style={styles.price}>
                  {item.retailPrice.toFixed(2)} KM
                </Text>
                <TouchableOpacity onPress={() => addToCart(item)}>
                  <Ionicons name="cart-outline" size={20} color="#4e8d7c" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  fab: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#4e8d7c",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#333",
    alignSelf: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
  headerButton: {
    marginRight: 16,
    padding: 6,
    backgroundColor: "#fff",
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
   chipContainer: {
    height: 50,
    paddingHorizontal: 16,
    paddingVertical: 8,    // give some vertical breathing room
    alignItems: 'center',  // vertically center your chips
  },
  chip: {
    paddingVertical: 6,   
    paddingHorizontal: 14,
    backgroundColor: '#ffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderRadius: 20,
    marginRight: 8,
   borderWidth: 1,
    borderColor: '#ddd',
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: "#4e8d7c",
    borderColor: "#4e8d7c",
  },
  chipText: {
    fontSize: 14,
    color: "#555",
  },
  chipTextSelected: {
    color: "#fff",
    fontWeight: "normal",
  },
  list: {
   flexGrow: 1,
   paddingTop: 16,
   justifyContent: 'flex-start',
   paddingHorizontal: 16,
   paddingBottom: 24,
 },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: CARD_WIDTH,
    resizeMode: "cover",
  },
  name: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    margin: 8,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4e8d7c",
  },
});
