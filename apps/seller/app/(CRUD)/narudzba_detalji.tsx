import React, { useEffect, useState } from "react";
import { View, ScrollView, RefreshControl,  ActivityIndicator,  Alert,  StyleSheet,  TouchableOpacity, Text} from "react-native";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import LanguageButton from "../../components/ui/buttons/LanguageButton";
import StatusBadge from "../../components/ui/StatusBadge";
import StatusButtons from "../../components/ui/StatusButtons";
import { InfoCard } from "../../components/ui/cards/InfoCard";
import { BuyerInfoCard } from "../../components/ui/cards/BuyerInfoCard";
import { OrderProductList } from "../../components/ui/cards/OrderProductList";
import PreparationModal from "../../components/ui/modals/PreparationModal";
import { getOrderById,  updateOrderStatus,  apiCreateConversation,  deleteOrder as deleteOrderApi,
} from "../api/orderApi";

const ORDER_STATUS_FLOW: Record<string, string[]> = {
  Requested: ["Confirmed", "Rejected"],
  Confirmed: ["Ready", "Rejected"],
  Ready: ["Sent", "Rejected"],
  Sent: ["Delivered"],
};

const getTimeAgo = (timestamp: string, t: any) => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t("just_now");
  if (minutes < 60) return t("min_ago", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("h_ago", { count: hours });
  const days = Math.floor(hours / 24);
  return t("d_ago", { count: days });
};

export default function NarudzbaDetalji() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [preparationModalVisible, setPreparationModalVisible] = useState(false);
  const [prepTime, setPrepTime] = useState<number | null>(null);
  const [selfDelivery, setSelfDelivery] = useState(true);

  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const orderData = await getOrderById(id);
      setOrder(orderData);
      if (orderData.status === "Confirmed" && !orderData.expectedReadyAt) {
        setPreparationModalVisible(true);
      }
    } catch {
      alert(t("Failed to fetch order"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = (status: string) => {
    if (status === "Confirmed" && !order?.expectedReadyAt) {
      setPreparationModalVisible(true);
      return;
    }

    Alert.alert(t("Confirm_Status_Change"), t("Are_you_sure_you_want_to_change_the_order_status"), [
      { text: t("Cancel"), style: "cancel" },
      {
        text: t("Yes"),
        onPress: async () => {
          try {
            setLoading(true);
            await updateOrderStatus(id, status);
            setOrder((prev: any) => ({ ...prev, status }));
          } catch {
            alert(t("Failed_to_update_status"));
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleDeleteOrder = () => {
    Alert.alert(t("Confirm Delete"), t("Are_you_sure_you_want_to_delete_this_order"), [
      { text: t("Cancel"), style: "cancel" },
      {
        text: t("Yes"),
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await deleteOrderApi(id);
            router.back();
          } catch {
            alert(t("Failed to delete order"));
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleStartConversation = async () => {
    try {
      const conversationId = await apiCreateConversation(
        order.buyerId,
        order.storeId,
        order.id
      );
      router.push(`./pregled_chata?conversationId=${conversationId}&buyerUsername=${order.buyerUserName}`);
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  const handleSubmitPreparation = async () => {
    if (!prepTime || prepTime <= 0) {
      Alert.alert(t("Missing data"), t("Please enter a valid preparation time in minutes."));
      return;
    }
    try {
      setLoading(true);
      await updateOrderStatus(id, "Confirmed", !selfDelivery, prepTime);
      setOrder((prev: any) => ({ ...prev, status: "Confirmed" }));
      setPreparationModalVisible(false);
    } catch {
      alert(t("Failed_to_update_status"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4E8D7C" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <Text>{t("Order_not_found")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleDeleteOrder}>
          <FontAwesome name="trash" size={28} color="#e57373" />
        </TouchableOpacity>
        <Text style={styles.orderId}>{`${t("Order")} #${order.id}`}</Text>
        <View style={{ flex: 1 }} />
        <StatusBadge status={order.status} />
      </View>

      <LanguageButton />

      <BuyerInfoCard buyerUsername={order.buyerUserName} onMessagePress={handleStartConversation} t={t} />

      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchOrder} />}
      >
        <InfoCard
          icon="clock"
          title={t("Created_At")}
          text={`${new Date(order.time).toLocaleString()} (${getTimeAgo(order.time, t)})`}
        />

        {order.addressDetails?.address && (
          <InfoCard icon="map-marker" title={t("Delivery_Address")} text={order.addressDetails.address} />
        )}

        <OrderProductList items={order.items} total={order.total} t={t} />

        {ORDER_STATUS_FLOW[order.status]?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("Change_Status")}</Text>
            <StatusButtons
              statuses={ORDER_STATUS_FLOW[order.status]}
              onChange={handleStatusUpdate}
              disabled={loading}
            />
          </View>
        )}
      </ScrollView>

      <PreparationModal
        visible={preparationModalVisible}
        onClose={() => setPreparationModalVisible(false)}
        onSubmit={handleSubmitPreparation}
        prepTime={prepTime}
        setPrepTime={setPrepTime}
        selfDelivery={selfDelivery}
        setSelfDelivery={setSelfDelivery}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, paddingTop: 70 },
  container: { flex: 1, backgroundColor: "#F2F2F7", padding: 16 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 8 },
  orderId: { fontSize: 20, fontWeight: "600", marginLeft: 12 },
  section: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginVertical: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
});
