import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useTranslation } from "react-i18next";
import React, { useState, useEffect, useCallback } from "react";
import api from "../api/defaultApi";
import SetHeaderRight from "../../components/ui/NavHeader";
import LanguageButton from "@/components/ui/buttons/LanguageButton";
import StatusFilter from '../../components/ui/StatusFilter';
import OrderCard from '../../components/ui//cards/OrderCard';
import { OrderStatusEnum } from '../../constants/statusTypes';

const { height } = Dimensions.get("window");
const COLUMN_GAP = 16;

type OrderStatus = (typeof OrderStatusEnum)[number];

type Order = {
  id: number;
  createdAt: string;
  totalAmount: number;
  status: OrderStatus;
};

export default function OrdersScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<OrderStatus[]>([]);
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  const fetchOrders = useCallback(() => {
    setRefreshing(true);
    api
      .get("/Order/MyStore")
      .then((res) => {
        const mapped = res.data
          .filter((o: any) => OrderStatusEnum.includes(o.status)) // validacija
          .map((o: any, index: number) => ({
            id: o.id ?? index,
            createdAt: o.time,
            totalAmount: o.total,
            status: o.status as OrderStatus, // ispravno
          }));
        setOrders(mapped);
      })
      .catch((err) => console.error("Greška prilikom dohvata narudžbi:", err))
      .finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleStatus = (status: OrderStatus) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter((s) => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  const filteredOrders =
    selectedStatuses.length === 0
      ? orders
      : orders.filter((order) => selectedStatuses.includes(order.status));

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortNewestFirst ? dateB - dateA : dateA - dateB;
  });

  return (
    <>
      <View style={{ flex: 1 }}>
        <SetHeaderRight title={t("orders")} />
        <LanguageButton />

        <ScrollView
          style={styles.scrollWrapper}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchOrders} />
          }
        >
          <StatusFilter
            selectedStatuses={selectedStatuses}
            toggleStatus={toggleStatus}
            sortNewestFirst={sortNewestFirst}
            setSortNewestFirst={setSortNewestFirst}
            setSelectedStatuses={setSelectedStatuses}
          />

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#4E8D7C"
              style={styles.loader}
            />
          ) : (
            <FlatList
              data={sortedOrders}
              renderItem={({ item }) => <OrderCard order={item} />}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContainer}
              scrollEnabled={false}
            />
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scrollWrapper: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  scrollContent: {
    paddingTop: height * 0.09,
    paddingBottom: height * 0.1,
  },
  listContainer: {
    padding: COLUMN_GAP,
  },
  loader: {
    marginTop: 32,
  },
});
