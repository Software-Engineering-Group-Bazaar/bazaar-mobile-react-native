import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import StatusFilter from "../../components/ui/StatusFilter";
import OrderCard from "../../components/ui//cards/OrderCard";
import { updateOrderStatus } from "../api/orderApi";
import api from "../api/defaultApi";
import { Send } from "lucide-react-native";
import { OrderStatusEnum, OrderStatus } from "../../constants/statusTypes";
import * as SecureStore from "expo-secure-store";
import HelpAndLanguageButton from "@/components/ui/buttons/HelpAndLanguageButton";
import {
  CopilotStep,
  walkthroughable,
  useCopilot,
  CopilotProvider,
} from "react-native-copilot";

const { height } = Dimensions.get("window");
const COLUMN_GAP = 16;
const WalkthroughableView = walkthroughable(View);

type Order = {
  id: number;
  createdAt: string;
  totalAmount: number;
  status: OrderStatus;
  adminDelivery?: boolean;
  address?: string;
};

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

function OrdersScreenContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<OrderStatus[]>([]);
  const [sortNewestFirst, setSortNewestFirst] = useState(true);
  const [hasRouteId, setHasRouteId] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);

  useEffect(() => {
    async function checkRouteId() {
      const routeId = await SecureStore.getItemAsync("routeId");
      setHasRouteId(!!routeId);
    }
    checkRouteId();
  }, []);

  const fetchOrders = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await api.get("/Order/MyStore");
      const mapped: Order[] = await Promise.all(
        res.data
          .filter((o: any) => OrderStatusEnum.includes(o.status))
          .map(async (o: any, index: number): Promise<Order> => {
            let address = "";
            try {
              if (o.addressId) {
                const addrRes = await api.get(`/user-profile/address/${o.addressId}`);
                address = addrRes.data.address;
              }
            } catch (e) {
              console.warn(`Failed to load address for order ${o.id}`, e);
            }
            return {
              id: o.id ?? index,
              createdAt: o.time,
              totalAmount: o.total,
              status: o.status,
              address,
              adminDelivery: o.adminDelivery,
            };
          })
      );
      setOrders(mapped);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setRefreshing(false);
    }
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

  const selectableOrders = sortedOrders.filter(
    (order) => order.status === "Ready" && !order.adminDelivery
  );

  const toggleOrderSelection = (orderId: number) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const toggleSelectionMode = () => {
    if (selectionMode) {
      setSelectedOrders([]);
      setSelectedStatuses([]);
    } else {
      setSelectedStatuses(["Ready"]);
    }
    setSelectionMode(!selectionMode);
  };

  const handleSubmitOrders = async () => {
    try {
      await Promise.all(
        selectedOrders.map((orderId) => updateOrderStatus(orderId.toString(), "Sent"))
      );
      router.push({ pathname: "/maps", params: { orders: JSON.stringify(selectedOrders) } });
      fetchOrders();
      setSelectedOrders([]);
      setSelectionMode(false);
    } catch (error) {
      Alert.alert(t("Error"), t("failed_to_update_some_orders"));
    }
  };

  const handlePreviousRoute = async () => {
    try {
      router.push({ pathname: "/default_maps" });
    } catch (error) {
      Alert.alert("Error");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <HelpAndLanguageButton showHelpButton={true} />
      <HiddenHelpStarter />

      <ScrollView
        style={styles.scrollWrapper}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchOrders} />}
      >
        <CopilotStep text={t("help_status_filter")} order={1} name="statusFilter">
          <WalkthroughableView>
            <StatusFilter
              selectedStatuses={selectedStatuses}
              toggleStatus={toggleStatus}
              sortNewestFirst={sortNewestFirst}
              setSortNewestFirst={setSortNewestFirst}
              setSelectedStatuses={setSelectedStatuses}
              showOnlyStatusFilter
            />
          </WalkthroughableView>
        </CopilotStep>

        <CopilotStep text={t("help_sorting_toggle")} order={2} name="sortToggle">
          <WalkthroughableView>
            <StatusFilter
              selectedStatuses={selectedStatuses}
              toggleStatus={toggleStatus}
              sortNewestFirst={sortNewestFirst}
              setSortNewestFirst={setSortNewestFirst}
              setSelectedStatuses={setSelectedStatuses}
              showOnlySortToggle
            />
          </WalkthroughableView>
        </CopilotStep>

        <View style={styles.headerContainer}>
          <View style={styles.actionContainer}>
            {selectableOrders.length > 0 && !selectionMode && (
              <CopilotStep text={t("help_send_orders")} order={3} name="sendOrdersButton">
                <WalkthroughableView>
                  <TouchableOpacity
                    style={styles.sendOrdersButton}
                    onPress={toggleSelectionMode}
                  >
                    <Send size={18} color="#FFFFFF" />
                    <Text style={styles.sendOrdersText}>{t("send_orders")}</Text>
                  </TouchableOpacity>
                </WalkthroughableView>
              </CopilotStep>
            )}

            {hasRouteId && (
              <CopilotStep text={t("help_previous_route")} order={4} name="previousRouteButton">
                <WalkthroughableView style={{ flex: 1 }}>
                  <TouchableOpacity
                    style={[styles.sendOrdersButton, { flex: 1, backgroundColor: "#808080", marginLeft: 8 }]}
                    onPress={handlePreviousRoute}
                  >
                    <Text style={styles.sendOrdersText}>{t("Previous Route")}</Text>
                  </TouchableOpacity>
                </WalkthroughableView>
              </CopilotStep>
            )}
          </View>

          {selectionMode && selectedOrders.length > 0 && (
            <View style={styles.submitCancelContainer}>
              <TouchableOpacity
                style={[styles.sendOrdersButton, { flex: 1, marginRight: 8 }]}
                onPress={handleSubmitOrders}
              >
                <Send size={18} color="#FFFFFF" />
                <Text style={styles.sendOrdersText}>{t("create_route")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendOrdersButton, { flex: 1, backgroundColor: "#A9A9A9" }]}
                onPress={toggleSelectionMode}
              >
                <Text style={styles.sendOrdersText}>{t("Cancel")}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {selectionMode && selectedOrders.length > 0 && (
          <View style={styles.selectedCountContainer}>
            <Text style={styles.selectedCountText}>
              {t("Selected")}: {selectedOrders.length}
            </Text>
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#4E8D7C" style={styles.loader} />
        ) : (
          <FlatList
            data={sortedOrders}
            renderItem={({ item }) => (
              <OrderCard
                order={item}
                selectionMode={selectionMode}
                selected={selectedOrders.includes(item.id)}
                onSelect={() => selectionMode && toggleOrderSelection(item.id)}
                selectable={item.status === "Ready" && !item.adminDelivery}
                needsPrepTime={false}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </View>
  );
}

export default function OrdersScreen() {
  const { t } = useTranslation();
    return (
      <CopilotProvider
        labels={{
          finish: t("Finish"),
          next: t("Next"),
          skip: t("Skip"),
          previous: t("Previous")
        }}>
      <OrdersScreenContent />
    </CopilotProvider>
  );
}

const styles = StyleSheet.create({
  scrollWrapper: { flex: 1, backgroundColor: "#F2F2F7" },
  scrollContent: { paddingTop: height * 0.09, paddingBottom: height * 0.1 },
  headerContainer: { paddingHorizontal: 16, flexDirection: "column" },
  actionContainer: { gap: 12, flexDirection: "row" },
  listContainer: { padding: COLUMN_GAP },
  loader: { marginTop: 32 },
  sendOrdersButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4E8D7C",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  sendOrdersText: { color: "#FFFFFF", fontWeight: "600", marginLeft: 8 },
  selectedCountContainer: {
    backgroundColor: "#E8F5F1",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedCountText: { color: "#4E8D7C", fontWeight: "600" },
  submitCancelContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
});