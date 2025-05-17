// File: app/(CRUD)/pregled_ticketa.tsx
import React, { useState, useCallback } from "react"; // Ukloni useEffect ako se ne koristi direktno
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, Alert } from "react-native"; // Dodaj Alert
import { useRouter, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import { apiFetchSellerTickets } from "../api/ticketApi"; // Prilagodi putanju
import { Ticket, TicketStatus } from "../types/ticket"; // Prilagodi putanju
import LanguageButton from "@/components/ui/buttons/LanguageButton";
// import CreateButton from "@/components/ui/buttons/CreateButton"; // UKLONJENO
import TouchableCard from "@/components/ui/cards/TouchableCard";
import { TextStyle } from "react-native";

// Helperi za status (ostaju isti ili ih premesti u utils)
const getStatusText = (status: TicketStatus, t: Function) => {
  switch (status) {
    case TicketStatus.OPEN: return t("ticket_status_open") || "Otvoren";
    case TicketStatus.IN_PROGRESS: return t("ticket_status_in_progress") || "U obradi";
    case TicketStatus.RESOLVED: return t("ticket_status_resolved") || "Rešen";
    case TicketStatus.CLOSED: return t("ticket_status_closed") || "Zatvoren";
    default: return status;
  }
};
type FontWeight = TextStyle['fontWeight'];

const getStatusStyle = (status: TicketStatus): TextStyle => { // Eksplicitno definiši povratni tip
  switch (status) {
    case TicketStatus.OPEN:
      return { color: "red", fontWeight: "bold" as FontWeight }; // Cast u FontWeight
    case TicketStatus.IN_PROGRESS:
      return { color: "orange", fontWeight: "bold" as FontWeight };
    case TicketStatus.RESOLVED:
      return { color: "green", fontWeight: "bold" as FontWeight };
    case TicketStatus.CLOSED:
      return { color: "gray", fontWeight: "bold" as FontWeight };
    default:
      // Vrati osnovni stil ili neki podrazumevani
      return { color: "black" }; // Možeš dodati i fontWeight: "normal" as FontWeight ako je potrebno
  }
};

export default function PregledTicketaScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const fetchedTickets = await apiFetchSellerTickets();
      setTickets(fetchedTickets);
    } catch (error: any) {
      console.error("Error fetching tickets:", error);
      Alert.alert(t("error") || "Greška", error.message || t("failed_to_load_tickets") || "Nije uspelo učitavanje tiketa.");
    } finally {
      if (!isRefresh) setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTickets(true);
  }, []);

  // handleCreateNewTicket je UKLONJENO jer je dugme sada u headeru definisanom u _layout.tsx

  const handleViewTicketDetails = (ticketId: string) => {
    router.push({ pathname: "/(CRUD)/ticket_detalji", params: { ticketId } });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4E8D7C" />
        <Text>{t("loading_tickets") || "Učitavanje tiketa..."}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <LanguageButton />
      {/* Naslov i CreateButton su UKLONJENI odavde */}
      {/*
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{t("my_support_tickets") || "Moji tiketi podrške"}</Text>
        <CreateButton
            text={t("create_new_ticket_button") || "Kreiraj novi tiket"}
            onPress={handleCreateNewTicket} // Ova funkcija više ne postoji ovde
            style={{ marginHorizontal: 20, marginBottom: 10 }}
        />
      </View>
      */}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4E8D7C"]} />}
      >
        {tickets.length === 0 && !loading ? (
          <View style={styles.centeredInfo}>
            <Text style={styles.noTicketsText}>{t("no_tickets_found") || "Nema aktivnih tiketa."}</Text>
            <Text style={styles.noTicketsSubText}>{t("pull_to_refresh_or_create") || "PovuSvite nadole da osvežite ili kreirajte novi tiket koristeći '+' dugme u gornjem desnom uglu."}</Text>
          </View>
        ) : (
          tickets.map((ticket) => (
            <TouchableCard
              key={ticket.id}
              title={ticket.subject}
              textRows={[
                `${t("order_ref") || "Narudžba"}: ${ticket.orderNumber || ticket.orderId}`,
                <Text key={`status-${ticket.id}`}>
                  {t("status") || "Status"}: <Text style={getStatusStyle(ticket.status)}>{getStatusText(ticket.status, t)}</Text>
                </Text>,
                `${t("created_at") || "Kreirano"}: ${new Date(ticket.createdAt).toLocaleDateString()}`,
              ]}
              onPress={() => handleViewTicketDetails(ticket.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  centeredInfo: { // Malo drugačiji stil za poruku kada nema tiketa
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 50, // Da ne bude skroz na vrhu
  },
  // headerContainer: { // Više nije potrebno ovde
  //   paddingTop: 20,
  //   alignItems: "center",
  // },
  // title: { // Više nije potrebno ovde
  //   fontSize: 24,
  //   fontWeight: "bold",
  //   color: "#4E8D7C",
  //   textAlign: "center",
  //   marginBottom: 20,
  // },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 10, // Dodaj malo prostora na vrhu ako LanguageButton smeta
  },
  noTicketsText: {
    fontSize: 18, // Povećaj font
    color: "#6B7280",
    textAlign: 'center',
    marginBottom: 10,
  },
  noTicketsSubText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: 'center',
  },
});