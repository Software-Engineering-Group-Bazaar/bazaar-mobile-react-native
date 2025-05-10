// app/chat/[conversationId].js (or .tsx if you add types)
// The [conversationId] part makes 'conversationId' a dynamic route parameter.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ActivityIndicator,
  AppState,
  Alert,
  Platform,
} from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { HubConnectionBuilder, LogLevel, HubConnectionState } from '@microsoft/signalr';
import { useLocalSearchParams, Stack, useRouter } // Import from expo-router
from 'expo-router';

// --- CONFIGURATION & MOCKS ---
const USE_DUMMY_DATA = false; // SET TO false TO USE LIVE API/SIGNALR
const API_BASE_URL = 'http://192.168.0.25:5054/api/Chat'; // YOUR ACTUAL API BASE URL
const HUB_URL = 'http://192.168.0.25:5054/chathub'; // YOUR ACTUAL SIGNALR HUB URL
const MOCK_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxYzE0OTg2YS00Y2E2LTQ4YzctOTkyMS04NjExZjNmYmRkYzgiLCJlbWFpbCI6InByb2JhQHRlc3QuY29tIiwianRpIjoiY2YzZGE5NTMtNDA0MS00ZmYyLTg5NTItNDQ0MWVjNzMxNjk5Iiwicm9sZSI6IkJ1eWVyIiwibmJmIjoxNzQ2ODkyMDk4LCJleHAiOjE3NDY4OTU2OTgsImlhdCI6MTc0Njg5MjA5OCwiaXNzIjoiaHR0cHM6Ly9iYXphYXIuYXBpIiwiYXVkIjoiaHR0cHM6Ly9iYXphYXIuY2xpZW50cyJ9.qYZ3LF7KYXUXGKOsciDRif79Q1p3ZKPrdMWo7ObwyDs"; // REPLACE with a real token if USE_DUMMY_DATA is false

const MOCK_CURRENT_USER = {
  _id: '1c14986a-4ca6-48c7-9921-8611f3fbddc8', // Ensure this matches a valid user ID for your token
  name: 'Proba',
  avatar: 'https://i.pravatar.cc/150?u=currentuser_chatscreen',
};

const generateMessageId = () => Math.random().toString(36).substr(2, 9) + Date.now();

