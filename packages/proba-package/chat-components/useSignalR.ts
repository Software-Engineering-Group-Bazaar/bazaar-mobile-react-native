// shared/hooks/useSignalR.ts
import { useEffect, useRef, useState } from "react";
import { HubConnection, LogLevel } from "@microsoft/signalr";
import { ChatMessage, MessageDto } from "./models";
import * as signalR from "@microsoft/signalr";
import * as SecureStore from "expo-secure-store";
import api from "../../../apps/seller/app/api/defaultApi";

export const useSignalR = (conversationId?: number) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const connectionRef = useRef<HubConnection | null>(null);

  const fetchUsername = async (userId: string): Promise<string> => {
    try {
      const response = await api.get(`/user-profile/${userId}/username`);

      if (response.status !== 200) {
        throw new Error(`Failed to fetch username: ${response.status}`);
      }

      const data = await response.data;
      console.log("data", data);
      return data || "Unknown User";
    } catch (error) {
      console.error("Error fetching username:", error);
      return "Unknown User";
    }
  };

  useEffect(() => {
    // Connect to SignalR
    const connect = async () => {
      const storedToken = await SecureStore.getItemAsync("accessToken");

      // Ensure conversationId is available
      if (!conversationId) {
        console.error("Conversation ID is required for SignalR connection.");
        return;
      }

      const connection = new signalR.HubConnectionBuilder()
<<<<<<< Updated upstream
        .withUrl(`http://192.168.15.105:5054/chathub`, {
=======
        .withUrl(`http://192.168.0.37:5054/chathub`, {
>>>>>>> Stashed changes
          accessTokenFactory: async () => storedToken,
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      // Listen for new messages
      connection.on("ReceiveMessage", async (receivedMessage: MessageDto) => {
        console.log(JSON.stringify(receivedMessage, null, 2));

        // Get username from user ID if not provided
        let senderUsername = receivedMessage.senderUsername;
        if (!senderUsername && receivedMessage.senderUserId) {
          senderUsername = await fetchUsername(receivedMessage.senderUserId);
        }

        const content = receivedMessage.content;
        const timestamp = receivedMessage.sentAt;

        setMessages((prevMessages) => [
          ...prevMessages,
          { senderUsername, content, timestamp },
        ]);
      });

      try {
        await connection.start();
        console.log("SignalR connected");
        connectionRef.current = connection;

        // Join conversation-specific group
        connection
          .invoke("JoinConversation", conversationId)
          .catch((err) => console.error("Error joining group:", err));
      } catch (err) {
        console.error("SignalR connection error:", err);
      }
    };

    connect();

    return () => {
      connectionRef.current?.stop();
    };
  }, [conversationId]);

  // Send message to the SignalR hub
  const sendMessage = (content: string, isPrivate: boolean = false) => {
    if (connectionRef.current) {
      connectionRef.current
        .invoke("SendMessage", {
          ConversationId: conversationId,
          Content: content,
          IsPrivate: isPrivate,
        })
        .catch((err) => console.error("Send failed:", err));
    }
  };

  return { messages, sendMessage };
};
