// File: api/ticketApi.ts
import { Ticket, TicketCreationPayload, OrderSummary, TicketStatus } from "../types/ticket";
import * as SecureStore from "expo-secure-store";

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

// Mock podaci za tikete - sada ćemo im dodeliti sellerId dinamički
let mockTicketsStore: { [sellerId: string]: Ticket[] } = {
  "defaultSeller": [ // Primer ako nemamo sellerId
    {
      id: "ticket001",
      orderId: "order123",
      orderNumber: "Narudžba #ORD123",
      subject: "Problem sa isporukom (Default)",
      description: "Kupac javlja da paket kasni.",
      status: TicketStatus.OPEN,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      sellerId: "defaultSeller",
    }
  ]
};

// Inicijalizacija tiketa za određenog prodavca ako ne postoje
const getTicketsForSeller = (sellerId: string): Ticket[] => {
  if (!mockTicketsStore[sellerId]) {
    mockTicketsStore[sellerId] = []; // Ili prekopiraj neke default tikete
  }
  return mockTicketsStore[sellerId];
};


export const apiFetchSellerOrders = async (): Promise<OrderSummary[]> => {
  const sellerId = await getCurrentSellerId();
  console.log(`API: Fetching seller orders for sellerId: ${sellerId || 'N/A'}...`);
  // U stvarnom API-ju, sellerId bi se slao kao parametar
  return new Promise((resolve) => setTimeout(() => resolve([...mockSellerOrders]), 500));
};

export const apiFetchSellerTickets = async (): Promise<Ticket[]> => {
  const sellerId = await getCurrentSellerId();
  console.log(`API: Fetching seller tickets for sellerId: ${sellerId || 'N/A'}...`);

  if (!sellerId) {
    console.warn("API: Seller ID not found, returning empty tickets or default.");
    // Možeš vratiti prazan niz ili tikete za "defaultSeller" ako ima smisla
    return Promise.resolve(getTicketsForSeller("defaultSeller").map(ticket => ({
        ...ticket,
        orderNumber: mockSellerOrders.find(o => o.id === ticket.orderId)?.orderNumber || 'N/A'
      }))
    );
  }
  
  // Ovde bi išao stvarni API poziv, npr. GET /api/tickets?sellerId=${sellerId}
  return new Promise((resolve) => {
    setTimeout(() => {
      const sellerTickets = getTicketsForSeller(sellerId);
      const ticketsWithOrderNumber = sellerTickets.map(ticket => ({
        ...ticket,
        orderNumber: mockSellerOrders.find(o => o.id === ticket.orderId)?.orderNumber || 'N/A'
      })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sortiraj najnovije prvo
      resolve(ticketsWithOrderNumber);
    }, 700);
  });
};

export const apiCreateSellerTicket = async (payload: TicketCreationPayload): Promise<Ticket> => {
  const sellerId = await getCurrentSellerId();
  console.log(`API: Creating seller ticket for sellerId: ${sellerId || 'N/A'}...`, payload);

  if (!sellerId) {
    // Ovo je kritična greška za kreiranje, treba je obraditi
    return Promise.reject(new Error("Seller ID not found. Cannot create ticket."));
  }
  
  // Stvarni API poziv: POST /api/tickets, gde backend koristi autentifikovanog korisnika ili prosleđen sellerId
  return new Promise((resolve) => {
    setTimeout(() => {
      const newTicket: Ticket = {
        id: `ticket${Math.random().toString(36).substring(2, 9)}`, // Malo bolji random ID
        ...payload,
        orderNumber: mockSellerOrders.find(o => o.id === payload.orderId)?.orderNumber || 'N/A',
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

export const apiFetchTicketDetails = async (ticketId: string): Promise<Ticket | null> => {
  const sellerId = await getCurrentSellerId(); // Možda nije neophodan za GET by ID, ali korisno za logovanje
  console.log(`API: Fetching ticket details for ${ticketId} (Seller: ${sellerId || 'N/A'})...`);
  
  // Stvarni API poziv: GET /api/tickets/${ticketId}
  // Backend bi trebao da proveri da li ulogovani seller ima pravo da vidi ovaj tiket.
  return new Promise((resolve) => {
    setTimeout(() => {
      let foundTicket: Ticket | undefined;
      // Pretraži sve tikete svih prodavaca (za mock) ili samo tikete trenutnog prodavca
      // U realnoj aplikaciji, backend bi ovo radio
      for (const id in mockTicketsStore) {
        foundTicket = mockTicketsStore[id].find((t) => t.id === ticketId);
        if (foundTicket) break;
      }
      
      if (foundTicket && (!sellerId || foundTicket.sellerId === sellerId || foundTicket.sellerId === "defaultSeller")) { // Osnovna provera za mock
        resolve({
            ...foundTicket,
            orderNumber: mockSellerOrders.find(o => o.id === foundTicket.orderId)?.orderNumber || 'N/A'
        });
      } else {
        console.warn(`Ticket ${ticketId} not found or not accessible by seller ${sellerId}`);
        resolve(null);
      }
    }, 600);
  });
};