const dummyInitialMessages = (convId, currentUser, otherUserName) => {
  const otherUserForDummy = {
    _id: `otherUser_${convId}`, // Ensure this is a string
    name: otherUserName || `Other User ${convId}`,
    avatar: `https://i.pravatar.cc/150?u=other${convId}`
  };
  // Example for conversation ID 1
  if (convId == 1) { // Using == for potential string/number comparison from params
    return [
      {
        _id: generateMessageId(),
        text: `Hi ${otherUserForDummy.name}! This is a dummy message for our chat about Project Alpha.`,
        createdAt: new Date(Date.now() - 60000 * 10),
        user: currentUser, // This structure is handled by the 'else if (msgDto.user)' block
      },
      {
        _id: generateMessageId(),
        text: 'Hello! Yes, I saw your message. What specifically did you want to discuss?',
        createdAt: new Date(Date.now() - 60000 * 8),
        user: otherUserForDummy, // This structure is handled by the 'else if (msgDto.user)' block
      },
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  // Generic dummy messages for other conversations
  return [
    {
      _id: generateMessageId(),
      text: `Dummy chat with ${otherUserForDummy.name} (Conv ID: ${convId})`,
      createdAt: new Date(),
      user: { _id: 'system', name: 'System', avatar: null }, // System messages also need a user object
    },
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};
// --- END CONFIGURATION & MOCKS ---


// --- API HELPERS (Self-contained) ---
const fetchApiInline = async (endpoint, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (MOCK_TOKEN && !USE_DUMMY_DATA) {
    headers['Authorization'] = `Bearer ${MOCK_TOKEN}`;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`API Error ${response.status} for ${endpoint}:`, errorData);
      throw new Error(`HTTP error ${response.status}: ${errorData.substring(0,100)}`);
    }
    if (response.status === 204) return null;
    return response.json();
  } catch (error) { console.error("API call failed:", error); throw error; }
};

const fetchMessagesAPIInline = (convId, page = 1, pageSize = 30, otherUserNameForDummy) => {
  if (USE_DUMMY_DATA) {
    console.log(`Using DUMMY messages for conversation ${convId}`);
    return Promise.resolve(dummyInitialMessages(convId, MOCK_CURRENT_USER, otherUserNameForDummy));
  }
  console.log(`Fetching messages from LIVE API for conv ${convId}, page ${page}`);
  return fetchApiInline(`conversations/${convId}/messages?page=${page}&pageSize=${pageSize}`);
};

const markAsReadAPIInline = (convId) => {
  if (USE_DUMMY_DATA) {
    console.log(`DUMMY: Marked conversation ${convId} as read.`);
    return Promise.resolve(true);
  }
  console.log(`Marking conversation ${convId} as read via LIVE API.`);
  return fetchApiInline(`conversations/${convId}/markasread`, { method: 'POST' });
};
// --- END API HELPERS ---


const ChatScreen = () => {
  const params = useLocalSearchParams();
  const pathConversationId = params.conversationId;
  const paramOtherUserName = params.otherUserName;

  const [conversationId, setConversationId] = useState(
    pathConversationId ? parseInt(pathConversationId, 10) : (USE_DUMMY_DATA ? 1 : null)
  );
  const [otherUserName, setOtherUserName] = useState(paramOtherUserName || (USE_DUMMY_DATA ? 'Dummy Partner' : 'Chat Partner'));

  const appState = useRef(AppState.currentState);
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState(null);
  const [currentUser] = useState(MOCK_CURRENT_USER);
  const [isPrivateChat, setIsPrivateChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [signalRStatus, setSignalRStatus] = useState("Initializing...");

  // --- REVISED mapMessageDtoToGiftedChat ---
  const mapMessageDtoToGiftedChat = (msgDto) => {
    if (!msgDto) {
      console.error("mapMessageDtoToGiftedChat received a null or undefined msgDto");
      return null; // Or handle as an error / default message
    }

    // console.log("Mapping DTO: ", JSON.stringify(msgDto, null, 2)); // For debugging DTO structure

    let userId, userName, userAvatar;

    // console.log(msgDto);

    if (msgDto.senderUserId) {
      // Backend DTO structure (e.g., from API or SignalR live message)
      userId = msgDto.senderUserId.toString(); // Ensure ID is a string for GiftedChat
      userName = msgDto.senderUsername;
      userAvatar = msgDto.senderAvatarUrl;
    } else if (msgDto.user && typeof msgDto.user === 'object') {
      // Dummy data or GiftedChat-like structure with nested user object
      userId = msgDto.user._id?.toString(); // Ensure ID is a string
      userName = msgDto.user.name;
      userAvatar = msgDto.user.avatar;
    } else {
      // Fallback or error: user information is missing or in an unexpected format
      console.warn("mapMessageDtoToGiftedChat: Could not determine user info from msgDto:", msgDto);
      userId = 'unknown_sender';
      userName = 'Unknown Sender';
      userAvatar = null;
    }

    // Ensure essential user properties are not undefined
    if (userId === undefined || userId === null) {
        console.error("User ID is undefined after mapping for DTO:", msgDto);
        userId = 'fallback_user_id_' + generateMessageId(); // Critical: GiftedChat needs user._id
    }
     if (userName === undefined) {
        userName = 'User'; // Default name
    }

    return {
      _id: msgDto.id?.toString() || msgDto._id?.toString() || generateMessageId(),
      text: msgDto.content || msgDto.text || "", // Ensure text is not undefined
      createdAt: new Date(msgDto.sentAt || msgDto.createdAt || Date.now()), // Ensure valid date
      user: {
        _id: userId,
        name: userName,
        avatar: userAvatar,
      },
      isPrivateMessage: msgDto.isPrivate || msgDto.isPrivateMessage || false, // Default to false
      // Add any other properties you need GiftedChat to have
      // e.g., image: msgDto.imageUrl, video: msgDto.videoUrl, system: msgDto.isSystemMessage
    };
  };
  // --- END REVISED mapMessageDtoToGiftedChat ---


  const fetchMessages = useCallback(async (pageNum = 1, isInitialLoad = true) => {
    if (!conversationId || (!hasNextPage && pageNum > 1)) return;
    if (isInitialLoad) setLoading(true); else setLoadingEarlier(true);

    try {
      const fetchedData = await fetchMessagesAPIInline(conversationId, pageNum, 20, otherUserName);
      // Filter out null messages that might result from mapping errors
      const newGiftedMessages = fetchedData.map(mapMessageDtoToGiftedChat).filter(msg => msg !== null);


      setMessages(prev => pageNum === 1
        ? newGiftedMessages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        : GiftedChat.prepend(prev, newGiftedMessages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
      );
      setPage(pageNum);
      setHasNextPage(newGiftedMessages.length === 20);

      if (!USE_DUMMY_DATA) await markAsReadAPIInline(conversationId);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      Alert.alert("Error", "Could not load messages. " + error.message);
    } finally {
      if (isInitialLoad) setLoading(false); else setLoadingEarlier(false);
    }
  }, [conversationId, hasNextPage, USE_DUMMY_DATA, otherUserName]);

  useEffect(() => {
    if (conversationId) fetchMessages(1, true);
    else if (!USE_DUMMY_DATA) {
      setLoading(false);
      Alert.alert("Error", "No Conversation ID found for ChatScreen.");
    }
  }, [conversationId, fetchMessages]);


  // SignalR Connection Logic
  useEffect(() => {
    if (USE_DUMMY_DATA || !MOCK_TOKEN) {
      setSignalRStatus(USE_DUMMY_DATA ? "Disabled (Dummy Mode)" : "Disabled (No Token)");
      return;
    }
    if (!conversationId) { setSignalRStatus("Disabled (No Conv ID)"); return; }

    const newConnection = new HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => MOCK_TOKEN })
      .withAutomaticReconnect().configureLogging(LogLevel.Information).build();
    setConnection(newConnection);
    setSignalRStatus(`Connecting...`);

    const handleAppStateChange = (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active' &&
          newConnection && newConnection.state === HubConnectionState.Disconnected) {
        newConnection.start().then(() => setSignalRStatus('Reconnected!'))
          .catch(e => setSignalRStatus('Reconnection Failed'));
      }
      appState.current = nextAppState;
    };
    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => { sub.remove(); if (newConnection) newConnection.stop().catch(err => console.error("Error stopping SignalR:", err)); };
  }, [USE_DUMMY_DATA, conversationId]);


  useEffect(() => {
    if (!connection || USE_DUMMY_DATA || !conversationId) return;

    const startSignalR = async () => {
      try {
        if (connection.state === HubConnectionState.Disconnected) {
          await connection.start();
          setSignalRStatus('Connected!');
          await connection.invoke('JoinConversation', conversationId);
        }
        connection.on('ReceiveMessage', (msgDto) => {
          const giftedMessage = mapMessageDtoToGiftedChat(msgDto);
          if (giftedMessage && msgDto.conversationId === conversationId) {
            setMessages(prev => GiftedChat.append(prev, [giftedMessage]));
          }
        });
        connection.on('SendMessageFailed', r => Alert.alert("Message Not Sent", `Server: ${r}`));
        connection.onreconnecting(e => setSignalRStatus('Reconnecting...'));
        connection.onreconnected(async () => {
            setSignalRStatus('Reconnected!');
            if (conversationId) await connection.invoke('JoinConversation', conversationId);
        });
        connection.onclose(e => setSignalRStatus(`Disconnected: ${e || 'Connection Closed'}`));
      } catch (e) { setSignalRStatus(`Connection Failed: ${e.message.substring(0,30)}`); }
    };
    startSignalR();
    return () => { if (connection) { connection.off('ReceiveMessage'); connection.off('SendMessageFailed'); }};
  }, [connection, conversationId, USE_DUMMY_DATA]);

  const onSend = useCallback((newMsgs = []) => {
    const msg = newMsgs[0];
    if (USE_DUMMY_DATA) {
      setMessages(prev => GiftedChat.append(prev, [{ ...msg, _id: generateMessageId(), user: currentUser, createdAt: new Date(), isPrivateMessage: isPrivateChat }]));
      return;
    }
    if (!connection || connection.state !== HubConnectionState.Connected || !conversationId) {
      Alert.alert('Not Connected', 'Cannot send message.'); return;
    }
    connection.invoke('SendMessage', { ConversationId: conversationId, Content: msg.text, IsPrivate: isPrivateChat })
      .catch(err => Alert.alert("Send Error", `Msg not sent: ${err.message}`));
  }, [connection, currentUser, conversationId, isPrivateChat, USE_DUMMY_DATA]);

  const toggleIsPrivate = () => setIsPrivateChat(p => !p);
  const loadEarlier = () => { if (hasNextPage && !loadingEarlier && conversationId) fetchMessages(page + 1, false); };

  if (!USE_DUMMY_DATA && !conversationId) {
      return (
          <View style={styles.centered}>
              <Stack.Screen options={{ title: "Error" }} />
              <Text style={styles.errorText}>No Conversation ID provided.</Text>
          </View>
      );
  }
  if (loading && page === 1) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: 'Loading Chat...' }} />
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading messages...</Text>
        {USE_DUMMY_DATA && <Text style={styles.modeText}>(Using Dummy Data)</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: otherUserName || 'Chat' }} />

      {!USE_DUMMY_DATA && (
        <Text style={[styles.connectionStatus, { backgroundColor: signalRStatus === 'Connected!' ? '#4CAF50' : (signalRStatus.includes('Failed') || signalRStatus.includes('Disconnected') ? '#F44336' : '#FFC107')}]}>
          SignalR: {signalRStatus}
        </Text>
      )}
      {USE_DUMMY_DATA && (
         <View style={styles.modeBanner}><Text style={styles.modeBannerText}>DEMO MODE: Using Dummy Data</Text></View>
      )}
      <View style={styles.controls}>
        <Text>Mark new as "Private":</Text>
        <Switch value={isPrivateChat} onValueChange={toggleIsPrivate} trackColor={{ false: "#767577", true: "#81b0ff" }} thumbColor={isPrivateChat ? "#f5dd4b" : (Platform.OS === 'ios' ? "#f4f3f4" : "#ffffff")} ios_backgroundColor="#3e3e3e" />
      </View>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={currentUser} // The user sending the messages
        renderUsernameOnMessage
        isLoadingEarlier={loadingEarlier}
        loadEarlier={hasNextPage && !USE_DUMMY_DATA}
        onLoadEarlier={loadEarlier}
        messagesContainerStyle={{ paddingBottom: USE_DUMMY_DATA ? 0 : (Platform.OS === 'android' ? 10 : 0) }}
        renderLoading={() => <View style={styles.centered}><ActivityIndicator size="small" color="#007AFF" /></View>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 10, fontSize: 16, color: '#555' },
  modeText: { marginTop: 5, fontSize: 12, color: '#888' },
  modeBanner: { backgroundColor: '#FFA000', paddingVertical: 8, alignItems: 'center' },
  modeBannerText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, backgroundColor: '#f0f0f0', borderBottomWidth: 1, borderBottomColor: '#ccc' },
  connectionStatus: { textAlign: 'center', paddingVertical: 8, paddingHorizontal: 5, color: 'white', fontWeight: 'bold', fontSize: 12 },
  errorText: { color: '#D32F2F', fontSize: 16, textAlign: 'center', marginBottom: 10 },
});

export default ChatScreen;