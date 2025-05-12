import React from 'react';
import { FlatList, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { ConversationDto } from './models'; 

interface Props {
  conversations: ExtendedConversationDto[];
  onSelectConversation: (conversationId: number) => void;
}

interface ExtendedConversationDto extends ConversationDto {
  buyerUserId: string;
  lastMessageSender: string;
}

const ConversationList: React.FC<Props> = ({ conversations, onSelectConversation }) => {
  const renderItem = ({ item }: { item: ExtendedConversationDto }) => (
    <TouchableOpacity style={styles.item} onPress={() => onSelectConversation(item.id)}>
      <Text style={styles.username}>{item.otherParticipantName}</Text>
      <Text style={[styles.lastMessage, item.unreadMessagesCount > 0 && styles.unreadText]}>
        {item.lastMessageSnippet}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.timestamp}>{item.lastMessageTimestamp}</Text>
        {/* Display unread count if there are unread messages */}
        {item.unreadMessagesCount > 0 && item.buyerUserId == item.lastMessageSender && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{item.unreadMessagesCount}</Text>
          </View>
        )}

      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList<ExtendedConversationDto>
      data={conversations}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  item: {
    padding: 15,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, 
  },
  unreadText: {
    fontWeight: 'bold',
    color: '#000',
  },  
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#555',
  },  
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  unreadBadge: {
    backgroundColor: '#ff5c5c',
    borderRadius: 11,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  unreadCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ConversationList;
