import React, { useEffect, useState } from "react";
import {View, ScrollView, RefreshControl, ActivityIndicator, Text, TouchableOpacity, Image, StyleSheet, Alert} from "react-native";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons"; 
import LanguageButton from "../../components/ui/buttons/LanguageButton";
import StatusBadge from "../../components/ui/StatusBadge";
import StatusButtons from "../../components/ui/StatusButtons";
import { InfoCard } from "../../components/ui/cards/InfoCard";
import { getOrderById, updateOrderStatus, deleteOrder as deleteOrderApi} from "../api/orderApi"; 

const ORDER_STATUS_FLOW: Record<string, string[]> = {
  Requested: ["Confirmed", "Rejected"],
  Confirmed: ["Ready", "Rejected"],
  Ready: ["Sent", "Rejected"],
  Sent: ["Delivered"],
};

const getTimeAgo = (timestamp: string, t: any) => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t("just now");
  if (minutes < 60) return t("min ago", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("h ago", { count: hours });
  const days = Math.floor(hours / 24);
  return t("d ago", { count: days });
};

export default function NarudzbaDetalji() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const orderData = await getOrderById(id);
      setOrder(orderData);
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
    Alert.alert(
      t("Confirm Status Change"),t("Are you sure you want to change the order status?"),
      [{ text: t("Cancel"), style: "cancel" }, {text: t("Yes"),
          onPress: async () => {
            try {
              setLoading(true);
              await updateOrderStatus(id, status);
              setOrder((prev: any) => ({ ...prev, status }));
            } catch {
              alert(t("Failed to update status"));
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteOrder = () => {
    Alert.alert(
      t("Confirm Delete"), t("Are you sure you want to delete this order?"),
      [{ text: t("Cancel"), style: "cancel" },{ text: t("Yes"),
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
      ]
    );
  };

  if (!order)
    return (
      <View style={styles.container}> <Text>{t("Order not found")}</Text> </View>
    );

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleDeleteOrder}> <FontAwesome name="trash" size={28} color="#e57373" /> </TouchableOpacity>
        <Text style={styles.orderId}>
          {t("Order")} #{order.id}
        </Text>
        <View style={{ flex: 1 }} />
        <StatusBadge status={order.status} />
      </View>
      <LanguageButton />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing} onRefresh={() => setRefreshing(true)} colors={["#4E8D7C"]} tintColor="#4E8D7C"/>
        }
      >
        <InfoCard
          icon="clock" title={t("Created At")} text={`${new Date(order.time).toLocaleString()} (${getTimeAgo(order.time, t)})`}
        />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("Products")}</Text>
          {order.items.map((item: any) => (
            <View key={item.id} style={styles.product}>
              <Image source={{ uri: item.productImageUrl }} style={styles.img} />
              <View style={{ flex: 1 }}>
                <Text>{item.productName}</Text>
                <Text>x{item.quantity}</Text>
              </View>
              <Text>{item.price} KM</Text>
            </View>
          ))}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>{t("Total Amount")}:</Text>
            <Text style={styles.totalAmount}>{order.total} KM</Text>
          </View>
        </View>
        {ORDER_STATUS_FLOW[order.status]?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("Change Status")}</Text>
            <StatusButtons
              statuses={ORDER_STATUS_FLOW[order.status]}
              onChange={handleStatusUpdate}
              disabled={loading}
            />
          </View>
        )}
        {loading && (
          <ActivityIndicator  size="large" color="#4E8D7C" style={{ marginTop: 16 }} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingTop: 70,
  },
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  orderId: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 12,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  product: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  img: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 16,
    color: "#4E8D7C",
    fontWeight: "600",
  },
});
