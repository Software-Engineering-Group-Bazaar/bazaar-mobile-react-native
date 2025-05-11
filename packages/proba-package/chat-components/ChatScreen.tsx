// screens/ChatScreen.tsx
import React, { useState, useEffect } from "react";
import { View, TextInput, Button, FlatList, StyleSheet } from "react-native";
import { useSignalR } from "./useSignalR";
import { ChatMessageItem } from "./ChatMessage";
import * as SecureStore from "expo-secure-store";
import api from "../../../apps/seller/app/api/defaultApi";

type ChatScreenProps = {
  conversationId: number; // Assuming this is passed to the component
};

const ChatScreen = ({ conversationId }: ChatScreenProps) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Fetch token from Secure Store on mount
  useEffect(() => {
    const getToken = async () => {
      const fetchedToken = await SecureStore.getItemAsync("accessToken");
      setToken(fetchedToken);
    };

    getToken();
  }, []);

  // Fetch initial messages from the API
  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversationId) return;

      try {
        const response = await api.get(
          `/Chat/conversations/${conversationId}/all-messages`
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch messages", error);
      } finally {
        setLoading(false);
      }
    };

    const markAsRead = async () => {
      if (!conversationId) return;

      try {
        const response = await api.post(
          `/Chat/conversations/${conversationId}/markasread`
        );
      } catch (error) {
        console.error("Failed to set read", error);
      } finally {
        setLoading(false);
      }
    };

    if (conversationId) {
      fetchMessages();
      markAsRead();
    }
  }, [conversationId]);

  // Use SignalR to handle real-time messaging
  const conversationIdNumber = Number(conversationId);
  const { messages: signalRMessages, sendMessage } =
    useSignalR(conversationIdNumber);

  // Combine API messages and SignalR messages into a single list
  useEffect(() => {
    if (signalRMessages) {
      setMessages((prevMessages) => [...prevMessages, ...signalRMessages]);
    }
  }, [signalRMessages]);

  const handleSend = () => {
    if (input.trim().length > 0 && token) {
      sendMessage(input.trim()); // Replace "Zlatan" with actual username if needed
      setInput(""); // Clear the input field after sending
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => <ChatMessageItem message={item} />}
        contentContainerStyle={styles.list}
      />
      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          style={styles.input}
          placeholder="Type a message"
        />
        <Button title="Send" onPress={handleSend} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  list: {
    paddingBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderColor: "#aaa",
    borderWidth: 1,
    padding: 8,
    borderRadius: 6,
  },
});

export default ChatScreen;
