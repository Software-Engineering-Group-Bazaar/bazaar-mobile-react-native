import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import ConversationList from 'proba-package/chat-components/ConversationList'
import { ConversationDto } from 'proba-package/chat-components/models';
import { useTranslation } from "react-i18next";
import LanguageButton from "@/components/ui/buttons/LanguageButton";
import * as signalR from '@microsoft/signalr';

const ChatListScreen: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const { t } = useTranslation();

  const handleSelectConversation = (conversationId: number) => {
    console.log('Selected conversation:', conversationId);
    // Navigate to the individual chat screen
  };

  useEffect(() => {
    setConversations([
      {
        id: 1,
        otherParticipantName: 'John Doe',
        lastMessageSnippet: 'Hey, are you still interested in the product?',
        lastMessageTimestamp: '2 hours ago',
        unreadCount: 1,
      },
      {
        id: 2,
        otherParticipantName: 'Jane Smith',
        lastMessageSnippet: 'Can you provide more details?',
        lastMessageTimestamp: '5 hours ago',
        unreadCount: 0,
      },
      {
        id: 3,
        otherParticipantName: 'Samuel Lee',
        lastMessageSnippet: 'Let me check and get back to you.',
        lastMessageTimestamp: '1 day ago',
        unreadCount: 5,
      },
    ]);

    // SignalR connection setup
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("http://<YOUR_API_URL>/chathub") // Replace with actual URL -- napraviti hub
      .withAutomaticReconnect()
      .build();

    connection.start().catch((err) => console.error("SignalR connection error:", err));

    // Handler for new messages
    connection.on("ReceiveMessage", (newMessage: any) => {
      setConversations((prev) => {
        const updated = [...prev];
        const index = updated.findIndex(c => c.id === newMessage.conversationId);

        if (index !== -1) {
          updated[index] = {
            ...updated[index],
            lastMessageSnippet: newMessage.text,
            lastMessageTimestamp: 'Just now',
            unreadCount: updated[index].unreadCount + 1,
          };
        } else {
          // Optional: add new conversation if it doesn't exist
          updated.unshift({
            id: newMessage.conversationId,
            otherParticipantName: newMessage.senderName,
            lastMessageSnippet: newMessage.text,
            lastMessageTimestamp: 'Just now',
            unreadCount: 1,
          });
        }

        return updated;
      });
    });

    return () => {
      connection.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      <LanguageButton />
      <Text style={styles.header}>{t("messages")}</Text>
      <ConversationList conversations={conversations} onSelectConversation={handleSelectConversation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 20,
    paddingLeft: 15,
    fontSize: 22,
    fontWeight: '600',
  },
});

export default ChatListScreen;
