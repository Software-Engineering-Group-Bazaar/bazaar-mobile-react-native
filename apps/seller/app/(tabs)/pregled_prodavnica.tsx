import { View, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import { apiFetchActiveStore } from "../api/storeApi";
import SetHeaderRight from "../../components/ui/NavHeader";
import { Store } from "../types/prodavnica";
import LanguageButton from "@/components/ui/buttons/LanguageButton";
import CreateButton from "@/components/ui/buttons/CreateButton";
import TouchableCard from "@/components/ui/cards/TouchableCard";
import * as SecureStore from "expo-secure-store";

export default function StoresScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [store, setStore] = useState<Store>();

  useEffect(() => {
    async function getStore() {
      setLoading(true);
      const activeStore = await apiFetchActiveStore();
      console.log(activeStore);
      if (activeStore) {
        await SecureStore.setItem("storeId", activeStore.id.toString());
        setStore(activeStore);
      }
      setLoading(false);
      console.log(activeStore);
    }
    getStore();
  }, []);

  const handleCreateStore = () => {
    router.push("../(CRUD)/postavke_prodavnice");
  };

  const handleViewOrders = () => {
    router.push("../(CRUD)/pregled_narudzbi");
  };

  return (
    <View style={{ flex: 1 }}>
      <SetHeaderRight title="Pregled prodavnice" />
      <LanguageButton />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={true}
      >
        <View style={[styles.container, { paddingTop: 40 }]}>
          {store == null ? (
            <CreateButton
              text={t("add_a_new_store")}
              onPress={handleCreateStore}
              loading={loading}
            />
          ) : (
            <View style={styles.cardsContainer}>
              <TouchableCard
                title={store.name}
                textRows={[store.categoryName, store.description]}
                onPress={() =>
                  router.push(
                    `/(CRUD)/prodavnica_detalji?store=${JSON.stringify(store)}`
                  )
                }
              />
              <TouchableCard
                title={t("view_orders")}
                textRows={[
                  t("view_orders_description") ||
                    "View all orders for this store",
                ]}
                onPress={handleViewOrders}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  cardsContainer: {
    padding: 16,
  },
});
