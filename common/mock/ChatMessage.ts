// shared/mock/chatMessages.ts
import { ChatMessage } from "../types/ChatMessage";

export const mockChatMessages: ChatMessage[] = [
  { user: "Alice", content: "Hey there!", timestamp: "2024-05-08T10:00:00Z" },
  {
    user: "Bob",
    content: "Hi Alice! How are you?",
    timestamp: "2024-05-08T10:01:00Z",
  },
  {
    user: "Alice",
    content: "I'm good! Just checking in.",
    timestamp: "2024-05-08T10:02:00Z",
  },
  {
    user: "Bob",
    content: "Nice! Want to grab coffee later?",
    timestamp: "2024-05-08T10:03:00Z",
  },
];
