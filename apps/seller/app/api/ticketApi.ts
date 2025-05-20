import {
  Ticket,
  TicketCreationPayload,
  OrderSummary,
  TicketStatus,
} from "../types/ticket";
import * as SecureStore from "expo-secure-store";
import api from "./defaultApi";

// Pomoćna funkcija za dobijanje ID-ja trenutnog prodavca (storeId)
const getCurrentSellerId = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync("storeId");
};

// Mock podaci za narudžbe prodavca (ostaju isti za primer)
const mockSellerOrders: OrderSummary[] = [
  { id: "order123", orderNumber: "Narudžba #ORD123" },
  { id: "order456", orderNumber: "Narudžba #ORD456" },
  { id: "order789", orderNumber: "Narudžba #ORD789" },
];

export const apiFetchSellerOrders = async (): Promise<OrderSummary[]> => {
  const sellerId = await getCurrentSellerId();
  console.log(
    `API: Fetching seller orders for sellerId: ${sellerId || "N/A"}...`
  );
  // U stvarnom API-ju, sellerId bi se slao kao parametar
  return new Promise((resolve) =>
    setTimeout(() => resolve([...mockSellerOrders]), 500)
  );
};

export const apiCreateSellerTicket = async (
  payload: TicketCreationPayload
): Promise<Ticket | null> => {
  console.log("payload", payload);
  try {
    const response = await api.post("/Tickets/create", payload);
    return response.data as Ticket;
  } catch (error) {
    console.error("Error creating ticket:", error);
    return null;
  }
};

export const apiFetchSellerTickets = async (): Promise<Ticket[]> => {
  try {
    const response = await api.get("/Tickets");
    const tickets = response.data as Ticket[];
    return tickets;
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return [];
  }
};

export const apiFetchTicketDetails = async (
  ticketId: string
): Promise<Ticket | null> => {
  try {
    const response = await api.get(`/Tickets/${ticketId}`);
    return response.data as Ticket;
  } catch (error) {
    console.error("Error fetching ticket details:", error);
    return null;
  }
};
