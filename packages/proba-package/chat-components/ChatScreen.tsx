import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Switch,
  Text,
} from "react-native";
import { useSignalR } from "./useSignalR";
import { ChatMessageItem } from "./ChatMessage";
import * as SecureStore from "expo-secure-store";
import api from "../../../apps/seller/app/api/defaultApi";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";

const ChatScreen = ({ conversationId }: { conversationId: number }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(true);
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const [ownId, setOwnId] = useState<string | null>(null);
  const { buyerUsername } = useLocalSearchParams();

  useEffect(() => {
    const getToken = async () => {
      const fetchedToken = await SecureStore.getItemAsync("accessToken");
      const fetchId = SecureStore.getItem("sellerId");

      setOwnId(fetchId);
      setToken(fetchedToken);
    };

    getToken();
    flatListRef.current?.scrollToEnd({ animated: true });
    navigation.setOptions({ title: buyerUsername });
  }, []);

  const markAsRead = async () => {
    if (!conversationId) return;

    try {
      await api.post(`/Chat/conversations/${conversationId}/markasread`);
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

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

    if (conversationId) {
      fetchMessages();
      markAsRead();
    }
  }, [conversationId]);

  const conversationIdNumber = Number(conversationId);
  const { messages: signalRMessages, sendMessage } =
    useSignalR(conversationIdNumber);

  useEffect(() => {
    if (signalRMessages && signalRMessages.length > 0) {
      setMessages((prevMessages) => {
        const updatedMessages = [
          ...prevMessages,
          signalRMessages[signalRMessages.length - 1],
        ];
        return updatedMessages;
      });
      markAsRead();
    }
  }, [signalRMessages]);

  const handleSend = () => {
    if (input.trim().length > 0 && token) {
      sendMessage(input.trim(), isPrivate);
      setInput("");
    }
  };

  // Scroll to the bottom whenever messages change
  const onContentSizeChange = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <ChatMessageItem
              message={item}
              isOwnMessage={item.senderUserId === ownId}
            />
          )}
          contentContainerStyle={styles.list}
          ref={flatListRef}
          onContentSizeChange={onContentSizeChange} // Add this line to trigger scroll
        />

        {/* 🔹 Private Message Toggle */}
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Private</Text>
          <Switch value={isPrivate} onValueChange={setIsPrivate} />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            style={styles.input}
            placeholder="Type a message"
          />
          <Button title="Send" onPress={handleSend} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 10,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    justifyContent: "flex-end",
    gap: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    alignItems: "center",
    gap: 8,
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
