import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import LanguageButton from "../../components/ui/buttons/LanguageButton";
import InputField from "../../components/ui/input/InputField";
import SubmitButton from "../../components/ui/input/SubmitButton";
import DropdownPicker from "../../components/ui/input/DropdownPicker";
import { apiCreateSellerTicket } from "../api/ticketApi";
import { apiFetchSellerOrders } from "../api/orderApi";
import { Order } from "../types/order";

export default function KreirajTicketScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [ordersForDropdown, setOrdersForDropdown] = useState<
    { label: number; value: number }[]
  >([]);
  const [openOrderDropdown, setOpenOrderDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      setLoadingOrders(true);
      try {
        const fetchedOrders: Order[] = await apiFetchSellerOrders();
        setOrdersForDropdown(
          fetchedOrders.map((order) => ({
            label: order.id,
            value: order.id,
          })).reverse()
        );
      } catch (error: any) {
        console.error("Error fetching orders:", error);
        Alert.alert(
          t("error"),
          error.message ||
            t("failed_to_load_orders") ||
            "Nije uspelo učitavanje narudžbi."
        );
      } finally {
        setLoadingOrders(false);
      }
    }
    fetchOrders();
  }, [t]);

  const handleCreateTicket = async () => {
    if (!selectedOrderId) {
      Alert.alert(
        t("error"),
        t("select_order_for_ticket_validation") || "Molimo izaberite narudžbu."
      );
      return;
    }
    if (!subject.trim() || !description.trim()) {
      Alert.alert(
        t("error"),
        t("fill_all_ticket_fields") || "Molimo popunite naslov i opis tiketa."
      );
      return;
    }

    setLoading(true);
    try {
      const payload = {
        orderId: selectedOrderId,
        title: subject.trim(),
        description: description.trim(),
      };
      const newTicket = await apiCreateSellerTicket(payload);
      if (newTicket) {
        router.replace({
          pathname: "/(CRUD)/ticket_detalji",
          params: { ticketId: newTicket.id },
        });
      }
    } catch (error: any) {
      console.error("Error creating ticket:", error);
      Alert.alert(
        t("error"),
        error.message ||
          t("something_went_wrong_ticket") ||
          "Došlo je do greške prilikom kreiranja tiketa."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <LanguageButton />
      <View style={{ height: 85 }} /> 
      <View style={styles.container}>
        {/* Naslov je uklonjen jer je u _layout.tsx */}

        {loadingOrders && (
          <ActivityIndicator
            size="small"
            color="#4E8D7C"
            style={{ marginBottom: 20, marginTop: 20 }}
          />
        )}
        {ordersForDropdown.length > 0 && !loadingOrders && (
          // View omotač za DropdownPicker nije neophodan jer tvoja komponenta već ima View sa zIndex
          <DropdownPicker
            open={openOrderDropdown}
            value={selectedOrderId}
            items={ordersForDropdown} // Koristi state koji je namenjen za items
            setOpen={setOpenOrderDropdown}
            setValue={setSelectedOrderId}
            setItems={setOrdersForDropdown} // Prosledi setItems
            placeholder={t("select_order_for_ticket") || "Izaberite narudžbu"}
          />
        )}
        {ordersForDropdown.length === 0 && !loadingOrders && (
          <Text style={styles.noOrdersText}>
            {t("no_orders_to_select_ticket") ||
              "Nema dostupnih narudžbi za odabir."}
          </Text>
        )}

        <InputField
          // icon="comment-alt" // Tvoj InputField ima drugačiji način za ikonicu, ili je nema za ovaj tip
          label={t("ticket_subject") || "Naslov tiketa"} // Koristi label prop
          placeholder={
            t("ticket_subject_placeholder") || "Unesite naslov tiketa"
          } // Placeholder je drugačiji
          value={subject}
          onChangeText={setSubject}
          multiline // Ovo je standardni TextInput prop, tvoj InputField bi trebalo da ga prosledi
          numberOfLines={2}
          style={{ marginBottom: 5 }}
          editable={!(loadingOrders || ordersForDropdown.length === 0)} // Koristi editable
          // isValid i errorText nisu potrebni ovde za sada
        />
        <InputField
          // icon="file-alt"
          label={t("ticket_description") || "Opis problema"}
          placeholder={
            t("ticket_description_placeholder") ||
            "Unesite detaljan opis problema"
          }
          value={description}
          onChangeText={setDescription}
          multiline // Ovo je standardni TextInput prop, tvoj InputField bi trebalo da ga prosledi
          numberOfLines={5}
          style={{ marginBottom: 25 }} // Tvoj InputField primenjuje marginBottom na textInputContainer, ovo je za mainContainer
          editable={!(loadingOrders || ordersForDropdown.length === 0)}
        />
        <SubmitButton
          onPress={handleCreateTicket}
          disabled={
            loading ||
            loadingOrders ||
            ordersForDropdown.length === 0 ||
            !selectedOrderId
          }
          buttonText={t("submit_ticket") || "Pošalji tiket"}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, backgroundColor: "#fff", paddingBottom: 40 },
  container: { paddingHorizontal: 20, paddingTop: 20, alignItems: "center" },
  noOrdersText: {
    marginTop: 20,
    marginBottom: 20,
    color: "gray",
    fontStyle: "italic",
    textAlign: "center",
  },
});
