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

const ChatScreen = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(true);
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const [ownId, setOwnId] = useState<string | null>(null);
  const { conversationId, buyerUsername } = useLocalSearchParams();

  useEffect(() => {
    const getToken = async () => {
      const fetchedToken = await SecureStore.getItemAsync("accessToken");
      const fetchId = await SecureStore.getItemAsync("sellerId");

      setOwnId(fetchId);
      setToken(fetchedToken);
    };

    console.log(`buyerUsername: ${buyerUsername}`);

    getToken();
    flatListRef.current?.scrollToEnd({ animated: true });
    navigation.setOptions({ title: buyerUsername });
  }, []);

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
        // Assuming there's a FlatList ref to control scrolling
        flatListRef.current.scrollToIndex({
          index: messages.length - 1,
          animated: true,
          viewPosition: 1,
        });
        return updatedMessages;
      });
    }
  }, [signalRMessages]);

  const handleSend = () => {
    if (input.trim().length > 0 && token) {
      sendMessage(input.trim(), isPrivate);
      setInput("");
    }
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
