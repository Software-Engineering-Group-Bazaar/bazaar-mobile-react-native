import api from "./defaultApi";
import { ConversationDto } from "proba-package/chat-components/models";
import { formatDistanceToNow } from "date-fns";
import * as SecureStore from "expo-secure-store";

// Dohvacanje svih chatova za listu

interface ExtendedConversationDto extends ConversationDto {
  buyerUserId: string;
  lastMessageSender: string;
  buyerUsername?: string;
  orderId?: number;
  productId?: number;
}

export async function apiFetchFormattedConversations(): Promise<
  ExtendedConversationDto[]
> {
  try {
    const response = await api.get("/Chat/conversations");
    const rawConversations = response.data;
    if (rawConversations.length > 0) {
      SecureStore.setItem(
        "sellerId",
        rawConversations[0].sellerUserId.toString()
      );
    }

    const formatted = rawConversations.map((conv: any) => {
      const otherParticipantName = conv.buyerUsername;
      const buyerUserId = conv.buyerUserId;
      const buyerUsername = conv.buyerUsername;
      const lastMessage = conv.lastMessage;
      const orderId = conv.orderId;
      const productId = conv.productId;

      return {
        id: conv.id,
        otherParticipantName,
        buyerUserId,
        buyerUsername,
        lastMessageSender: lastMessage?.senderUserId ?? null,
        lastMessageSnippet: conv.lastMessage?.content ?? "",
        lastMessageTimestamp: conv.lastMessage?.sentAt
          ? formatDistanceToNow(new Date(conv.lastMessage.sentAt), {
              addSuffix: true,
            })
          : "",
        unreadMessagesCount: conv.unreadMessagesCount,
        orderId,
        productId
      };
    });

    return formatted;
  } catch (error) {
    console.error("Failed to fetch and format conversations:", error);
    return [];
  }
}
