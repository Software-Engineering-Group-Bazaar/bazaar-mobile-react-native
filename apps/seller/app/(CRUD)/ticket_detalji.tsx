// File: app/(CRUD)/ticket_detalji.tsx
import React, { useState, useCallback, useEffect } from "react"; // Dodaj useEffect
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router"; // useFocusEffect nije neophodan ovde ako se oslanjamo na useEffect sa ticketId
import { useTranslation } from "react-i18next";
import { apiFetchTicketDetails } from "../api/ticketApi";
import { Ticket, TicketStatus } from "../types/ticket";
import { InfoCard } from "@/components/ui/cards/InfoCard";
import SubmitButton from "@/components/ui/input/SubmitButton";
import { apiCreateConversation } from "../api/orderApi";
import * as SecureStore from "expo-secure-store";
import HelpAndLanguageButton from "@/components/ui/buttons/HelpAndLanguageButton";

const statusTextMap: Record<TicketStatus, string> = {
  [TicketStatus.REQUESTED]: "ticket_status_requested",
  [TicketStatus.OPEN]: "ticket_status_open",
  [TicketStatus.RESOLVED]: "ticket_status_resolved",
};

const fallbackTextMap: Record<TicketStatus, string> = {
  [TicketStatus.REQUESTED]: "Zatražen",
  [TicketStatus.OPEN]: "Otvoren",
  [TicketStatus.RESOLVED]: "Riješen",
};

const getStatusText = (status: TicketStatus, t: Function): string => {
  const key = statusTextMap[status];
  return t(key) || fallbackTextMap[status] || status;
};

export default function TicketDetaljiScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ ticketId?: string }>(); // Označi ticketId kao opcioni za bolju proveru
  const ticketId = params.ticketId;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTicket = async (isRefresh = false) => {
    if (!ticketId) {
      Alert.alert(t("error"), t("ticket_id_missing") || "ID tiketa nedostaje.");
      if (!isRefresh) setLoading(false);
      setRefreshing(false);
      if (router.canGoBack()) router.back();
      return;
    }
    if (!isRefresh) setLoading(true);
    try {
      const fetchedTicket = await apiFetchTicketDetails(ticketId);
      setTicket(fetchedTicket); // Može biti null ako nije pronađen
      if (!fetchedTicket && !isRefresh) {
        // Ako nije pronađen i nije refresh, prikaži poruku
        Alert.alert(
          t("info") || "Info",
          t("ticket_not_found") || "Tiket nije pronađen."
        );
      }
    } catch (error: any) {
      console.error("Error fetching ticket details:", error);
      Alert.alert(
        t("error"),
        error.message ||
          t("failed_to_load_ticket_details") ||
          "Nije uspelo učitavanje detalja tiketa."
      );
    } finally {
      if (!isRefresh) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId, t]); // Ponovo učitaj ako se ticketId ili t promene

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTicket(true);
  }, [ticketId, t]);

  const handleOpenChat = async () => {
    if (ticket?.conversationId) {
      router.push(
        `../(CRUD)/pregled_chata?conversationId=${ticket.conversationId}&buyerUsername=${ticket.adminUsername}`
      );
    } else if (ticket) {
      const storeId = Number(SecureStore.getItem("storeId"));
      try {
        const conversation = await apiCreateConversation(
          ticket.userId,
          storeId,
          ticket.orderId
        );

        if (conversation) {
          router.push(
            `../(CRUD)/pregled_chata?conversationId=${conversation.id}&buyerUsername=${conversation.adminUserId}`
          );
        }
      } catch (error) {
        console.error("Error creating conversation:", error);
      }
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4E8D7C" />
        <Text>
          {t("loading_ticket_details") || "Učitavanje detalja tiketa..."}
        </Text>
      </View>
    );
  }

  if (!ticket) {
    // Ako je tiket null (nije pronađen ili greška)
    return (
      <View style={styles.centered}>
        <HelpAndLanguageButton showHelpButton={false} />
        <Text style={{ fontSize: 16, marginTop: 20, textAlign: "center" }}>
          {t("ticket_not_found_details") ||
            "Detalji tiketa nisu pronađeni ili tiket ne postoji."}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#4E8D7C"]}
        />
      }
    >
      <View style={styles.container}>
        <HelpAndLanguageButton showHelpButton={false} />
        {/* <Text style={styles.title}>{t("ticket_details_title") || "Detalji tiketa"}</Text> Uklonjen naslov */}

        <InfoCard
          icon="hashtag"
          title={t("ticket_id") || "ID Tiketa"}
          text={ticket.id.toString()}
        />
        <InfoCard
          icon="archive"
          title={t("related_order") || "Povezana narudžba"}
          text={`${ticket.orderId || "N/A"} (ID: ${ticket.orderId})`}
        />
        <InfoCard
          icon="comment-alt"
          title={t("ticket_subject_label") || "Naslov"}
          text={ticket.title}
        />
        <InfoCard
          icon="info-circle"
          title={t("ticket_status_label") || "Status"}
          text={getStatusText(ticket.status, t)}
        />
        <InfoCard
          icon="calendar-alt"
          title={t("created_at_label") || "Datum kreiranja"}
          text={new Date(ticket.createdAt).toLocaleString()}
        />
        <InfoCard
          icon="calendar-check"
          title={t("last_updated_label") || "Poslednja izmena"}
          text={new Date(ticket.createdAt).toLocaleString()}
        />

        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionLabel}>
            {t("ticket_description_label") || "Opis problema"}:
          </Text>
          <Text style={styles.descriptionText}>{ticket.description}</Text>
        </View>

        <SubmitButton
          buttonText={t("send_message") || "Pošalji poruku"}
          onPress={handleOpenChat}
          disabled={ticket.status != TicketStatus.OPEN}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, backgroundColor: "#fff", paddingBottom: 40 },
  container: { paddingHorizontal: 20, paddingTop: 20, alignItems: "center" }, // Smanjen paddingTop
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  descriptionBox: {
    width: "100%",
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 16,
    color: "#4E8D7C",
    lineHeight: 22,
  },
});
