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
          {message.isPrivate && <Text style={styles.privateTag}>  Private</Text>}
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
  privateTag: {
    fontStyle: "italic",
    color: "#999",
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
    padding: 12,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 15,
    color: "#333",
  },
  bubbleOwn: {
    backgroundColor: "#FFFFFF", // white
    borderTopRightRadius: 0,
  },

  bubbleOwnPrivate: {
    backgroundColor: "#E0E0E0", // light gray for private own messages
    borderTopRightRadius: 0,
  },

  bubbleOther: {
    backgroundColor: "#E6F0FF", // light blue
    borderTopLeftRadius: 0,
    borderWidth: 1,
    borderColor: "#eee",
  },

  bubbleOtherPrivate: {
    backgroundColor: "#A7C7E7", // darker blue for private messages from others
    borderTopLeftRadius: 0,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  timestamp: {
    fontSize: 10,
    color: "#888",
    marginTop: 4,
  },
});
