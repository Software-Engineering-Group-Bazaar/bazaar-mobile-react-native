// File: app/(CRUD)/kreiraj_ticket.tsx
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
import DropdownPicker from "../../components/ui/input/DropdownPicker"; // Tvoja custom komponenta
import { apiCreateSellerTicket } from "../api/ticketApi";
import { apiFetchSellerOrders } from "../api/orderApi";
import { Order } from "../types/order";

// ------------- CO PILOT IMPORTS -------------
import {
  CopilotProvider,
  CopilotStep,
  walkthroughable,
} from "react-native-copilot";
import HelpAndLanguageButton from "@/components/ui/buttons/HelpAndLanguageButton";
// ------------------------------------------

const WalkthroughableView = walkthroughable(View);

function KreirajTicketContent() {
  const { t } = useTranslation();
  const router = useRouter();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [ordersForDropdown, setOrdersForDropdown] = useState<
    { label: string; value: number }[]
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
              label: `ID: ${order.id.toString()}`,
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
        orderId: selectedOrderId.toString(), // API očekuje string
        title: subject.trim(),
        description: description.trim(),
      };
      const newTicket = await apiCreateSellerTicket(payload);
      if (newTicket) {
        router.push({
          pathname: "/(CRUD)/ticket_detalji",
          params: { ticketId: newTicket.id.toString() },
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
      <HelpAndLanguageButton showLanguageButton={false} showHelpButton={true} />
      <View style={styles.container}>
        <View style={{height: 60}}/> {/* Spacer za HelpAndLanguageButton */}
        {loadingOrders && (
          <ActivityIndicator
            size="small"
            color="#4E8D7C"
            style={{ marginBottom: 20, marginTop: 20 }}
          />
        )}
        {ordersForDropdown.length > 0 && !loadingOrders && (
          <CopilotStep
            text={t("help_kreiraj_ticket_select_order") || "U ovo polje odaberite ID narudžbe za koju Vam treba korisnička podrška."}
            order={1}
            name="orderDropdown"
          >
            <WalkthroughableView style={{ width: "100%", zIndex: openOrderDropdown ? 1000 : 1 }}>
              <DropdownPicker // Koristi tvoju custom komponentu
                open={openOrderDropdown}
                value={selectedOrderId}
                items={ordersForDropdown}
                setOpen={setOpenOrderDropdown}
                setValue={setSelectedOrderId}
                setItems={setOrdersForDropdown}
                placeholder={
                  t("select_order_for_ticket") || "Izaberite narudžbu"
                }
                // listMode="MODAL" // << UKLONJEN OVAJ RED
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
          text={t("help_kreiraj_ticket_subject") || "Unesite naslov (predmet) vašeg problema ili upita."}
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
              autoCapitalize="sentences"
              editable={!(loadingOrders || ordersForDropdown.length === 0)}
            />
          </WalkthroughableView>
        </CopilotStep>

        <CopilotStep
          text={t("help_kreiraj_ticket_description") || "Detaljno opišite problem ili pitanje koje imate."}
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
              textAlignVertical="top"
              autoCapitalize="sentences"
              editable={!(loadingOrders || ordersForDropdown.length === 0)}
            />
          </WalkthroughableView>
        </CopilotStep>

        <CopilotStep
            text={t("help_kreiraj_ticket_submit_button") || "Kada popunite sva polja, kliknite ovdje da pošaljete tiket."}
            order={4}
            name="submitTicketButton"
        >
            <WalkthroughableView style={{width: "100%", marginTop: 10}}>
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
            </WalkthroughableView>
        </CopilotStep>
      </View>
    </ScrollView>
  );
}

export default function KreirajTicketScreen() {
  const { t } = useTranslation();
  return (
    <CopilotProvider
      labels={{
        finish: t("Finish") || "Završi",
        next: t("Next") || "Dalje",
        skip: t("Skip") || "Preskoči",
        previous: t("Previous") || "Nazad",
      }}
      overlay="svg"
      animated
      backdropColor="rgba(50, 50, 100, 0.7)"
      tooltipStyle={{ borderRadius: 10 }}
      stepNumberComponent={({currentStepNumber}) => (
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>{currentStepNumber}</Text>
        </View>
      )}
    >
      <KreirajTicketContent />
    </CopilotProvider>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, backgroundColor: "#fff", paddingBottom: 40 },
  container: { paddingHorizontal: 20, paddingTop: 0, alignItems: "center" },
  noOrdersText: {
    marginTop: 20,
    marginBottom: 20,
    color: "gray",
    fontStyle: "italic",
    textAlign: "center",
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#4E8D7C",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    color: "white",
    fontWeight: "bold",
  },
});