import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { STATUS_COLORS } from '../../../constants/statusColors';
import { useTranslation } from "react-i18next";
import { CircleCheck as CheckCircle, Circle } from 'lucide-react-native';

type OrderStatus = keyof typeof STATUS_COLORS;

type Order = {
 id: number;
 createdAt: string;
 totalAmount: number;
 status: OrderStatus;
 address?: string;
};

type OrderCardProps = {
 order: Order;
 selectionMode?: boolean;
 selected?: boolean;
 onSelect?: () => void;
 selectable?: boolean;
 onPrepTimeSet?: () => void;
 needsPrepTime?: boolean;
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

const OrderCard: React.FC<OrderCardProps> = ({
 order,
 selectionMode = false,
 selected = false,
 onSelect,
 selectable = false,
 onPrepTimeSet,
 needsPrepTime = false
}) => {
 const router = useRouter();
 const { t } = useTranslation();

 const handleCardPress = () => {
   if (selectionMode && selectable) {
     onSelect?.();
   } else {
     router.push({
       pathname: "/(CRUD)/narudzba_detalji",
       params: { id: order.id.toString() },
     });
   }
 };
 return (
   <TouchableOpacity
     style={[
       styles.orderCard,
       selectionMode && selectable && styles.selectableCard,
       selectionMode && !selectable && styles.disabledCard,
       selected && styles.selectedCard
     ]}
     onPress={handleCardPress}
     disabled={selectionMode && !selectable}
   >
     <View style={styles.orderHeader}>
       <View style={styles.orderHeaderLeft}>
         {selectionMode && selectable && (
           <View style={styles.checkboxContainer}>
             {selected ? (
               <CheckCircle color="#4E8D7C" size={24} />
             ) : (
               <Circle color="#4E8D7C" size={24} />
             )}
           </View>
         )}
         <Text style={styles.orderId}>
           {t("Order")} #{order.id}
         </Text>
       </View>
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
     {order.address && (
       <Text style={styles.orderAddress}>
       {t("Address")}: {order.address}
       </Text>
     )}
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
 selectableCard: {
   borderWidth: 1,
   borderColor: '#E0E0E0',
 },
 selectedCard: {
   borderWidth: 2,
   borderColor: '#4E8D7C',
   backgroundColor: '#F5FBF9',
 },
 disabledCard: {
   opacity: 0.6,
 },
 orderHeader: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   marginBottom: 12,
   alignItems: 'center',
 },
 orderHeaderLeft: {
   flexDirection: 'row',
   alignItems: 'center',
 },
 checkboxContainer: {
   marginRight: 10,
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
 orderAddress: {
  fontSize: 14,
  color: "#1C1C1E",
},
});

export default OrderCard;
