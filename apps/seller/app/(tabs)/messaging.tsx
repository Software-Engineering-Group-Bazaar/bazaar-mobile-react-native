import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import ConversationList from 'proba-package/chat-components/ConversationList'
import { ConversationDto } from 'proba-package/chat-components/models';
import { useTranslation } from "react-i18next";
import LanguageButton from "@/components/ui/buttons/LanguageButton";

const mockConversations: ConversationDto[] = [
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
];

const ChatListScreen: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationDto[]>(mockConversations);
  const { t } = useTranslation();

  const handleSelectConversation = (conversationId: number) => {
    console.log('Selected conversation:', conversationId);
    // Navigate to the individual chat screen
  };

  useEffect(() => {
    // Fetch the conversations from API once it's available
  }, []);

  return (
    <View style={styles.container}>
      <LanguageButton />
      <Text style={styles.header}></Text>
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
    marginBottom: 50,
    paddingLeft: 15,
  },
});

export default ChatListScreen;
