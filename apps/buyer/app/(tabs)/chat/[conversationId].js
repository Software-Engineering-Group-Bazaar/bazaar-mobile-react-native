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
import { useLocalSearchParams, Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useTranslation } from "react-i18next";

import Constants from 'expo-constants';

const baseURL = Constants.expoConfig.extra.apiBaseUrl;
const USE_DUMMY_DATA = Constants.expoConfig.extra.useDummyData;

// --- CONFIGURATION & MOCKS ---
const API_BASE_URL = baseURL + '/api/Chat';
const TICKET_API_BASE_URL = baseURL + '/api/Tickets';
const HUB_URL = baseURL + '/chathub';
const PAGE_SIZE = 20; // Define page size for fetching messages

const DUMMY_JWT_TOKEN = "JWT_TOKEN_DUMMY_SCREEN_LEVEL";
const DEFAULT_CURRENT_USER_DUMMY = {
  _id: 'dummy_user_id_screen',
  name: 'Proba Dummy Screen',
  avatar: 'https://i.pravatar.cc/150?u=currentuser_chatscreen_dummy',
};

const generateMessageId = () => `msg-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;

const dummyInitialMessages = (convId, currentUserForDummy, otherUserName) => {
  const otherUserForDummy = {
    _id: `otherUser_${convId}`,
    name: otherUserName || `Other User ${convId}`,
    avatar: `https://i.pravatar.cc/150?u=other${convId}`
  };
  if (convId == 1) {
    return [
      { _id: generateMessageId(), text: `Hi ${otherUserForDummy.name}! Dummy about Project Alpha.`, createdAt: new Date(Date.now() - 60000 * 10), user: currentUserForDummy, },
      { _id: generateMessageId(), text: 'Hello! Dummy discussion.', createdAt: new Date(Date.now() - 60000 * 8), user: otherUserForDummy, },
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  return [ { _id: generateMessageId(), text: `Dummy chat with ${otherUserForDummy.name} (Conv ID: ${convId})`, createdAt: new Date(), user: { _id: 'system', name: 'System' },},
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};
// --- END CONFIGURATION & MOCKS ---


// --- API HELPERS ---
const fetchApiGeneric = async (baseUrl, endpoint, token, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token && !USE_DUMMY_DATA) {
    headers['Authorization'] = `Bearer ${token}`;
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

const fetchMessagesAPIInline = (convId, token, currentUserForDummy, page = 1, pageSizeToFetch = PAGE_SIZE, otherUserNameForDummy) => {
  if (USE_DUMMY_DATA) {
    console.log(`Using DUMMY messages for conversation ${convId}, page ${page}`);
    // Dummy data does not support pagination for load earlier well,
    // if page > 1 for dummy data, return an empty array to simulate end of messages
    if (page > 1) return Promise.resolve([]);
    return Promise.resolve(dummyInitialMessages(convId, currentUserForDummy, otherUserNameForDummy));
  }
  console.log(`Fetching messages from LIVE API for conv ${convId}, page ${page}, pageSize ${pageSizeToFetch}`);
  return fetchApiGeneric(API_BASE_URL, `conversations/${convId}/all-messages?page=${page}&pageSize=${pageSizeToFetch}`, token);
};

const markAsReadAPIInline = (convId, token) => {
  if (USE_DUMMY_DATA) {
    // console.log(`DUMMY: Marked conversation ${convId} as read.`);
    return Promise.resolve(true);
  }
  // console.log(`Marking conversation ${convId} as read via LIVE API.`);
  return fetchApiGeneric(API_BASE_URL, `conversations/${convId}/markasread`, token, { method: 'POST' });
};

const fetchTicketDetailsAPI = (ticketId, token) => {
  if (USE_DUMMY_DATA) {
    // console.log(`DUMMY: Fetching ticket details for ticket ${ticketId}.`);
    return Promise.resolve({ id: ticketId, status: 'Open' });
  }
  // console.log(`Fetching ticket details for ${ticketId} via LIVE API.`);
  return fetchApiGeneric(TICKET_API_BASE_URL, `${ticketId}`, token);
};
// --- END API HELPERS ---


const ChatScreen = () => {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const pathConversationId = params.conversationId;
  const paramMyId = params.buyerUserId;
  const paramMyUserName = params.buyerUsername;
  const paramOtherUserName = params.otherUserUsername;
  const paramTicketId = params.ticketId;

  const [isInitializing, setIsInitializing] = useState(true);
  const [initializationError, setInitializationError] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [conversationId, setConversationId] = useState(
    pathConversationId ? parseInt(pathConversationId, 10) : (USE_DUMMY_DATA ? 1 : null)
  );
  const [otherUserName, setOtherUserName] = useState(paramOtherUserName || (USE_DUMMY_DATA ? 'Dummy Partner' : 'Chat Partner'));

  const appState = useRef(AppState.currentState);
  const [messages, setMessages] = useState([]);
  const connectionRef = useRef(null);
  const [isPrivateChat, setIsPrivateChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  const [page, setPage] = useState(1); // Current highest page number fetched
  const [hasNextPage, setHasNextPage] = useState(true);
  const [signalRStatus, setSignalRStatus] = useState("Initializing...");

  const [ticketStatus, setTicketStatus] = useState(null);
  const [canSendMessage, setCanSendMessage] = useState(false);
  const [isTicketStatusLoading, setIsTicketStatusLoading] = useState(false);

  useEffect(() => {
    const initializeChat = async () => {
      console.log("ChatScreen: Initialization started.");
      setIsInitializing(true);
      setInitializationError(null);
      // Reset states that depend on new conversation/user
      setMessages([]);
      setPage(1);
      setHasNextPage(true);
      setTicketStatus(null);
      setCanSendMessage(false);


      let tokenToSet;
      let userToSet = USE_DUMMY_DATA
        ? { ...DEFAULT_CURRENT_USER_DUMMY }
        : { _id: null, name: 'User', avatar: `https://i.pravatar.cc/150?u=${paramMyId || 'unknown_user'}` };

      if (paramMyId) userToSet._id = paramMyId;
      if (paramMyUserName) userToSet.name = paramMyUserName;

      if (USE_DUMMY_DATA) {
        tokenToSet = DUMMY_JWT_TOKEN;
      } else {
        try {
          const storedToken = await SecureStore.getItemAsync('auth_token');
          if (!storedToken) {
            setInitializationError('Authentication required. Please log in again.');
            setIsInitializing(false); return;
          }
          tokenToSet = storedToken;
          if (!paramMyUserName && tokenToSet) { // Fetch username if not provided by params
            const endpoint = `${baseURL}/api/user-profile/my-username`;
            const response = await fetch(endpoint, { headers: { 'Authorization': `Bearer ${tokenToSet}`, 'Content-Type': 'application/json' } });
            if (response.ok) userToSet.name = await response.text();
            else console.warn(`HTTP error fetching user profile: ${response.status}`);
          }
        } catch (e) {
          setInitializationError(e.message || "Failed to load essential chat data.");
          setIsInitializing(false); return;
        }
      }

      if (!userToSet._id) {
        setInitializationError("User ID could not be determined. Chat cannot proceed.");
        setIsInitializing(false); return;
      }
      
      setAuthToken(tokenToSet);
      setCurrentUser(userToSet);
      // Do not set conversationId here if it comes from path, it's already set
      // Only set if it's a fallback for dummy data and not pathConversationId
      if (!pathConversationId && USE_DUMMY_DATA) {
        setConversationId(1);
      } else if (pathConversationId) {
        setConversationId(parseInt(pathConversationId,10));
      } else {
        setConversationId(null); // No conv ID if not dummy and no path param
      }

      setIsInitializing(false);
      console.log("ChatScreen: Initialization complete. User:", userToSet._id, "ConvID:", conversationId);
    };
    initializeChat();
  }, [paramMyId, paramMyUserName, pathConversationId]); // Re-initialize if these key params change


  const mapMessageDtoToGiftedChat = (msgDto) => {
    if (!msgDto) return null;
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
      userId = 'unknown_sender'; userName = 'Unknown Sender';
    }
    if (!userId) userId = 'fallback_user_id_' + generateMessageId();
    if (!userName) userName = 'User';

    const messageId = msgDto.id?.toString() || msgDto._id?.toString() || generateMessageId();

    return {
      _id: messageId,
      text: msgDto.content || msgDto.text || "",
      createdAt: new Date(msgDto.sentAt || msgDto.createdAt || Date.now()),
      user: { _id: userId, name: userName, avatar: userAvatar },
      isPrivateMessage: msgDto.isPrivate || msgDto.isPrivateMessage || false,
    };
  };

  useEffect(() => {
    const loadTicketStatus = async () => {
      if (!paramTicketId) {
        setTicketStatus('N/A'); setCanSendMessage(true); return;
      }
      if (!USE_DUMMY_DATA && !authToken) return;

      setIsTicketStatusLoading(true); setCanSendMessage(false);
      try {
        const ticketData = await fetchTicketDetailsAPI(paramTicketId, authToken);
        if (ticketData && ticketData.status) {
          const currentStatus = ticketData.status;
          setTicketStatus(currentStatus);
          const isOpen = currentStatus.toLowerCase() === 'open';
          setCanSendMessage(isOpen);
          if (!isOpen) Alert.alert(t("Messaging Disabled"), t("This ticket is currently \"{{status}}\". You cannot send new messages.", {status: currentStatus}));
        } else {
          setTicketStatus('Error'); Alert.alert(t("Error"), t("Could not determine ticket status. Messaging disabled."));
        }
      } catch (error) {
        setTicketStatus('Error'); Alert.alert(t("Error"), t("Failed to load ticket status: {{message}}. Messaging disabled.", {message: error.message}));
      } finally {
        setIsTicketStatusLoading(false);
      }
    };
    if (!isInitializing && conversationId) loadTicketStatus(); // Ensure convId is also present
  }, [paramTicketId, authToken, isInitializing, t, conversationId]);


  const fetchMessages = useCallback(async (pageNumToFetch = 1, isInitialLoad = true) => {
    // Access current 'page' and 'hasNextPage' from state directly, not from useCallback deps
    // This ensures the function uses the latest state without making its reference unstable
    const currentPageState = page;
    const currentHasNextPageState = hasNextPage;

    if (!conversationId) {
        console.log("fetchMessages skipped: No conversationId");
        if (isInitialLoad) setLoading(false); else setLoadingEarlier(false);
        return;
    }
    if (!currentHasNextPageState && pageNumToFetch > currentPageState) {
      console.log(`fetchMessages skipped: No next page (current page: ${currentPageState}, trying to fetch: ${pageNumToFetch})`);
      setLoadingEarlier(false); // Ensure this is reset if we bail early
      return;
    }
    if (!USE_DUMMY_DATA && !authToken) {
        console.log("fetchMessages skipped: No authToken for live data");
        if (isInitialLoad) setLoading(false); else setLoadingEarlier(false);
        return;
    }
    if (!currentUser) {
        console.log("fetchMessages skipped: No currentUser");
        if (isInitialLoad) setLoading(false); else setLoadingEarlier(false);
        return;
    }

    console.log(`fetchMessages: Fetching page ${pageNumToFetch}. InitialLoad: ${isInitialLoad}. ConvID: ${conversationId}`);
    if (isInitialLoad) setLoading(true); else setLoadingEarlier(true);

    try {
      const fetchedData = await fetchMessagesAPIInline(conversationId, authToken, currentUser, pageNumToFetch, PAGE_SIZE, otherUserName);
      const newMappedMessages = fetchedData.map(mapMessageDtoToGiftedChat).filter(msg => msg !== null && msg._id != null);

      setMessages(prevMessages => {
        let updatedMessages;
        if (pageNumToFetch === 1) { // Initial load or refresh of the first page
          updatedMessages = [...newMappedMessages];
        } else { // Prepending older messages
          const existingIds = new Set(prevMessages.map(m => m._id));
          const messagesToPrepend = newMappedMessages.filter(m => !existingIds.has(m._id));
          updatedMessages = GiftedChat.prepend(prevMessages, messagesToPrepend);
        }
        return updatedMessages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      });

      setPage(pageNumToFetch); // Update the current page number that has been fetched
      setHasNextPage(newMappedMessages.length === PAGE_SIZE);
      console.log(`fetchMessages: Fetched ${newMappedMessages.length} messages for page ${pageNumToFetch}. HasNextPage: ${newMappedMessages.length === PAGE_SIZE}`);


      if (!USE_DUMMY_DATA && conversationId && authToken && pageNumToFetch === 1) {
        await markAsReadAPIInline(conversationId, authToken);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      Alert.alert(t("Error"), t("Could not load messages. {{message}}", {message: error.message}));
    } finally {
      if (isInitialLoad) setLoading(false); else setLoadingEarlier(false);
    }
  }, [conversationId, authToken, currentUser, otherUserName, t]); // Removed page, hasNextPage from deps

  useEffect(() => {
    if (!isInitializing && conversationId && (USE_DUMMY_DATA || (authToken && currentUser))) {
      console.log("useEffect: Initial message fetch triggered because isInitializing is false and core data is ready.");
      fetchMessages(1, true); // Always fetch page 1 on initial load for this conversation
    } else if (!isInitializing) {
      // If not initializing but conditions not met (e.g., no convId for live data)
      setLoading(false); // Ensure loading spinner is turned off
      console.log("useEffect: Initial message fetch skipped. isInitializing:false, but other conditions not met. ConvId:", conversationId, "Auth:", !!authToken, "User:", !!currentUser);
    }
  }, [isInitializing, conversationId, authToken, currentUser, fetchMessages]);

  // SignalR Connection Management
  useEffect(() => {
    if (isInitializing) return;

    if (USE_DUMMY_DATA || !authToken) {
      setSignalRStatus(USE_DUMMY_DATA ? "Disabled (Dummy Mode)" : "Disabled (No Token)");
      if (connectionRef.current) {
         connectionRef.current.stop().catch(err => console.error("Error stopping SignalR (dummy/no token):", err));
         connectionRef.current = null;
      }
      return;
    }
    if (!conversationId) { setSignalRStatus("Disabled (No Conv ID)"); return; }

    // If a connection already exists from a previous render (e.g. hot reload) and is for the same conversation, try to clean it up.
    // This is tricky with hot reload. A full app restart is cleaner for SignalR dev.
    if (connectionRef.current) {
        console.log("SignalR: Attempting to stop pre-existing connection before creating a new one.");
        connectionRef.current.stop().catch(e => console.warn("SignalR: Error stopping pre-existing connection:", e));
        connectionRef.current = null;
    }


    const newConnection = new HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => authToken })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();
    
    connectionRef.current = newConnection;
    setSignalRStatus(`Connecting...`);

    const appStateSub = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active' &&
          connectionRef.current && connectionRef.current.state === HubConnectionState.Disconnected) {
        connectionRef.current.start().then(() => setSignalRStatus('Reconnected!'))
          .catch(e => setSignalRStatus(`Reconnection Failed: ${e.message ? e.message.substring(0,30) : ''}`));
      }
      appState.current = nextAppState;
    });

    return () => {
      appStateSub.remove();
      if (connectionRef.current) {
        console.log("SignalR: Stopping connection (ref) from main connection useEffect cleanup.");
        connectionRef.current.stop()
          .then(() => console.log("SignalR: Connection (ref) stopped successfully."))
          .catch(err => console.error("Error stopping SignalR connection (ref):", err));
        connectionRef.current = null;
      }
    };
  }, [isInitializing, USE_DUMMY_DATA, conversationId, authToken, HUB_URL]);

  // SignalR Event Handling Logic
  useEffect(() => {
    const currentConnection = connectionRef.current;
    if (isInitializing || !currentConnection || USE_DUMMY_DATA || !conversationId) {
      return;
    }

    const receiveMessageHandler = (msgDto) => {
      const giftedMessage = mapMessageDtoToGiftedChat(msgDto);
      if (giftedMessage && msgDto.conversationId === conversationId) {
        setMessages(prev => {
            // Avoid adding duplicate messages received via SignalR
            if (prev.some(m => m._id === giftedMessage._id)) return prev;
            return GiftedChat.append(prev, [giftedMessage]);
        });
      }
    };
    const sendMessageFailedHandler = (r) => Alert.alert(t("Message Not Sent"), t("Server: {{errorMessage}}", {errorMessage: r.errorMessage || JSON.stringify(r)}));
    const reconnectingHandler = (error) => setSignalRStatus(error ? `Reconnecting: ${error.message.substring(0,30)}` : 'Reconnecting...');
    const reconnectedHandler = async (connectionId) => {
      setSignalRStatus('Reconnected!');
      if (conversationId && currentConnection) {
        try {
          await currentConnection.invoke('JoinConversation', conversationId);
          console.log("SignalR: Reconnected and re-joined. Fetching messages page 1 to ensure sync.");
          fetchMessages(1, true); // Fetch page 1 to refresh messages
        } catch (joinError) {
          setSignalRStatus(`Join Failed: ${joinError.message ? joinError.message.substring(0,30) : ''}`);
        }
      }
    };
    const closeHandler = (error) => setSignalRStatus(error ? `Disconnected: ${error.message.substring(0,30)}` : 'Disconnected');

    currentConnection.on('ReceiveMessage', receiveMessageHandler);
    currentConnection.on('SendMessageFailed', sendMessageFailedHandler);
    currentConnection.onreconnecting(reconnectingHandler);
    currentConnection.onreconnected(reconnectedHandler);
    currentConnection.onclose(closeHandler);

    if (currentConnection.state === HubConnectionState.Disconnected) {
      currentConnection.start()
        .then(() => {
          setSignalRStatus('Connected!');
          return currentConnection.invoke('JoinConversation', conversationId);
        })
        .then(() => console.log("SignalR: Joined conversation", conversationId))
        .catch(e => setSignalRStatus(`Connection Failed: ${e.message ? e.message.substring(0,30) : ''}`));
    } else if (currentConnection.state === HubConnectionState.Connected) {
        currentConnection.invoke('JoinConversation', conversationId)
            .catch(joinError => console.error("SignalR: Error re-invoking JoinConversation:", joinError));
    }

    return () => {
      if (currentConnection) {
        currentConnection.off('ReceiveMessage', receiveMessageHandler);
        currentConnection.off('SendMessageFailed', sendMessageFailedHandler);
        currentConnection.off('reconnecting', reconnectingHandler);
        currentConnection.off('reconnected', reconnectedHandler);
        currentConnection.off('close', closeHandler);
      }
    };
  }, [connectionRef.current, conversationId, isInitializing, t, fetchMessages]);

  const onSend = useCallback((newMsgs = []) => {
    if (!canSendMessage) {
      Alert.alert(t('Messaging Disabled'), t('Cannot send message. The ticket is currently "{{status}}".', { status: ticketStatus || t('status unknown')}));
      return;
    }
    const msg = newMsgs[0];
    if (USE_DUMMY_DATA) {
      if (!currentUser) { Alert.alert(t("Error"), t("Cannot send dummy message: Current user not set.")); return; }
      setMessages(prev => GiftedChat.append(prev, [{ ...msg, _id: generateMessageId(), user: currentUser, createdAt: new Date(), isPrivateMessage: isPrivateChat }]));
      return;
    }
    const currentConnection = connectionRef.current;
    if (!currentConnection || currentConnection.state !== HubConnectionState.Connected || !conversationId) {
      Alert.alert(t('Not Connected'), t('Cannot send message. SignalR connection issue.')); return;
    }
    if (!currentUser) { Alert.alert(t("Error"), t("Cannot send message: Current user not set.")); return; }

    currentConnection.invoke('SendMessage', { ConversationId: conversationId, Content: msg.text, IsPrivate: isPrivateChat, TicketId: paramTicketId || null })
      .catch(err => Alert.alert(t("Send Error"), t("Message not sent: {{message}}", {message: err.message})));
  }, [currentUser, conversationId, isPrivateChat, USE_DUMMY_DATA, canSendMessage, ticketStatus, paramTicketId, t]);

  const toggleIsPrivate = () => setIsPrivateChat(p => !p);

  const loadEarlier = useCallback(() => {
    console.log(`loadEarlier called. hasNextPage: ${hasNextPage}, loadingEarlier: ${loadingEarlier}, page: ${page}`);
    if (hasNextPage && !loadingEarlier && conversationId && (USE_DUMMY_DATA || authToken)) {
        fetchMessages(page + 1, false);
    }
  }, [hasNextPage, loadingEarlier, conversationId, authToken, fetchMessages, page, USE_DUMMY_DATA]);


  const renderCustomBubble = (props) => {
    const { currentMessage } = props;
    if (!props.user || !props.user._id) return <Bubble {...props} />;
    const isCurrentUser = currentMessage.user?._id === props.user._id;
    const isPrivate = currentMessage.isPrivateMessage;
    const bubbleStyle = isPrivate ? styles.privateBubble : (isCurrentUser ? styles.regularBubble : styles.otherBubble);
    const textStyle = isPrivate ? styles.privateText : (isCurrentUser ? styles.regularText : styles.otherText);
    return (
      <View style={{ marginBottom: 2 }}>
        {isPrivate && (<Text style={[styles.privateTagInline, isCurrentUser ? { alignSelf: 'flex-end', marginRight: 10 } : { alignSelf: 'flex-start', marginLeft: 10} ]}>Private</Text>)}
        <Bubble {...props} wrapperStyle={{ left: bubbleStyle, right: bubbleStyle }} textStyle={{ left: textStyle, right: textStyle }} />
      </View>
    );
  };

  if (isInitializing) {
    return (<View style={styles.centered}><Stack.Screen options={{ title: t('Initializing Chat...') }} /><ActivityIndicator size="large" color="#007AFF" /><Text style={styles.loadingText}>{t('Preparing chat...')}</Text></View>);
  }
  if (initializationError) {
    return (<View style={styles.centered}><Stack.Screen options={{ title: t("Error") }} /><Text style={styles.errorText}>{t("Error")}: {initializationError}</Text><Text style={styles.errorText}>{t("Could not load chat. Please try again later.")}</Text></View>);
  }
  if (!currentUser) {
      return (<View style={styles.centered}><Stack.Screen options={{ title: t("Error") }} /><Text style={styles.errorText}>{t("User information is missing. Cannot display chat.")}</Text></View>);
  }
  if (!USE_DUMMY_DATA && !conversationId) { // Check after initialization
      return (<View style={styles.centered}><Stack.Screen options={{ title: t("Error") }} /><Text style={styles.errorText}>{t("Chat requires a Conversation ID.")}</Text></View>);
  }
  // Show main loading only if messages array is empty for page 1, to allow "Load Earlier" to work without full screen loader
  if (loading && messages.length === 0 && !initializationError) {
    return (<View style={styles.centered}><Stack.Screen options={{ title: t('Loading Chat...') }} /><ActivityIndicator size="large" color="#007AFF" /><Text style={styles.loadingText}>{isTicketStatusLoading && !ticketStatus && paramTicketId ? t("Checking ticket status...") : t("Loading messages...")}</Text>{USE_DUMMY_DATA && <Text style={styles.modeText}>({t("Using Dummy Data")})</Text>}</View>);
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: otherUserName || t('Chat') }} />
      {paramTicketId && ticketStatus && (<View style={[styles.statusBanner, !canSendMessage && ticketStatus.toLowerCase() !== 'open' && styles.statusBannerWarning, ticketStatus.toLowerCase() === 'open' && styles.statusBannerSuccess, isTicketStatusLoading && styles.statusBannerLoading]}><Text style={styles.statusBannerText}>{t("Ticket Status")}: {ticketStatus}{isTicketStatusLoading && ` (${t("checking...")})`}{!isTicketStatusLoading && !canSendMessage && ticketStatus.toLowerCase() !== 'open' && ` - ${t("Messaging Disabled")}`}</Text></View>)}
      {!USE_DUMMY_DATA && (<Text style={[styles.connectionStatus, { backgroundColor: signalRStatus.includes('Connected') || signalRStatus.includes('Reconnected') ? '#4CAF50' : (signalRStatus.includes('Failed') || signalRStatus.includes('Disconnected') ? '#F44336' : '#FFC107')}]}>SignalR: {signalRStatus}</Text>)}
      {USE_DUMMY_DATA && (<View style={styles.modeBanner}><Text style={styles.modeBannerText}>{t("DEMO MODE: Using Dummy Data")}</Text></View>)}
      <View style={styles.controls}><Text>{t("Mark new as Private:")}</Text><Switch value={isPrivateChat} onValueChange={toggleIsPrivate} trackColor={{ false: "#767577", true: "#4e8d7c" }} thumbColor={"#ffffff"} ios_backgroundColor="#3e3e3e" /></View>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={currentUser}
        renderUsernameOnMessage
        isLoadingEarlier={loadingEarlier} // Controls the spinner in "Load earlier" button
        loadEarlier={hasNextPage} // Controls visibility of "Load earlier" button
        onLoadEarlier={loadEarlier}
        messagesContainerStyle={{ paddingBottom: (Platform.OS === 'android' ? 10 : 0) }}
        renderLoading={() => <View style={styles.centered}><ActivityIndicator size="small" color="#007AFF" /></View>}
        renderBubble={renderCustomBubble}
        textInputProps={{ editable: canSendMessage }}
        extraData={{ticketStatus, canSendMessage, signalRStatus}} // Force re-render if these change
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F8F7' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 10, fontSize: 16, color: '#37474F' },
  modeText: { marginTop: 5, fontSize: 12, color: '#78909C' },
  modeBanner: { backgroundColor: '#80CBC4', paddingVertical: 10, alignItems: 'center' },
  modeBannerText: { color: 'white', fontSize: 15, fontWeight: 'bold' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#E0F2F1', borderBottomWidth: 1, borderBottomColor: '#B2DFDB' },
  connectionStatus: { textAlign: 'center', paddingVertical: 8, paddingHorizontal: 5, color: 'white', fontWeight: 'bold', fontSize: 12 },
  errorText: { color: '#D32F2F', fontSize: 16, textAlign: 'center', marginBottom: 10 },
  privateBubble: { backgroundColor: '#B2DFDB', },
  privateText: { color: '#263238', fontWeight: 'bold', },
  regularBubble: { backgroundColor: '#4E8D7C', },
  otherBubble: { backgroundColor: '#E8F5E9', },
  regularText: { color: '#FFFFFF', },
  otherText: { color: '#263238', },
  privateTagInline: { backgroundColor: '#B2DFDB', color: '#555555 ', fontSize: 10, fontWeight: 'bold', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6, marginBottom: -2, zIndex: 1, },
  statusBanner: { paddingVertical: 8, paddingHorizontal: 15, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#B2DFDB'},
  statusBannerText: { fontSize: 13, fontWeight: 'bold', color: '#263238'},
  statusBannerSuccess: { backgroundColor: '#C8E6C9'},
  statusBannerWarning: { backgroundColor: '#FFCDD2'},
  statusBannerLoading: { backgroundColor: '#FFF9C4'}
});

export default ChatScreen;