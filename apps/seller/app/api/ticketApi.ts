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

export const apiCreateSellerTicket = async (
  payload: TicketCreationPayload
): Promise<Ticket> => {
  const sellerId = await getCurrentSellerId();
  console.log(
    `API: Creating seller ticket for sellerId: ${sellerId || "N/A"}...`,
    payload
  );

  if (!sellerId) {
    // Ovo je kritična greška za kreiranje, treba je obraditi
    return Promise.reject(
      new Error("Seller ID not found. Cannot create ticket.")
    );
  }

  // Stvarni API poziv: POST /api/tickets, gde backend koristi autentifikovanog korisnika ili prosleđen sellerId
  return new Promise((resolve) => {
    setTimeout(() => {
      const newTicket: Ticket = {
        id: `ticket${Math.random().toString(36).substring(2, 9)}`, // Malo bolji random ID
        ...payload,
        orderNumber:
          mockSellerOrders.find((o) => o.id === payload.orderId)?.orderNumber ||
          "N/A",
        status: TicketStatus.OPEN,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sellerId: sellerId, // Postavi sellerId
      };
      if (!mockTicketsStore[sellerId]) {
        mockTicketsStore[sellerId] = [];
      }
      mockTicketsStore[sellerId] = [newTicket, ...mockTicketsStore[sellerId]]; // Dodaj na početak
      resolve(newTicket);
    }, 1000);
  });
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
