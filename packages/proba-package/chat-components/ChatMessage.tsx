import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ChatMessage } from "./models";

type Props = {
  message: ChatMessage;
  isOwnMessage?: boolean;
};

const formatTimestamp = (timestamp?: string) => {
  console.log("timestamp:" , timestamp)
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
};

export const ChatMessageItem: React.FC<Props> = ({ message, isOwnMessage }) => {
  const initial = message.senderUsername?.charAt(0).toUpperCase() || "?";

  return (
    <View
      style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage,
      ]}
    >
      {!isOwnMessage && (
        <Text style={styles.header}>
          <Text style={styles.username}>{message.senderUsername}</Text>
        </Text>
      )}

      <View
        style={[
          styles.bubble,
          isOwnMessage ? styles.bubbleOwn : styles.bubbleOther,
        ]}
      >
        <Text style={styles.messageText}>{message.content}</Text>
      </View>
      {message.sentAt && (
        <Text style={styles.timestamp}>
          {new Date(message.sentAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 6,
    maxWidth: "80%",
  },
  header: {
    flexDirection: "row",
    marginBottom: 2,
  },
  ownMessage: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  otherMessage: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  username: {
    fontSize: 12,
    color: "#555",
    marginBottom: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#bbb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  bubble: {
    padding: 10,
    borderRadius: 16,
  },
  bubbleOwn: {
    backgroundColor: "#DCF8C6",
    borderTopRightRadius: 0,
  },
  bubbleOther: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 0,
    borderWidth: 1,
    borderColor: "#eee",
  },
  messageText: {
    fontSize: 15,
    color: "#333",
  },
  timestamp: {
    fontSize: 10,
    color: "#888",
    marginTop: 4,
  },
});
