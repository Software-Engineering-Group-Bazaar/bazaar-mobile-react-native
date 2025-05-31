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
import { useTranslation } from "react-i18next";

// --- CONFIGURATION & MOCKS ---
// const USE_DUMMY_DATA = true; // SET TO false TO USE LIVE API/SIGNALR
const API_BASE_URL = baseURL + '/api/Chat'; // YOUR ACTUAL API BASE URL
const TICKET_API_BASE_URL = baseURL + '/api/Tickets'; // API URL for Tickets
const HUB_URL = baseURL + '/chathub'; // YOUR ACTUAL SIGNALR HUB URL
let MOCK_TOKEN = "JWT_TOKEN"; // REPLACE with a real token if USE_DUMMY_DATA is false

let MOCK_CURRENT_USER = {
  _id: 'id', // Ensure this matches a valid user ID for your token
  name: 'Proba',
  avatar: 'https://i.pravatar.cc/150?u=currentuser_chatscreen',
};

// IIFE for token and user profile (remains mostly unchanged)
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
      return;
    }

    MOCK_TOKEN = authToken;
    console.log("MOCK_TOKEN successfully updated from SecureStore.");

    const endpoint = `${baseURL}/api/user-profile/my-username`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MOCK_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`HTTP error fetching user profile: ${response.status}, message: ${errorBody}. MOCK_CURRENT_USER will use param values or defaults.`);
      return;
    }
    // Assuming response is plain text username
    const usernameFromApi = await response.text();
    console.log("User profile (username) fetched:", usernameFromApi);

    // MOCK_CURRENT_USER will be updated later from params,
    // but we could set a default name from API if params are not present
    // For now, we prioritize params for MOCK_CURRENT_USER updates as done in the component.

  } catch (e) {
    console.error("Error during initial token/user-profile fetch:", e instanceof Error ? e.message : String(e));
  }
})();


const generateMessageId = () => Math.random().toString(36).substr(2, 9) + Date.now();

