// shared/hooks/useSignalR.ts
import { useEffect, useRef, useState } from "react";
import { HubConnection, LogLevel } from "@microsoft/signalr";
import { ChatMessage, MessageDto } from "./models";
import * as signalR from "@microsoft/signalr";
import * as SecureStore from "expo-secure-store";

export const useSignalR = (conversationId?: number) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const connectionRef = useRef<HubConnection | null>(null);

  // Fetch token from secure store
  const fetchToken = async () => await SecureStore.getItemAsync("accessToken");

  useEffect(() => {
    // Connect to SignalR
    const connect = async () => {
      const storedToken = await fetchToken();

      // Ensure conversationId is available
      if (!conversationId) {
        console.error("Conversation ID is required for SignalR connection.");
        return;
      }

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`http://192.168.15.105:5054/chathub`, {
          accessTokenFactory: async () => storedToken,
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      // Listen for new messages
      connection.on("ReceiveMessage", (receivedMessage: MessageDto) => {
        console.log(JSON.stringify(receivedMessage, null, 2));
        const senderUsername = receivedMessage.senderUsername;
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
  }, [conversationId]); // Rerun when conversationId or mock changes

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
