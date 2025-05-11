// shared/hooks/useSignalR.ts
import { useEffect, useRef, useState } from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { mockChatMessages } from "../mock/ChatMessage"; // import your mock data
import { ChatMessage } from "../types/ChatMessage";

type Options = {
  mock?: boolean;
};

export const useSignalR = (token: string, options: Options = {}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    if (options.mock) {
      setMessages(mockChatMessages);
      return;
    }

    const connect = async () => {
      const connection = new HubConnectionBuilder()
        .withUrl("https://your-api.com/chatHub", {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      connection.on("ReceiveMessage", (user: string, content: string) => {
        setMessages((prev) => [...prev, { user, content }]);
      });

      try {
        await connection.start();
        console.log("SignalR connected");
        connectionRef.current = connection;
      } catch (err) {
        console.error("SignalR connection error:", err);
      }
    };

    connect();

    return () => {
      connectionRef.current?.stop();
    };
  }, [token]);

  const sendMessage = (user: string, content: string) => {
    if (options.mock) {
      setMessages((prev) => [
        ...prev,
        { user, content, timestamp: new Date().toISOString() },
      ]);
    } else {
      connectionRef.current
        ?.invoke("SendMessage", user, content)
        .catch((err) => console.error("Send failed:", err));
    }
  };

  return { messages, sendMessage };
};