const dummyInitialMessages = (convId, currentUser, otherUserName) => {
  // ... (dummyInitialMessages implementation remains the same)
  const otherUserForDummy = {
    _id: `otherUser_${convId}`,
    name: otherUserName || `Other User ${convId}`,
    avatar: `https://i.pravatar.cc/150?u=other${convId}`
  };
  if (convId == 1) {
    return [
      { _id: generateMessageId(), text: `Hi ${otherUserForDummy.name}! Dummy about Project Alpha.`, createdAt: new Date(Date.now() - 60000 * 10), user: currentUser, },
      { _id: generateMessageId(), text: 'Hello! Dummy discussion.', createdAt: new Date(Date.now() - 60000 * 8), user: otherUserForDummy, },
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  return [ { _id: generateMessageId(), text: `Dummy chat with ${otherUserForDummy.name} (Conv ID: ${convId})`, createdAt: new Date(), user: { _id: 'system', name: 'System' },},
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};
// --- END CONFIGURATION & MOCKS ---


// --- API HELPERS (Self-contained) ---
const fetchApiGeneric = async (baseUrl, endpoint, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (MOCK_TOKEN && !USE_DUMMY_DATA) {
    headers['Authorization'] = `Bearer ${MOCK_TOKEN}`;
  }
  try {
    const response = await fetch(`${baseUrl}/${endpoint}`, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`API Error ${response.status} for ${baseUrl}/${endpoint}:`, errorData);
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
  return fetchApiGeneric(API_BASE_URL, `conversations/${convId}/all-messages?page=${page}&pageSize=${pageSize}`);
};

const markAsReadAPIInline = (convId) => {
  if (USE_DUMMY_DATA) {
    console.log(`DUMMY: Marked conversation ${convId} as read.`);
    return Promise.resolve(true);
  }
  console.log(`Marking conversation ${convId} as read via LIVE API.`);
  return fetchApiGeneric(API_BASE_URL, `conversations/${convId}/markasread`, { method: 'POST' });
};

// NEW: API Helper for fetching ticket details
const fetchTicketDetailsAPI = (ticketId) => {
  if (USE_DUMMY_DATA) {
    console.log(`DUMMY: Fetching ticket details for ticket ${ticketId}.`);
    // Simulate different statuses for testing
    // return Promise.resolve({ id: ticketId, status: 'Closed', /* other ticket properties */ });
    return Promise.resolve({ id: ticketId, status: 'Open', /* other ticket properties */ });
  }
  console.log(`Fetching ticket details for ${ticketId} via LIVE API.`);
  return fetchApiGeneric(TICKET_API_BASE_URL, `${ticketId}`); // Assumes endpoint is /api/Tickets/{ticketId}
};
// --- END API HELPERS ---


const ChatScreen = () => {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const pathConversationId = params.conversationId;
  const paramMyId = params.buyerUserId;
  const paramMyUserName = params.buyerUsername;
  const paramOtherUserName = params.otherUserUsername;
  const paramTicketId = params.ticketId; // Get ticketId from params

  // Update MOCK_CURRENT_USER based on params if available
  if (paramMyId) MOCK_CURRENT_USER._id = paramMyId;
  if (paramMyUserName) MOCK_CURRENT_USER.name = paramMyUserName;
  console.log("Current User: ", MOCK_CURRENT_USER._id, MOCK_CURRENT_USER.name);


  const [conversationId, setConversationId] = useState(
    pathConversationId ? parseInt(pathConversationId, 10) : (USE_DUMMY_DATA ? 1 : null)
  );
  const [otherUserName, setOtherUserName] = useState(paramOtherUserName || (USE_DUMMY_DATA ? 'Dummy Partner' : 'Chat Partner'));

  const appState = useRef(AppState.currentState);
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState(null);
  const [currentUser] = useState(MOCK_CURRENT_USER); // This is now correctly set from params or defaults
  const [isPrivateChat, setIsPrivateChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [signalRStatus, setSignalRStatus] = useState("Initializing...");

  // --- NEW STATE FOR TICKET STATUS ---
  const [ticketStatus, setTicketStatus] = useState(null); // e.g., 'Open', 'Closed', 'Pending'
  const [canSendMessage, setCanSendMessage] = useState(false); // Default to false until status is confirmed 'Open'
  const [isTicketStatusLoading, setIsTicketStatusLoading] = useState(false);
  // --- END NEW STATE ---

  const mapMessageDtoToGiftedChat = (msgDto) => {
    // ... (mapMessageDtoToGiftedChat implementation remains the same)
    if (!msgDto) {
      console.error("mapMessageDtoToGiftedChat received a null or undefined msgDto");
      return null;
    }
    let userId, userName, userAvatar;
    if (msgDto.senderUserId) {
      userId = msgDto.senderUserId.toString();
      userName = msgDto.senderUsername;
      userAvatar = msgDto.senderAvatarUrl;
    } else if (msgDto.user && typeof msgDto.user === 'object') {
      userId = msgDto.user._id?.toString();
      userName = msgDto.user.name;
      userAvatar = msgDto.user.avatar;
    } else {
      console.warn("mapMessageDtoToGiftedChat: Could not determine user info from msgDto:", msgDto);
      userId = 'unknown_sender'; userName = 'Unknown Sender'; userAvatar = null;
    }
    if (userId === undefined || userId === null) {
        userId = 'fallback_user_id_' + generateMessageId();
    }
     if (userName === undefined) userName = 'User';

    return {
      _id: msgDto.id?.toString() || msgDto._id?.toString() || generateMessageId(),
      text: msgDto.content || msgDto.text || "",
      createdAt: new Date(msgDto.sentAt || msgDto.createdAt || Date.now()),
      user: { _id: userId, name: userName, avatar: userAvatar, },
      isPrivateMessage: msgDto.isPrivate || msgDto.isPrivateMessage || false,
    };
  };

  // --- useEffect to fetch Ticket Status ---
  useEffect(() => {
    const loadTicketStatus = async () => {
      if (!paramTicketId) {
        console.log("No Ticket ID provided, assuming sending is allowed for general chat or testing.");
        // If no ticket ID, perhaps it's a general chat or a scenario where this check isn't needed.
        // For now, let's allow sending if no ticket ID is present.
        // You might want to change this behavior (e.g., block if no ticket ID and one is expected).
        setTicketStatus('N/A');
        setCanSendMessage(true); // Or false, depending on your app's logic for non-ticket chats
        return;
      }

      setIsTicketStatusLoading(true);
      setCanSendMessage(false); // Disable sending while checking

      try {
        const ticketData = await fetchTicketDetailsAPI(paramTicketId);
        if (ticketData && ticketData.status) {
          const currentStatus = ticketData.status;
          setTicketStatus(currentStatus);
          if (currentStatus.toLowerCase() === 'open') {
            setCanSendMessage(true);
            console.log(`Ticket ${paramTicketId} is Open. Messaging enabled.`);
          } else {
            setCanSendMessage(false);
            console.warn(`Ticket ${paramTicketId} is ${currentStatus}. Messaging disabled.`);
            Alert.alert(
              "Messaging Disabled",
              `This ticket is currently "${currentStatus}". You cannot send new messages.`
            );
          }
        } else {
          setTicketStatus('Error');
          setCanSendMessage(false);
          console.error(`Failed to get valid status for ticket ${paramTicketId}. Response:`, ticketData);
          Alert.alert("Error", "Could not determine ticket status. Messaging disabled.");
        }
      } catch (error) {
        setTicketStatus('Error');
        setCanSendMessage(false);
        console.error(`Error fetching ticket ${paramTicketId} status:`, error);
        Alert.alert("Error", `Failed to load ticket status: ${error.message}. Messaging disabled.`);
      } finally {
        setIsTicketStatusLoading(false);
      }
    };

    // Only run if not using dummy data for this specific check, or if paramTicketId is present
    // Or always run if you want to test dummy ticket status too.
    // if (!USE_DUMMY_DATA || paramTicketId) { // If you want to skip for dummy data
    loadTicketStatus();
    // } else {
    //   setTicketStatus('N/A (Dummy Mode)');
    //   setCanSendMessage(true); // Allow sending in dummy mode without ticket check
    // }
  }, [paramTicketId]); // Re-run if ticketId changes (though unlikely in a chat screen)
  // --- END useEffect for Ticket Status ---


  const fetchMessages = useCallback(async (pageNum = 1, isInitialLoad = true) => {
    // ... (fetchMessages implementation remains mostly the same)
     if (!conversationId || (!hasNextPage && pageNum > 1)) return;
    if (isInitialLoad) setLoading(true); else setLoadingEarlier(true);

    try {
      const fetchedData = await fetchMessagesAPIInline(conversationId, pageNum, 20, otherUserName);
      const newGiftedMessages = fetchedData.map(mapMessageDtoToGiftedChat).filter(msg => msg !== null);

      setMessages(prev => pageNum === 1
        ? newGiftedMessages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        : GiftedChat.prepend(prev, newGiftedMessages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
      );
      setPage(pageNum);
      setHasNextPage(newGiftedMessages.length === 20);

      if (!USE_DUMMY_DATA && conversationId) await markAsReadAPIInline(conversationId);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      Alert.alert("Error", "Could not load messages. " + error.message);
    } finally {
      if (isInitialLoad) setLoading(false); else setLoadingEarlier(false);
    }
  }, [conversationId, hasNextPage, otherUserName]); // Removed USE_DUMMY_DATA as it's handled inside API calls

  useEffect(() => {
    if (conversationId) fetchMessages(1, true);
    else if (!USE_DUMMY_DATA) {
      setLoading(false);
      // Don't alert here if it's just waiting for ticket status or other async setup
      // Alert.alert("Error", "No Conversation ID found for ChatScreen.");
      console.log("No Conversation ID yet, or not using dummy data.");
    }
  }, [conversationId, fetchMessages]);


  // SignalR Connection Logic
  useEffect(() => {
    // ... (SignalR connection logic remains mostly the same)
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
  }, [USE_DUMMY_DATA, conversationId, MOCK_TOKEN]); // Added MOCK_TOKEN


  useEffect(() => {
    // ... (SignalR message handling logic remains mostly the same)
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
        connection.on('SendMessageFailed', r => Alert.alert("Message Not Sent", `Server: ${r.errorMessage || r}`));
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
  }, [connection, conversationId]); // Removed USE_DUMMY_DATA

  // --- MODIFIED onSend ---
  const onSend = useCallback((newMsgs = []) => {
    if (!canSendMessage) {
      Alert.alert(
        'Messaging Disabled',
        `Cannot send message. The ticket is currently "${ticketStatus || 'status unknown'}".`
      );
      return;
    }

    const msg = newMsgs[0];
    if (USE_DUMMY_DATA) {
      setMessages(prev => GiftedChat.append(prev, [{ ...msg, _id: generateMessageId(), user: currentUser, createdAt: new Date(), isPrivateMessage: isPrivateChat }]));
      return;
    }
    if (!connection || connection.state !== HubConnectionState.Connected || !conversationId) {
      Alert.alert('Not Connected', 'Cannot send message. SignalR connection issue.'); return;
    }
    connection.invoke('SendMessage', { ConversationId: conversationId, Content: msg.text, IsPrivate: isPrivateChat, TicketId: paramTicketId || null }) // Optionally send ticketId
      .catch(err => Alert.alert("Send Error", `Message not sent: ${err.message}`));
  }, [connection, currentUser, conversationId, isPrivateChat, USE_DUMMY_DATA, canSendMessage, ticketStatus, paramTicketId]);
  // --- END MODIFIED onSend ---

  const toggleIsPrivate = () => setIsPrivateChat(p => !p);
  const loadEarlier = () => { if (hasNextPage && !loadingEarlier && conversationId) fetchMessages(page + 1, false); };

const renderCustomBubble = (props) => {
  // ... (renderCustomBubble implementation remains the same)
  const { currentMessage } = props;
  const isCurrentUser = currentMessage.user?._id === props.user._id;
  const isPrivate = currentMessage.isPrivateMessage;

  const bubbleStyle = isPrivate ? styles.privateBubble : (isCurrentUser ? styles.regularBubble : styles.otherBubble);
  const textStyle = isPrivate ? styles.privateText : (isCurrentUser ? styles.regularText : styles.otherText);

  return (
    <View style={{ marginBottom: 2 }}>
      {isPrivate && (
        <Text style={[styles.privateTagInline, isCurrentUser ? { alignSelf: 'flex-end', marginRight: 10 } : { alignSelf: 'flex-start', marginLeft: 10} ]}>Private</Text>
      )}
      <Bubble
        {...props}
        wrapperStyle={{
          left: bubbleStyle,
          right: bubbleStyle,
        }}
        textStyle={{
          left: textStyle,
          right: textStyle,
        }}
      />
    </View>
  );
};

  if (!USE_DUMMY_DATA && !MOCK_TOKEN && !conversationId) { // Adjusted initial guard
      return (
          <View style={styles.centered}>
              <Stack.Screen options={{ title: "Error" }} />
              <Text style={styles.errorText}>Chat requires a Conversation ID and Authentication.</Text>
          </View>
      );
  }

  // Show loading if messages are loading OR if ticket status is loading initially
  if ((loading && page === 1) || (isTicketStatusLoading && !ticketStatus)) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: 'Loading Chat...' }} />
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>
          {isTicketStatusLoading && !ticketStatus ? "Checking ticket status..." : "Loading messages..."}
        </Text>
        {USE_DUMMY_DATA && <Text style={styles.modeText}>(Using Dummy Data)</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: otherUserName || 'Chat' }} />

      {/* Ticket Status Banner */}
      {paramTicketId && ticketStatus && (
        <View style={[
            styles.statusBanner,
            !canSendMessage && ticketStatus.toLowerCase() !== 'open' && styles.statusBannerWarning,
            ticketStatus.toLowerCase() === 'open' && styles.statusBannerSuccess,
            isTicketStatusLoading && styles.statusBannerLoading
        ]}>
          <Text style={styles.statusBannerText}>
            Ticket Status: {ticketStatus}
            {isTicketStatusLoading && " (checking...)"}
            {!isTicketStatusLoading && !canSendMessage && ticketStatus.toLowerCase() !== 'open' && " - Messaging Disabled"}
          </Text>
        </View>
      )}

      {/*!USE_DUMMY_DATA && (
        <Text style={[styles.connectionStatus, { backgroundColor: signalRStatus === 'Connected!' ? '#4CAF50' : (signalRStatus.includes('Failed') || signalRStatus.includes('Disconnected') ? '#F44336' : '#FFC107')}]}>
          SignalR: {signalRStatus}
        </Text>
      )*/}
      {USE_DUMMY_DATA && (
         <View style={styles.modeBanner}><Text style={styles.modeBannerText}>DEMO MODE: Using Dummy Data</Text></View>
      )}
      <View style={styles.controls}>
        <Text>{t("Mark new as Private:")}</Text>
        <Switch value={isPrivateChat} onValueChange={toggleIsPrivate} trackColor={{ false: "#767577", true: "#4e8d7c" }} thumbColor={isPrivateChat ? "#ffffff" : "#ffffff"} ios_backgroundColor="#3e3e3e" />
      </View>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={currentUser}
        renderUsernameOnMessage
        isLoadingEarlier={loadingEarlier}
        loadEarlier={hasNextPage && !USE_DUMMY_DATA}
        onLoadEarlier={loadEarlier}
        messagesContainerStyle={{ paddingBottom: USE_DUMMY_DATA ? 0 : (Platform.OS === 'android' ? 10 : 0) }}
        renderLoading={() => <View style={styles.centered}><ActivityIndicator size="small" color="#007AFF" /></View>}
        renderBubble={renderCustomBubble}
        // Disable text input if cannot send messages
        textInputProps={{ editable: canSendMessage }}
        // Optionally, render a custom input toolbar to show a message instead of just disabling
        // renderInputToolbar={!canSendMessage ? () => <View><Text>Messaging disabled for this ticket.</Text></View> : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // ... (existing styles remain the same)
  container: { flex: 1, backgroundColor: '#F0F8F7' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 10, fontSize: 16, color: '#37474F' },
  modeText: { marginTop: 5, fontSize: 12, color: '#78909C' },
  modeBanner: { backgroundColor: '#80CBC4', paddingVertical: 10, alignItems: 'center' },
  modeBannerText: { color: 'white', fontSize: 15, fontWeight: 'bold' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#E0F2F1', borderBottomWidth: 1, borderBottomColor: '#B2DFDB' },
  controlsText: { fontSize: 16, color: '#263238', marginRight: 15 },
  connectionStatus: { textAlign: 'center', paddingVertical: 8, paddingHorizontal: 5, color: 'white', fontWeight: 'bold', fontSize: 12 },
  errorText: { color: '#D32F2F', fontSize: 16, textAlign: 'center', marginBottom: 10 },
 privateBubble: { backgroundColor: '#B2DFDB', },
  privateText: { color: '#263238', fontWeight: 'bold', },
  regularBubble: { backgroundColor: '#4E8D7C', },
  otherBubble: { backgroundColor: '#E8F5E9', },
  regularText: { color: '#FFFFFF', },
  otherText: { color: '#263238', },
  privateTagInline: {
    // alignSelf: 'flex-end', // Will be conditionally set in renderCustomBubble
    backgroundColor: '#B2DFDB',
    color: '#555555 ',
    fontSize: 10,
    fontWeight: 'bold',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    // marginRight: 10, // Applied conditionally
    // marginLeft: 4, // Applied conditionally
    marginBottom: -2, // Slight adjustment to make it closer to the bubble
    zIndex: 1,
  },
  // --- NEW STYLES FOR TICKET STATUS BANNER ---
  statusBanner: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#B2DFDB'
  },
  statusBannerText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#263238', // Dark grey blue
  },
  statusBannerSuccess: { // For 'Open' status
    backgroundColor: '#C8E6C9', // Light Green
  },
  statusBannerWarning: { // For 'Closed', 'Error', or other non-open and non-loading states
    backgroundColor: '#FFCDD2', // Light Red
  },
  statusBannerLoading: { // While checking status
    backgroundColor: '#FFF9C4', // Light Yellow
  }
});

export default ChatScreen;