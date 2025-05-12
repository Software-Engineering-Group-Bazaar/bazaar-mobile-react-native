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
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import { HubConnectionBuilder, LogLevel, HubConnectionState } from '@microsoft/signalr';
import { useLocalSearchParams, Stack, useRouter } // Import from expo-router
from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { baseURL, USE_DUMMY_DATA } from 'proba-package';

// --- CONFIGURATION & MOCKS ---
// const USE_DUMMY_DATA = true; // SET TO false TO USE LIVE API/SIGNALR
const API_BASE_URL = baseURL + '/api/Chat'; // YOUR ACTUAL API BASE URL
const HUB_URL = baseURL + '/chathub'; // YOUR ACTUAL SIGNALR HUB URL
let MOCK_TOKEN = "JWT_TOKEN"; // REPLACE with a real token if USE_DUMMY_DATA is false

let MOCK_CURRENT_USER = {
  _id: 'id', // Ensure this matches a valid user ID for your token
  name: 'Proba',
  avatar: 'https://i.pravatar.cc/150?u=currentuser_chatscreen',
};

(async () => {
  if (USE_DUMMY_DATA) {
    console.log("USE_DUMMY_DATA is true. Skipping live token/user-profile fetch. Using predefined MOCK_TOKEN and MOCK_CURRENT_USER_ID.");
    return;
  }

  console.log("USE_DUMMY_DATA is false. Attempting to fetch live token and user profile.");
  try {
    const authToken = await SecureStore.getItemAsync('auth_token');
    if (!authToken) {
      console.warn('Authentication token not found in SecureStore. MOCK_TOKEN will remain its default placeholder "JWT_TOKEN".');
      // MOCK_TOKEN remains "JWT_TOKEN". The app might show a warning or fail API calls if this is not a valid test token.
      return; // Exit if no token, MOCK_CURRENT_USER_ID will also remain default.
    }

    MOCK_TOKEN = authToken;
    console.log("MOCK_TOKEN successfully updated from SecureStore.");

    // Note: baseURL is from proba-package. Ensure it's correctly formatted (e.g., http://localhost:3000)
    const endpoint = `${baseURL}/api/user-profile/my-username`; // Corrected endpoint string

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MOCK_TOKEN}`, // Use the token we just fetched
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`HTTP error fetching user profile: ${response.status}, message: ${errorBody}. MOCK_CURRENT_USER_ID will remain its default.`);
      // MOCK_CURRENT_USER_ID remains default if fetching profile fails
      return;
    }

    // console.log("Dosao do ovdje?");

    // console.log("sta je u ovome ",response);

    const userData = await response.text();
    console.log("User profile data fetched:", userData);

    // Update MOCK_CURRENT_USER_ID based on fetched data, e.g., from userData.id or userData.username
    // Adjust these fields based on your actual API response structure for user profile
    if (userData && userData.id) {
      MOCK_CURRENT_USER_ID = userData.id;
      console.log("MOCK_CURRENT_USER_ID updated from API (using id):", MOCK_CURRENT_USER_ID);
    } else if (userData && userData.username) {
      MOCK_CURRENT_USER_ID = userData.username;
      console.log("MOCK_CURRENT_USER_ID updated from API (using username):", MOCK_CURRENT_USER_ID);
    } else {
      console.warn("Fetched user profile data does not contain 'id' or 'username'. MOCK_CURRENT_USER_ID will remain its default.", userData);
    }

  } catch (e) {
    // Catch any other errors during the async IIFE (e.g., network issues, SecureStore.getItemAsync failure)
    console.error("Error during initial token/user-profile fetch:", e instanceof Error ? e.message : String(e));
    // MOCK_TOKEN might be its default or updated if SecureStore succeeded but profile fetch failed.
    // MOCK_CURRENT_USER_ID will be its default.
  }
})();



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
  return fetchApiInline(`conversations/${convId}/all-messages?page=${page}&pageSize=${pageSize}`);
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
  const paramMyId = params.buyerUserId;
  const paramMyUserName = params.buyerUsername;
  const paramOtherUserName = params.sellerUsername;

  console.log("Moj id: ", paramMyId);
  MOCK_CURRENT_USER._id = paramMyId;
  MOCK_CURRENT_USER.name = paramMyUserName;

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

  const renderCustomBubble = (props) => {
    const { currentMessage } = props;
    if (currentMessage.isPrivateMessage) {
      return (
        <Bubble
          {...props}
          wrapperStyle={{
            left: {
              // Style for private messages received from others
              backgroundColor: '#e6e6fa', // Example: Light Lavender
            },
            right: {
              // Style for private messages sent by current user
              backgroundColor: '#add8e6', // Example: Light Blue
            },
          }}
          textStyle={{
            left: {
              color: '#333', // Optional: text color for received private messages
            },
            right: {
              color: '#000', // Optional: text color for sent private messages
            },
          }}
        />
      );
    }
    // Default bubble rendering for non-private messages
    return <Bubble {...props} />;
  };


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

      {/*!USE_DUMMY_DATA && (
        <Text style={[styles.connectionStatus, { backgroundColor: signalRStatus === 'Connected!' ? '#4CAF50' : (signalRStatus.includes('Failed') || signalRStatus.includes('Disconnected') ? '#F44336' : '#FFC107')}]}>
          SignalR: {signalRStatus}
        </Text>
      )*/}
      {USE_DUMMY_DATA && (
         <View style={styles.modeBanner}><Text style={styles.modeBannerText}>DEMO MODE: Using Dummy Data</Text></View>
      )}
      <View style={styles.controls}>
        <Text>Mark new as "Private":</Text>
        <Switch value={isPrivateChat} onValueChange={toggleIsPrivate} trackColor={{ false: "#767577", true: "#4e8d7c" }} thumbColor={isPrivateChat ? "#ffffff" : "#ffffff"} ios_backgroundColor="#3e3e3e" />
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
        renderBubble={renderCustomBubble}
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