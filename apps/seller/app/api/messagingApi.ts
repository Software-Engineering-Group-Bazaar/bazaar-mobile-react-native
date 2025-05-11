import api from "./defaultApi";
import { ConversationDto } from 'proba-package/chat-components/models';
import { formatDistanceToNow } from 'date-fns';

// Dohvacanje svih chatova za listu

export async function apiFetchFormattedConversations(): Promise<{
  id: number;
  otherParticipantName: string;
  lastMessageSnippet: string;
  lastMessageTimestamp: string;
  unreadCount: number;
}[]> {
  try {
    const response = await api.get("/Chat/conversations");
    const rawConversations = response.data;

    const formatted = rawConversations.map((conv: any) => {
      const otherParticipantName = conv.buyerUsername;

      return {
        id: conv.id,
        otherParticipantName,
        lastMessageSnippet: conv.lastMessage?.content ?? '',
        lastMessageTimestamp: conv.lastMessage?.sentAt
          ? formatDistanceToNow(new Date(conv.lastMessage.sentAt), { addSuffix: true })
          : '',
        unreadCount: conv.unreadMessagesCount,
      };
    });

    return formatted;
  } catch (error) {
    console.error("Failed to fetch and format conversations:", error);
    return [];
  }
}

  