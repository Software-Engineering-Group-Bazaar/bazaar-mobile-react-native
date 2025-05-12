import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, Text } from "react-native";
import ConversationList from "proba-package/chat-components/ConversationList";
import { ConversationDto } from "proba-package/chat-components/models";
import { useTranslation } from "react-i18next";
import LanguageButton from "@/components/ui/buttons/LanguageButton";
import * as signalR from "@microsoft/signalr";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { apiFetchFormattedConversations } from "../api/messagingApi";
import { useFocusEffect } from "@react-navigation/native";

interface ExtendedConversationDto extends ConversationDto {
  buyerUserId: string;
  lastMessageSender: string;
  buyerUsername?: string;
}

const ChatListScreen: React.FC = () => {
  const [conversations, setConversations] = useState<ExtendedConversationDto[]>(
    []
  );
  const router = useRouter();

  const loadConversations = async () => {
    try {
      const fetchedConversations = await apiFetchFormattedConversations();
      setConversations(fetchedConversations);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [])
  );

  const handleConversationSelect = (
    conversationId: number,
    buyerUsername: string
  ) => {
    router.push(
      `../(CRUD)/pregled_chata?conversationId=${conversationId}&buyerUsername=${buyerUsername}`
    );
  };

  useEffect(() => {
    const fetchTokenAndLoadConversations = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("accessToken");

        if (!storedToken) {
          console.error("No token found in SecureStore!");
          return;
        }

        const fetchedConversations = await apiFetchFormattedConversations();
        setConversations(fetchedConversations);

        // Setup SignalR connection
        const connection = new signalR.HubConnectionBuilder()
          .withUrl("https://bazaar-system.duckdns.org/chathub", {
            accessTokenFactory: async () => storedToken, // Use token for auth
          })
          .withAutomaticReconnect()
          .build();

        connection
          .start()
          .catch((err) => console.error("SignalR connection error:", err));

        // Handle incoming messages
        connection.on("ReceiveMessage", (newMessage: any) => {
          setConversations((prev) => {
            const updated = [...prev];
            const index = updated.findIndex(
              (c) => c.id === newMessage.conversationId
            );

            if (index !== -1) {
              updated[index] = {
                ...updated[index],
                lastMessageSnippet: newMessage.text,
                lastMessageTimestamp: "Just now",
                unreadMessagesCount: updated[index].unreadMessagesCount + 1,
              };
            } else {
              updated.unshift({
                id: newMessage.conversationId,
                otherParticipantName: newMessage.senderName,
                buyerUserId: newMessage.buyerUserId ?? "",
                lastMessageSender: newMessage.senderUserId ?? "",
                lastMessageSnippet: newMessage.text,
                lastMessageTimestamp: "Just now",
                unreadMessagesCount: 1,
              });
            }

            return updated;
          });
        });

        return () => {
          connection.stop();
        };
      } catch (error) {
        console.error("Error loading conversations:", error);
      }
    };

    fetchTokenAndLoadConversations();
  }, []);

  return (
    <View style={styles.container}>
      <LanguageButton />
      <Text style={styles.header}></Text>
      <ConversationList
        conversations={conversations}
        onSelectConversation={handleConversationSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: "#fff",
  },
  header: {
    marginBottom: 50,
    paddingLeft: 15,
  },
});

export default ChatListScreen;
