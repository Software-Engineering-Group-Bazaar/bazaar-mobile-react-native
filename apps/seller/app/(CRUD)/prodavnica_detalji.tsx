import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import React from "react";

import SubmitButton from "@/components/ui/input/SubmitButton";
import { InfoCard } from "@/components/ui/cards/InfoCard";
import HelpAndLanguageButton from "@/components/ui/buttons/HelpAndLanguageButton";

export default function PregledProdavnice() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();

  const storeString = Array.isArray(params.store)
    ? params.store[0]
    : params.store;
  const store = storeString ? JSON.parse(storeString) : null;

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
        <HelpAndLanguageButton showHelpButton={false} />

        <InfoCard icon="store" title={t("store_name")} text={store.name} />

        <InfoCard icon="map-marker" title={t("address")} text={store.address} />

        <InfoCard icon="tag" title={t("category")} text={store.categoryName} />

        <InfoCard
          icon="file-alt"
          title={t("description")}
          text={store.description}
        />

        <SubmitButton
          buttonText={t("view_all_products")}
          onPress={handleSave}
        />
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
});
