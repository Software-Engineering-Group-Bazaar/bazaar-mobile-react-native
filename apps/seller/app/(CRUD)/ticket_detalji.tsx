// File: app/(CRUD)/ticket_detalji.tsx
import React, { useState, useCallback, useEffect } from "react"; // Dodaj useEffect
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router"; // useFocusEffect nije neophodan ovde ako se oslanjamo na useEffect sa ticketId
import { useTranslation } from "react-i18next";
import { apiFetchTicketDetails } from "../api/ticketApi";
import { Ticket, TicketStatus } from "../types/ticket";
import LanguageButton from "@/components/ui/buttons/LanguageButton";
import { InfoCard } from "@/components/ui/cards/InfoCard";

// Helperi (mogu biti u utils)
const getStatusText = (status: TicketStatus, t: Function) => {
  switch (status) {
    case TicketStatus.OPEN: return t("ticket_status_open") || "Otvoren";
    case TicketStatus.IN_PROGRESS: return t("ticket_status_in_progress") || "U obradi";
    case TicketStatus.RESOLVED: return t("ticket_status_resolved") || "Rešen";
    case TicketStatus.CLOSED: return t("ticket_status_closed") || "Zatvoren";
    default: return status;
  }
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
      if (!fetchedTicket && !isRefresh) { // Ako nije pronađen i nije refresh, prikaži poruku
          Alert.alert(t("info") || "Info", t("ticket_not_found") || "Tiket nije pronađen.");
      }
    } catch (error: any) {
      console.error("Error fetching ticket details:", error);
      Alert.alert(t("error"), error.message || t("failed_to_load_ticket_details") || "Nije uspelo učitavanje detalja tiketa.");
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


  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4E8D7C" />
        <Text>{t("loading_ticket_details") || "Učitavanje detalja tiketa..."}</Text>
      </View>
    );
  }

  if (!ticket) { // Ako je tiket null (nije pronađen ili greška)
    return (
      <View style={styles.centered}>
        <LanguageButton />
        <Text style={{ fontSize: 16, marginTop: 20, textAlign: 'center' }}>
          {t("ticket_not_found_details") || "Detalji tiketa nisu pronađeni ili tiket ne postoji."}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4E8D7C"]} />}
    >
      <View style={styles.container}>
        <LanguageButton />
        {/* <Text style={styles.title}>{t("ticket_details_title") || "Detalji tiketa"}</Text> Uklonjen naslov */}

        <InfoCard icon="hashtag" title={t("ticket_id") || "ID Tiketa"} text={ticket.id} />
        <InfoCard icon="archive" title={t("related_order") || "Povezana narudžba"} text={`${ticket.orderNumber || 'N/A'} (ID: ${ticket.orderId})`} />
        <InfoCard icon="comment-alt" title={t("ticket_subject_label") || "Naslov"} text={ticket.subject} />
        <InfoCard icon="info-circle" title={t("ticket_status_label") || "Status"} text={getStatusText(ticket.status, t)} />
        <InfoCard icon="calendar-alt" title={t("created_at_label") || "Datum kreiranja"} text={new Date(ticket.createdAt).toLocaleString()} />
        <InfoCard icon="calendar-check" title={t("last_updated_label") || "Poslednja izmena"} text={new Date(ticket.updatedAt).toLocaleString()} />

        <View style={styles.descriptionBox}>
            <Text style={styles.descriptionLabel}>{t("ticket_description_label") || "Opis problema"}:</Text>
            <Text style={styles.descriptionText}>{ticket.description}</Text>
        </View>

        <View style={styles.chatPlaceholder}>
            <Text style={styles.chatPlaceholderText}>
                {t("chat_will_be_here") || "Chat vezan za ovaj tiket će biti prikazan ovde."}
            </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, backgroundColor: "#fff", paddingBottom: 40 },
  container: { paddingHorizontal: 20, paddingTop: 20, alignItems: "center" }, // Smanjen paddingTop
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", padding: 20 },
  // title: { // Uklonjen stil za naslov
  //   fontSize: 26,
  //   fontWeight: "bold",
  //   color: "#4E8D7C",
  //   textAlign: "center",
  //   marginBottom: 20,
  // },
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
  chatPlaceholder: {
    marginTop: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#f0f0f0'
  },
  chatPlaceholderText: {
    color: '#555',
    fontStyle: 'italic'
  }
});