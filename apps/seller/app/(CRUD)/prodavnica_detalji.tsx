import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { FontAwesome5, FontAwesome } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import LanguageButton from "@/components/ui/LanguageButton";
import SetHeaderRight from "../../components/ui/NavHeader";

export default function PregledProdavnice() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const storeString = Array.isArray(params.store)
    ? params.store[0]
    : params.store;
  const store = storeString ? JSON.parse(storeString) : null;

  useEffect(() => {
    navigation.setOptions({
      title: t("store_overview"),
    });
  }, [i18n.language, navigation]);

  const handleSave = () => {
    if (store) {
      router.push(`../(CRUD)/pregled_proizvoda?storeId=${store.id}`);
    } else {
      console.error("Store ID is missing");
    }
  };

  if (!store) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 16 }}>
          {t("store_not_found") || "Prodavnica nije pronađena"}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <SetHeaderRight title="Detalji prodavnice" />
        <LanguageButton />

        <View style={styles.infoBox}>
          <FontAwesome5 name="store" size={18} color="#4E8D7C" />
          <Text style={styles.label}>{t("store_name")}:</Text>
          <Text style={styles.value}>{store.name}</Text>
        </View>

        <View style={styles.infoBox}>
          <FontAwesome name="map-marker" size={18} color="#4E8D7C" />
          <Text style={styles.label}>{t("address")}:</Text>
          <Text style={styles.value}>{store.address}</Text>
        </View>

        <View style={styles.infoBox}>
          <FontAwesome name="tag" size={18} color="#4E8D7C" />
          <Text style={styles.label}>{t("category")}:</Text>
          <Text style={styles.value}>{store.categoryName}</Text>
        </View>

        <View style={styles.infoBox}>
          <FontAwesome name="file-text" size={18} color="#4E8D7C" />
          <Text style={styles.label}>{t("description")}:</Text>
          <Text style={styles.value}>{store.description}</Text>
        </View>

        <TouchableOpacity
          style={styles.imageButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}> {t("view_all_products")}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
    backgroundColor: "#fff",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 100,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
  imageButton: {
    backgroundColor: "#4E8D7C",
    width: "100%",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: 10,
    marginBottom: 25,
  },
  placeholderImage: {
    width: 220,
    height: 220,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    backgroundColor: "#f0f0f0",
  },
  infoBox: {
    width: "100%",
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 5,
  },
  value: {
    fontSize: 16,
    color: "#4E8D7C",
    marginTop: 3,
  },
});
