import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import { apiFetchActiveStore } from "../api/storeApi";
import { Store } from "../types/prodavnica";
import CreateButton from "@/components/ui/buttons/CreateButton";
import TouchableCard from "@/components/ui/cards/TouchableCard";
import * as SecureStore from "expo-secure-store";
import LogoutButton from "@/components/ui/buttons/LogoutButton";
import { logoutApi } from "../api/auth/logoutApi";
import HelpAndLanguageButton from "@/components/ui/buttons/HelpAndLanguageButton";
import {
  CopilotStep,
  walkthroughable,
  useCopilot,
  CopilotProvider,
} from "react-native-copilot";

const WalkthroughableView = walkthroughable(View);

function HiddenHelpStarter() {
  const { start } = useCopilot();

  useEffect(() => {
    // @ts-ignore
    global.triggerHelpTutorial = () => start();
    return () => {
      // @ts-ignore
      delete global.triggerHelpTutorial;
    };
  }, [start]);

  return null;
}

function StoresScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [store, setStore] = useState<Store>();

  const handleLogout = async () => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");

      const response = await logoutApi(token);

      if (response === 200) {
        await SecureStore.deleteItemAsync("accessToken");
        Alert.alert(t("logout_title"), t("logout_message"));
        router.replace("/(auth)/login");
      } else {
        Alert.alert(t("error"), t("logout_failed"));
        return;
      }
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert(t("error"), t("something_went_wrong"));
    }
  };

  useEffect(() => {
    async function getStore() {
      setLoading(true);
      const activeStore = await apiFetchActiveStore();
      if (activeStore) {
        await SecureStore.setItem("storeId", activeStore.id.toString());
        setStore(activeStore);
      }
      setLoading(false);
    }
    getStore();
  }, []);

  const handleCreateStore = () => {
    router.push("../(CRUD)/postavke_prodavnice");
  };

  const handleViewOrders = () => {
    router.push("../(CRUD)/pregled_narudzbi");
  };
  const handleViewReviews = () => {
    if (store) {
      router.push(
        `../(CRUD)/pregled_reviews?storeId=${
          store.id
        }&storeName=${encodeURIComponent(store.name)}`
      );
    } else {
      // Opciono: obavesti korisnika
      console.warn("Store is not defined, cannot view reviews.");
    }
  };

  const handleViewSupportTickets = () => {
    router.push("../(CRUD)/pregled_ticketa");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <HiddenHelpStarter />
      <HelpAndLanguageButton showHelpButton={true} />
      <View style={styles.topBar}>
        <CopilotStep text={t("Logout Button") } order={1} name="logoutButton">
          <WalkthroughableView>
            <LogoutButton onPress={handleLogout} />
          </WalkthroughableView>
        </CopilotStep>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={true}
      >
        <View style={[styles.container]}>
          {store == null ? (
            <CreateButton
              text={t("add_a_new_store")}
              onPress={handleCreateStore}
              loading={loading}
            />
          ) : (
            <View style={styles.cardsContainer}>
              <CopilotStep text={t("Store Details") } order={2} name="storeInfo">
                <WalkthroughableView>
                  <TouchableCard
                    title={store.name}
                    textRows={[store.categoryName, store.description]}
                    onPress={() =>
                      router.push(
                        `/(CRUD)/prodavnica_detalji?store=${JSON.stringify(store)}`
                      )
                    }
                  />
                </WalkthroughableView>
              </CopilotStep>
              <TouchableCard
                title={t("view_orders")}
                textRows={[
                  t("view_orders_description") ||
                    "View all orders for this store",
                ]}
                onPress={handleViewOrders}
              />
              <TouchableCard
                title={t("store_reviews")}
                textRows={[t("store_reviews_description")]}
                onPress={handleViewReviews}
              />
              {/* NOVA KARTICA ZA KORISNIČKU PODRŠKU */}
              <TouchableCard
                title={t("customer_support") || "Korisnička podrška"}
                textRows={[
                  t("customer_support_description") ||
                    "Kontaktirajte podršku ili pregledajte tikete",
                ]}
                onPress={handleViewSupportTickets}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export default function StoresScreenContent() {
  const { t } = useTranslation();
  return (
    <CopilotProvider
      labels={{
        finish: t("Finish"),
        next: t("Next"),
        skip: t("Skip"),
        previous: t("Previous")
      }}>
      <StoresScreen />
    </CopilotProvider>
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 16,
    height: 55, // fixed height to match typical navbar size
    backgroundColor: "#fff",
  },
});
