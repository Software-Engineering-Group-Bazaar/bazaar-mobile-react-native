// shared/hooks/useSignalR.ts
import { useEffect, useRef, useState } from "react";
import { HubConnection, LogLevel } from "@microsoft/signalr";
import { MessageDto } from "./models";
import * as signalR from "@microsoft/signalr";
import * as SecureStore from "expo-secure-store";
import api from "../../../apps/seller/app/api/defaultApi";
import { baseURL } from "../../../apps/seller/app/env";

console.log("BASE URL: ", baseURL);

export const useSignalR = (conversationId?: number) => {
  const [messages, setMessages] = useState<MessageDto[]>([]);
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

  const handleReceivedMessage = async (receivedMessage: MessageDto) => {
    console.log(JSON.stringify(receivedMessage, null, 2));

    if (!receivedMessage.senderUsername && receivedMessage.senderUserId) {
      receivedMessage.senderUsername = await fetchUsername(
        receivedMessage.senderUserId
      );
    }

    setMessages((prevMessages) => [...prevMessages, receivedMessage]);
  };

  useEffect(() => {
    const connect = async () => {
      const storedToken = await SecureStore.getItemAsync("accessToken");

      if (!conversationId) {
        console.error("Conversation ID is required for SignalR connection.");
        return;
      }

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${baseURL}/chathub`, {
          accessTokenFactory: async () => storedToken,
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      connection.serverTimeoutInMilliseconds = 60000;
      connection.on("ReceiveMessage", handleReceivedMessage);

      try {
        await connection.start();
        console.log("SignalR connected");
        connectionRef.current = connection;
        await connection.invoke("JoinConversation", conversationId);
      } catch (err) {
        console.error("SignalR connection error:", err);
      }
    };

    connect();
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
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
