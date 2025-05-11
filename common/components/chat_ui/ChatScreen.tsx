// screens/ChatScreen.tsx
import React, { useState } from "react";
import { View, TextInput, Button, FlatList, StyleSheet } from "react-native";
import { useSignalR } from "../../hooks/useSignalR";
import { ChatMessageItem } from "./ChatMessage";

type ChatScreenProps = {
  token?: string;
  username?: string;
};

const ChatScreen = ({ token, username }: ChatScreenProps) => {
  const [input, setInput] = useState("");
  const { messages, sendMessage } = useSignalR(token, { mock: true });
  console.log(`messages: ${JSON.stringify(messages)}`);

  const handleSend = () => {
    if (input.trim().length > 0) {
      sendMessage("Zlatan", input.trim());
      setInput("");
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
