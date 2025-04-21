import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { FontAwesome } from "@expo/vector-icons";
import styles from "../styles";
import React, { useState, useEffect } from "react";
import { apiFetchActiveStores } from "../api/storeApi";
import SetHeaderRight from "../../components/ui/NavHeader";
import { Store } from "../types/prodavnica";
import LanguageButton from "@/components/ui/LanguageButton";
import CreateButton from "@/components/ui/CreateButton";

export default function StoresScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    async function getStores() {
      setLoading(true);
      const activeStores = await apiFetchActiveStores();
      setStores(activeStores);
      setLoading(false);
    }
    getStores();
  }, []);

  const handleCreateStore = () => {
    router.push("../(CRUD)/postavke_prodavnice");
  };

  const handleViewOrders = () => {
    router.push("../(CRUD)/pregled_narudzbi");
  };

  const renderStoreCard = ({ item }: { item: Store }) => (
    <>
      <TouchableOpacity
        style={styles.section}
        onPress={() =>
          router.push(
            `/(CRUD)/prodavnica_detalji?store=${JSON.stringify(item)}`
          )
        }
      >
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>{item.name}</Text>
          <Text style={styles.storeAddress}>{item.categoryName}</Text>
          <Text style={styles.storeAddress}>{item.description}</Text>
          {/* <Text style={styles.storeAddress}>{item.address}</Text> */}
        </View>
      </TouchableOpacity>

      {/* Sekcija: Pregled narudžbi */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.storeCard} onPress={handleViewOrders}>
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>{t("view_orders")}</Text>
            <Text style={styles.storeAddress}>
              {t("view_orders_description") || "View all orders for this store"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </>
  );

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
          <View style={styles.titleSpacing} />
          <Text style={styles.title}>{t("my_stores")}</Text>

          {stores.length === 0 && (
            <CreateButton
              text={t("add_a_new_store")}
              onPress={handleCreateStore}
              loading={loading}
            />
          )}

          <FlatList
            data={stores}
            renderItem={renderStoreCard}
            keyExtractor={(item: Store) => item.id.toString()}
            contentContainerStyle={[
              styles.listContainer,
              { paddingBottom: 100 },
            ]}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </View>
  );
}
