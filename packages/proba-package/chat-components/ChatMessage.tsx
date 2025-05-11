// components/ChatMessage.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ChatMessage } from "./models";

type Props = {
  message: ChatMessage;
};

export const ChatMessageItem: React.FC<Props> = ({ message }) => {
  return (
    <View style={styles.container}>
      {message.senderUsername && (
        <Text style={styles.user}>{message.senderUsername}</Text>
      )}
      <Text style={styles.content}>{message.content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    padding: 8,
    backgroundColor: "#f1f1f1",
    borderRadius: 6,
  },
  user: {
    fontWeight: "bold",
  },
  content: {
    marginTop: 2,
  },
});
