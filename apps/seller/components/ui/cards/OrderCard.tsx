import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { STATUS_COLORS } from '../../../constants/statusColors';
import { useTranslation } from "react-i18next";

type OrderStatus = keyof typeof STATUS_COLORS;

type Order = {
  id: number;
  createdAt: string;
  totalAmount: number;
  status: OrderStatus;
};

type OrderCardProps = {
  order: Order;
};

function getTimeAgo(
    timestamp: string,
    t: (key: string, options?: any) => string
  ) {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return t("just now");
    if (minutes < 60) return t("min ago", { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t("h ago", { count: hours });
    const days = Math.floor(hours / 24);
    return t("d ago", { count: days });
  }

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() =>
        router.push({
          pathname: "/(CRUD)/narudzba_detalji",
          params: { id: order.id.toString() },
        })
      }
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>
            {t("Order")} #{order.id}
        </Text>
        <View 
            style={[
                styles.statusBadge, 
                { backgroundColor: STATUS_COLORS[order.status] }
            ]}
        >
          <Text style={styles.statusText}>{t(order.status)}</Text>
        </View>
      </View>
      <View style={styles.orderInfo}>
        <Text style={styles.orderAmount}>
            {t("Total")}: {order.totalAmount} KM
        </Text>
        <Text style={styles.orderDate}>
            {new Date(order.createdAt).toLocaleDateString()} {t("at")}{" "}
            {new Date(order.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            })}{" "}
            ({getTimeAgo(order.createdAt, t)})
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4E8D7C',
  },
  orderDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  orderInfo: {
    gap: 4,
  },
});

export default OrderCard;
