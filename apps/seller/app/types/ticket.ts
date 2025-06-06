// File: types/ticket.ts

export enum TicketStatus {
  REQUESTED = "Requested", // U obradi
  OPEN = "Open", // Otvoren
  RESOLVED = "Resolved", // Rešen
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  resolvedAt: string;
  userId: string;
  userUsername: string;
  assignedAdminId: string;
  adminUsername: string;
  conversationId: number;
  orderId: number;
  status: TicketStatus;
  isResolved: boolean;
}

export interface TicketCreationPayload {
  orderId: string;
  title: string;
  description: string;
}

// Za popunjavanje dropdown-a prilikom kreiranja tiketa
export interface OrderSummary {
  id: string;
  orderNumber: string; // Npr. "Narudžba #12345"
  // Možeš dodati i datum narudžbe ili druge relevantne info za lakši odabir
  // createdAt: string;
}
