import { useEffect, useState } from "react";
import ChatScreen from "proba-package/chat-components/ChatScreen";
import api from "../api/defaultApi";
import { useLocalSearchParams } from "expo-router";

const Chat = () => {
  const { conversationId } = useLocalSearchParams();
  const conversationIdNumber = Number(conversationId);
  
  return (
    <ChatScreen
      conversationId={conversationIdNumber} 
    />
  );
};

export default Chat;
