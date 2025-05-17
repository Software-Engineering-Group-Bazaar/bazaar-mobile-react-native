// File: types/ticket.ts

export enum TicketStatus {
  OPEN = "OPEN", // Otvoren
  IN_PROGRESS = "IN_PROGRESS", // U obradi
  RESOLVED = "RESOLVED", // Rešen
  CLOSED = "CLOSED", // Zatvoren
  // Dodaj još statusa po potrebi (iz "Benjaminovog email-a")
}

export interface Ticket {
  id: string; // Koristi string za ID-jeve generalno, lakše za API
  orderId: string;
  orderNumber?: string; // Za prikaz u listi tiketa ili detaljima
  subject: string;
  description: string;
  status: TicketStatus;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  sellerId: string; // ID prodavca koji je kreirao tiket
  // buyerId?: string; // Ako i kupac može da vidi/kreira tiket vezan za istu narudžbu
}

export interface TicketCreationPayload {
  orderId: string;
  subject: string;
  description: string;
  // sellerId će se verovatno dodavati na backendu na osnovu autentifikacije
}

// Za popunjavanje dropdown-a prilikom kreiranja tiketa
export interface OrderSummary {
  id: string;
  orderNumber: string; // Npr. "Narudžba #12345"
  // Možeš dodati i datum narudžbe ili druge relevantne info za lakši odabir
  // createdAt: string;
}