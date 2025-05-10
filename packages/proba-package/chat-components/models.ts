export interface ConversationDto {
    id: number;
    otherParticipantName: string;
    lastMessageSnippet: string;
    lastMessageTimestamp: string;
    unreadCount: number;
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
}
