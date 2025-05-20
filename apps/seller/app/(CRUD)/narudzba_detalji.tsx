import React, { useEffect, useState } from "react";
import {
 View,
 ScrollView,
 RefreshControl,
 ActivityIndicator,
 Text,
 TouchableOpacity,
 Image,
 StyleSheet,
 Alert,
 TextInput,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import LanguageButton from "../../components/ui/buttons/LanguageButton";
import StatusBadge from "../../components/ui/StatusBadge";
import StatusButtons from "../../components/ui/StatusButtons";
import { InfoCard } from "../../components/ui/cards/InfoCard";
import {
 getOrderById,
 updateOrderStatus,
 apiCreateConversation,
 deleteOrder as deleteOrderApi,
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
 const [preparationModalVisible, setPreparationModalVisible] = useState(false);
 const [prepTime, setPrepTime] = useState<number | null>(null);
 const [selfDelivery, setSelfDelivery] = useState(true);


 const handleStartConversation = async (buyerId: number, storeId: number, orderId: number) => {
   try {
     const conversationId = await apiCreateConversation(buyerId, storeId, orderId);
     router.push(`./pregled_chata?conversationId=${conversationId}&buyerUsername=${order.buyerUserName}`);
   } catch (error) {
     console.error("Error starting conversation:", error);
   }
 };

 const fetchOrder = async () => {
  if (!id) return;
  setLoading(true);
  try {
    const orderData = await getOrderById(id);
    setOrder(orderData);

    // Otvori modal SAMO ako je status Confirmed I expectedReadyAt je null
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

  Alert.alert(t("Confirm Status Change"), t("Are you sure you want to change the order status?"), [
    { text: t("Cancel"), style: "cancel" },
    {
      text: t("Yes"),
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
  ]);
};

 const handleDeleteOrder = () => {
   Alert.alert(t("Confirm Delete"), t("Are you sure you want to delete this order?"), [
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
  } catch (error) {
    Alert.alert(t("Failed to update status"));
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
       <Text>{t("Order not found")}</Text>
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


     <View style={styles.buyerContainer}>
       <Text style={styles.buyerText}>
         {t("buyer")}: <Text style={{ fontWeight: "400" }}>{String(order.buyerUserName)}</Text>
       </Text>
       <TouchableOpacity
         style={styles.messageButton}
         onPress={() => handleStartConversation(order.buyerId, order.storeId, order.id)}
       >
         <Text style={styles.messageButtonText}>{t("send_message")}</Text>
       </TouchableOpacity>
     </View>


     <ScrollView
       style={styles.container}
       refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchOrder} />}
     >
       <InfoCard
         icon="clock"
         title={t("Created At")}
         text={`${new Date(order.time).toLocaleString()} (${getTimeAgo(order.time, t)})`}
       />

      {order.addressDetails?.address && (
        <InfoCard
          icon="map-marker"
          title={t("delivery_address")}
          text={order.addressDetails.address}
        />
      )}

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
     </ScrollView>


     {preparationModalVisible && (
       <View style={styles.modalOverlay}>
         <View style={styles.modalContent}>
           <Text style={styles.modalTitle}>{t("Select Delivery Type")}</Text>
           <View style={styles.deliveryOptionsContainer}>
             <TouchableOpacity
               style={[styles.deliveryOption, selfDelivery && styles.selectedDeliveryOption]}
               onPress={() => setSelfDelivery(true)}
             >
               <Text style={[styles.deliveryOptionText, selfDelivery && styles.selectedDeliveryOptionText]}>
                 {t("Self Delivery")}
               </Text>
             </TouchableOpacity>
             <TouchableOpacity
               style={[styles.deliveryOption, !selfDelivery && styles.selectedDeliveryOption]}
               onPress={() => setSelfDelivery(false)}
             >
               <Text style={[styles.deliveryOptionText, !selfDelivery && styles.selectedDeliveryOptionText]}>
                 {t("Admin Delivery")}
               </Text>
             </TouchableOpacity>
           </View>


           <Text style={styles.modalTitle}>{t("Expected Preparation Time")}</Text>
           <View style={styles.prepInputContainer}>
             <TextInput
               value={prepTime?.toString() || ""}
               onChangeText={(text) => setPrepTime(Number(text))}
               keyboardType="numeric"
               style={styles.input}
             />
             <Text style={styles.minLabel}>min</Text>
           </View>


           <View style={styles.modalButtonsRow}>
             <TouchableOpacity style={[styles.sendOrdersButton, { flex: 1 }]} onPress={handleSubmitPreparation}>
               <Text style={styles.sendOrdersText}>{t("Submit")}</Text>
             </TouchableOpacity>
           </View>
         </View>
       </View>
     )}
   </View>
 );
}


const styles = StyleSheet.create({
 wrapper: { flex: 1, paddingTop: 70 },
 container: { flex: 1, backgroundColor: "#F2F2F7", padding: 16 },
 header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 8 },
 orderId: { fontSize: 20, fontWeight: "600", marginLeft: 12 },
 buyerContainer: {
   flexDirection: "row",
   alignItems: "center",
   justifyContent: "space-between",
   backgroundColor: "#fff",
   borderRadius: 12,
   padding: 16,
   marginHorizontal: 16,
   marginBottom: 8,
   marginTop: 10,
 },
 buyerText: { fontSize: 16, fontWeight: "600", color: "#333", flexShrink: 1, marginRight: 8 },
 messageButton: { backgroundColor: "#4E8D7C", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
 messageButtonText: { color: "#fff", fontWeight: "600" },
 section: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginVertical: 8 },
 sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
 product: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
 img: { width: 50, height: 50, borderRadius: 8 },
 totalContainer: {
   flexDirection: "row",
   justifyContent: "space-between",
   marginTop: 12,
   borderTopWidth: 1,
   borderTopColor: "#eee",
   paddingTop: 8,
 },
 totalLabel: { fontSize: 16, fontWeight: "600" },
 totalAmount: { fontSize: 16, color: "#4E8D7C", fontWeight: "600" },
 modalOverlay: {
   position: "absolute",
   top: 0, left: 0, right: 0, bottom: 0,
   backgroundColor: "rgba(0,0,0,0.5)",
   justifyContent: "center",
   alignItems: "center",
   zIndex: 10,
 },
 modalContent: {
   width: "90%",
   backgroundColor: "#fff",
   borderRadius: 12,
   padding: 20,
 },
 modalTitle: { fontSize: 16, fontWeight: "600", marginBottom: 16 },
 deliveryOptionsContainer: { flexDirection: "row", gap: 8, marginBottom: 16 },
 deliveryOption: {
   flex: 1,
   padding: 12,
   borderWidth: 1,
   borderColor: "#E0E0E0",
   alignItems: "center",
   borderRadius: 8,
   backgroundColor: "#FFFFFF",
 },
 selectedDeliveryOption: { backgroundColor: "#4E8D7C", borderColor: "#4E8D7C" },
 deliveryOptionText: { fontSize: 14, fontWeight: "500", color: "#1C1C1E" },
 selectedDeliveryOptionText: { color: "#FFFFFF" },
 prepInputContainer: {
   flexDirection: "row",
   alignItems: "center",
   marginBottom: 16,
 },
 input: {
   borderWidth: 1,
   borderColor: "#ccc",
   borderRadius: 8,
   paddingHorizontal: 12,
   paddingVertical: 8,
   width: 100,
   fontSize: 16,
   marginRight: 8,
   textAlign: "center",
   backgroundColor: "#fff",
 },
 minLabel: { fontSize: 16, fontWeight: "500" },
 modalButtonsRow: { flexDirection: "row", gap: 10, marginTop: 8 },
 sendOrdersButton: {
   flexDirection: "row",
   justifyContent: "center",
   alignItems: "center",
   backgroundColor: "#4E8D7C",
   paddingVertical: 10,
   paddingHorizontal: 16,
   borderRadius: 20,
 },
 sendOrdersText: { color: "#FFFFFF", fontWeight: "600" },
});
