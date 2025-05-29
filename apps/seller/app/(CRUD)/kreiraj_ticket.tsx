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
import InputField from "../../components/ui/input/InputField";
import SubmitButton from "../../components/ui/input/SubmitButton";
import DropdownPicker from "../../components/ui/input/DropdownPicker";
import { apiCreateSellerTicket } from "../api/ticketApi";
import { apiFetchSellerOrders } from "../api/orderApi";
import { Order } from "../types/order";

import { CopilotStep, walkthroughable } from "react-native-copilot";
import HelpAndLanguageButton from "@/components/ui/buttons/HelpAndLanguageButton";

function KreirajTicketContent() {
  const { t } = useTranslation();
  const router = useRouter();

  const WalkthroughableView = walkthroughable(View);

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
          fetchedOrders
            .map((order) => ({
              label: order.id,
              value: order.id,
            }))
            .reverse()
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
      <HelpAndLanguageButton />
      <View style={{ height: 85 }} />
      <View style={styles.container}>
        {loadingOrders && (
          <ActivityIndicator
            size="small"
            color="#4E8D7C"
            style={{ marginBottom: 20, marginTop: 20 }}
          />
        )}
        {ordersForDropdown.length > 0 && !loadingOrders && (
          <CopilotStep
            text={t("help_select_order") || "Ovde birate narudžbu za tiket"}
            order={1}
            name="orderDropdown"
          >
            <WalkthroughableView style={{ width: "100%" }}>
              <DropdownPicker
                open={openOrderDropdown}
                value={selectedOrderId}
                items={ordersForDropdown}
                setOpen={setOpenOrderDropdown}
                setValue={setSelectedOrderId}
                setItems={setOrdersForDropdown}
                placeholder={
                  t("select_order_for_ticket") || "Izaberite narudžbu"
                }
              />
            </WalkthroughableView>
          </CopilotStep>
        )}
        {ordersForDropdown.length === 0 && !loadingOrders && (
          <Text style={styles.noOrdersText}>
            {t("no_orders_to_select_ticket") ||
              "Nema dostupnih narudžbi za odabir."}
          </Text>
        )}

        <CopilotStep
          text={t("help_subject") || "Unesite naslov tiketa ovde"}
          order={2}
          name="subjectInput"
        >
          <WalkthroughableView style={{ width: "100%" }}>
            <InputField
              label={t("ticket_subject") || "Naslov tiketa"}
              placeholder={
                t("ticket_subject_placeholder") || "Unesite naslov tiketa"
              }
              value={subject}
              onChangeText={setSubject}
              multiline
              numberOfLines={2}
              autoCapitalize="sentences"
              editable={!(loadingOrders || ordersForDropdown.length === 0)}
            />
          </WalkthroughableView>
        </CopilotStep>

        <CopilotStep
          text={t("help_description") || "Ovde detaljno objasnite problem"}
          order={3}
          name="descriptionInput"
        >
          <WalkthroughableView style={{ width: "100%" }}>
            <InputField
              label={t("ticket_description") || "Opis problema"}
              placeholder={
                t("ticket_description_placeholder") ||
                "Unesite detaljan opis problema"
              }
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              autoCapitalize="sentences"
              editable={!(loadingOrders || ordersForDropdown.length === 0)}
            />
          </WalkthroughableView>
        </CopilotStep>

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

// 👇 actual exported screen, now just wraps the content in CopilotProvider
export default function KreirajTicketScreen() {
  return <KreirajTicketContent />;
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
