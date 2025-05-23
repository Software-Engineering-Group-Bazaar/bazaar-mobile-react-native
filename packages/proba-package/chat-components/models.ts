export interface ConversationDto {
  id: number;
  otherParticipantName: string;
  lastMessageSnippet: string;
  lastMessageTimestamp: string;
  unreadMessagesCount: number;
  orderId?: number;
  storeId?: number;
}

export interface MessageDto {
  id: number;
  senderUserId: string;
  senderUsername?: string;
  content: string;
  sentAt: string;
  readAt?: string | null;
  isPrivate: boolean;
}

export type ChatMessage = {
  senderUsername: string;
  content: string;
  sentAt?: string;
  isOwnMessage?: boolean;
  isPrivate?: boolean;
};
