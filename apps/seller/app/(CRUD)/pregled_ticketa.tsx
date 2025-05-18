// File: app/(CRUD)/pregled_ticketa.tsx
import React, { useState, useCallback } from "react"; // Ukloni useEffect ako se ne koristi direktno
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextStyle,
} from "react-native"; // Dodaj Alert
import { useRouter, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import { apiFetchSellerTickets } from "../api/ticketApi"; // Prilagodi putanju
import { Ticket, TicketStatus } from "../types/ticket"; // Prilagodi putanju
import LanguageButton from "@/components/ui/buttons/LanguageButton";
import TouchableCard from "@/components/ui/cards/TouchableCard";

const boldWeight: TextStyle["fontWeight"] = "bold";

// Helperi za status (ostaju isti ili ih premesti u utils)
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

const statusStyleMap: Record<TicketStatus, TextStyle> = {
  [TicketStatus.REQUESTED]: { color: "orange", fontWeight: boldWeight },
  [TicketStatus.OPEN]: { color: "#3b6bb8", fontWeight: boldWeight },
  [TicketStatus.RESOLVED]: { color: "green", fontWeight: boldWeight },
};

const getStatusText = (status: TicketStatus, t: Function): string => {
  const key = statusTextMap[status];
  return t(key) || fallbackTextMap[status] || status;
};

const getStatusStyle = (status: TicketStatus): TextStyle => {
  return statusStyleMap[status] || { color: "black" };
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
      Alert.alert(
        t("error") || "Greška",
        error.message ||
          t("failed_to_load_tickets") ||
          "Nije uspelo učitavanje tiketa."
      );
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

  const handleViewTicketDetails = (ticketId: number) => {
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

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4E8D7C"]}
          />
        }
      >
        {tickets.length === 0 && !loading ? (
          <View style={styles.centeredInfo}>
            <Text style={styles.noTicketsText}>
              {t("no_tickets_found") || "Nema aktivnih tiketa."}
            </Text>
            <Text style={styles.noTicketsSubText}>
              {t("pull_to_refresh_or_create") ||
                "PovuSvite nadole da osvežite ili kreirajte novi tiket koristeći '+' dugme u gornjem desnom uglu."}
            </Text>
          </View>
        ) : (
          tickets.map((ticket) => (
            <TouchableCard
              key={ticket.id}
              title={ticket.title}
              textRows={[
                `${t("order_ref") || "Narudžba"}: ${
                  ticket.orderId || ticket.orderId
                }`,
                <Text key={`status-${ticket.id}`}>
                  {t("status") || "Status"}:{" "}
                  <Text style={getStatusStyle(ticket.status)}>
                    {getStatusText(ticket.status, t)}
                  </Text>
                </Text>,
                `${t("created_at") || "Kreirano"}: ${new Date(
                  ticket.createdAt
                ).toLocaleDateString()}`,
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
  centeredInfo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 50, // Da ne bude skroz na vrhu
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 10, // Dodaj malo prostora na vrhu ako LanguageButton smeta
  },
  noTicketsText: {
    fontSize: 18, // Povećaj font
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 10,
  },
  noTicketsSubText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
});
