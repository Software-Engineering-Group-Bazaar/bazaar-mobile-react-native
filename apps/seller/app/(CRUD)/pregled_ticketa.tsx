// File: app/(CRUD)/pregled_ticketa.tsx
import React, { useState, useCallback, useEffect } from "react"; // Dodan useEffect za HiddenHelpStarter ako zatreba
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextStyle,
  TouchableOpacity,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import { apiFetchSellerTickets } from "../api/ticketApi";
import { Ticket, TicketStatus } from "../types/ticket";
import TouchableCard from "@/components/ui/cards/TouchableCard";
import { FontAwesome5 } from "@expo/vector-icons";
import HelpAndLanguageButton from "@/components/ui/buttons/HelpAndLanguageButton";

// ------------- CO PILOT IMPORTS -------------
import {
  CopilotProvider,
  CopilotStep,
  walkthroughable,
  // useCopilot, // Ako bi koristila HiddenHelpStarter
} from "react-native-copilot";
// ------------------------------------------

const boldWeight: TextStyle["fontWeight"] = "bold";

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

// ------------- CO PILOT SETUP -------------
const WalkthroughableView = walkthroughable(View);
const WalkthroughableTouchableOpacity = walkthroughable(TouchableOpacity);
// ----------------------------------------


function PregledTicketaScreenContent() {
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
    router.push({ pathname: "/(CRUD)/ticket_detalji", params: { ticketId: ticketId.toString() } });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <HelpAndLanguageButton showHelpButton={false} showLanguageButton={false} />
        <ActivityIndicator size="large" color="#4E8D7C" />
        <Text>{t("loading_tickets") || "Učitavanje tiketa..."}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* <HiddenHelpStarter /> */}
      <HelpAndLanguageButton showLanguageButton={false} showHelpButton={true} />

      <View style={styles.headerContainer}>
        <View style={{flex: 1}} />
        <CopilotStep
          text={t("help_pregled_ticketa_add_button") || "Kliknite ovdje da kreirate novi tiket za podršku."}
          order={1}
          name="addTicketButton"
        >
          <WalkthroughableTouchableOpacity
            onPress={() => router.push("/(CRUD)/kreiraj_ticket")}
            style={styles.addButton}
          >
            <FontAwesome5 name="plus-circle" size={30} color="#4E8D7C" />
          </WalkthroughableTouchableOpacity>
        </CopilotStep>
      </View>

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
          <CopilotStep
            text={t("help_pregled_ticketa_no_tickets") || "Ako nemate tiketa, prikazat će se ova poruka. Možete povući listu za osvježavanje ili kreirati novi tiket koristeći '+' dugme."}
            order={2}
            name="noTicketsInfo"
          >
            <WalkthroughableView>
                <View style={styles.centeredInfo}>
                    <Text style={styles.noTicketsText}>
                        {t("no_tickets_found") || "Nema aktivnih tiketa."}
                    </Text>
                    <Text style={styles.noTicketsSubText}>
                        {t("pull_to_refresh_or_create") ||
                        "Povucite nadole da osvežite ili kreirajte novi tiket koristeći '+' dugme u gornjem desnom uglu."}
                    </Text>
                </View>
            </WalkthroughableView>
          </CopilotStep>
        ) : (
          tickets.map((ticket, index) =>
            index === 0 ? ( // CopilotStep samo za prvu karticu
              <CopilotStep
                key={`copilot-wrapper-${ticket.id}`}
                text={t("help_pregled_ticketa_card") || "Ovo je prikaz jednog od vaših tiketa. Kliknite na karticu za više detalja i komunikaciju."}
                order={2} // Isti order kao 'noTicketsInfo', samo jedan će biti vidljiv
                name="firstTicketCard"
              >
                <WalkthroughableView>
                  <TouchableCard
                    key={ticket.id}
                    title={ticket.title}
                    textRows={[
                      `${t("order_ref") || "Narudžba"}: ${ticket.orderId}`,
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
                </WalkthroughableView>
              </CopilotStep>
            ) : (
              <TouchableCard
                key={ticket.id}
                title={ticket.title}
                textRows={[
                  `${t("order_ref") || "Narudžba"}: ${ticket.orderId}`,
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
            )
          )
        )}
      </ScrollView>
    </View>
  );
}

export default function PregledTicketaScreen() {
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
      <PregledTicketaScreenContent />
    </CopilotProvider>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 15,
    paddingTop: 15, // Smanjeno jer HelpAndLanguageButton ima svoj top offset
    paddingBottom: 5,
    alignItems: "center",
    // zIndex: 1, // Ako je potrebno da bude ispod HelpAndLanguageButton
  },
  addButton: {
    padding: 5,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  centeredInfo: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 10, // Smanjeno jer header sada ima više paddinga
    flexGrow: 1,
  },
  noTicketsText: {
    fontSize: 18,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 10,
  },
  noTicketsSubText: {
    fontSize: 14,
    color: "#6B7280",
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