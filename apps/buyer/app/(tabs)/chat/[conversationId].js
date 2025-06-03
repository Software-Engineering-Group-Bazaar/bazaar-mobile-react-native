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
const DEBUG_SIGNALR = false;

const DUMMY_JWT_TOKEN = "JWT_TOKEN_DUMMY_SCREEN_LEVEL";
const DEFAULT_CURRENT_USER_DUMMY = {
  _id: 'dummy_user_id_screen',
  name: 'Proba Dummy Screen',
  avatar: 'https://i.pravatar.cc/150?u=currentuser_chatscreen_dummy',
};

const generateMessageId = () => `msg-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;

const dummyMessagesStore = {}; // Store for dummy messages to allow pagination

const getOrCreateDummyMessages = (convId, currentUserForDummy, otherUserName) => {
  if (dummyMessagesStore[convId]) {
    return dummyMessagesStore[convId];
  }

  const otherUserForDummy = {
    _id: `otherUser_${convId}`,
    name: otherUserName || `Other User ${convId}`,
    avatar: `https://i.pravatar.cc/150?u=other${convId}`
  };

  let messages = [];
  if (convId == 1) { // Create more messages for convId 1 to test pagination
    for (let i = 0; i < 25; i++) { // e.g., 25 messages
        messages.push({
            _id: generateMessageId(),
            text: `Dummy message ${i + 1} for Project Alpha. ${i % 3 === 0 ? 'This is a longer message to test wrapping and layout a bit more thoroughly.' : ''}`,
            createdAt: new Date(Date.now() - 60000 * (25 - i) * 2), // Spread out over time
            user: i % 2 === 0 ? currentUserForDummy : otherUserForDummy,
        });
    }
  } else {
    messages = [
      { _id: generateMessageId(), text: `Dummy chat with ${otherUserForDummy.name} (Conv ID: ${convId})`, createdAt: new Date(), user: { _id: 'system', name: 'System' }},
    ];
  }
  dummyMessagesStore[convId] = messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return dummyMessagesStore[convId];
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
    console.log(`Using DUMMY messages for conversation ${convId}, page ${page}, pageSize ${pageSizeToFetch}`);
    const allMessages = getOrCreateDummyMessages(convId, currentUserForDummy, otherUserNameForDummy);
    const startIndex = (page - 1) * pageSizeToFetch;
    const endIndex = startIndex + pageSizeToFetch;
    const paginatedMessages = allMessages.slice(startIndex, endIndex);
    // console.log(`DUMMY: Returning ${paginatedMessages.length} messages for page ${page}. Start: ${startIndex}, End: ${endIndex}`);
    return Promise.resolve(paginatedMessages);
  }
  console.log(`Fetching messages from LIVE API for conv ${convId}, page ${page}, pageSize ${pageSizeToFetch}`);
  return fetchApiGeneric(API_BASE_URL, `conversations/${convId}/all-messages?page=${page}&pageSize=${pageSizeToFetch}`, token);
};

const markAsReadAPIInline = (convId, token) => {
  if (USE_DUMMY_DATA) {
    return Promise.resolve(true);
  }
  return fetchApiGeneric(API_BASE_URL, `conversations/${convId}/markasread`, token, { method: 'POST' });
};

const fetchTicketDetailsAPI = (ticketId, token) => {
  if (USE_DUMMY_DATA) {
    return Promise.resolve({ id: ticketId, status: 'Open' });
  }
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
  const [loading, setLoading] = useState(true); // Global loading for initial fetch or conversation switch
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [signalRStatus, setSignalRStatus] = useState("Initializing...");

  const [ticketStatus, setTicketStatus] = useState(null);
  const [canSendMessage, setCanSendMessage] = useState(false);
  const [isTicketStatusLoading, setIsTicketStatusLoading] = useState(false);

  const initialLoadForConvIdRef = useRef(null);


  // Helper to handle SignalR start/operation errors gracefully
  const handleSignalRError = (error, context) => {
    const errorMessage = error?.message || "Unknown error";
    if (errorMessage.includes("The connection was stopped during negotiation") ||
        errorMessage.includes("HubConnection.stop() was called") ||
        errorMessage.includes("connection was aborted") ||
        errorMessage.includes("Server returned an error on close")) {
      console.log(`SignalR: ${context}: Operation cancelled or interrupted. Expected during cleanup or server stop. Msg: ${errorMessage}`);
      setSignalRStatus(prevStatus => {
        if (prevStatus !== "Disconnected (intentional)" && prevStatus !== "Disconnected") return "Disconnected (intentional)";
        return prevStatus;
      });
    } else if (connectionRef.current === null) {
      console.log(`SignalR: ${context}: Operation failed, connection stopping (ref is null). Msg: ${errorMessage}`);
      setSignalRStatus(prevStatus => {
        if (prevStatus !== "Disconnected (intentional)" && prevStatus !== "Disconnected") return "Disconnected (intentional)";
        return prevStatus;
      });
    } else {
      console.error(`SignalR: ${context}: Failure:`, error);
      setSignalRStatus(`Conn Op Failed: ${String(errorMessage).substring(0,30)}`);
    }
  };


  useEffect(() => {
    const initializeChat = async () => {
      console.log("ChatScreen: Initialization started.");
      setIsInitializing(true);
      setInitializationError(null);
      // Reset states that depend on new conversation/user for the very first init
      // Specific resets for conversationId change are handled in another useEffect
      setMessages([]);
      setPage(1);
      setHasNextPage(true);
      setTicketStatus(null);
      setCanSendMessage(false);
      setLoading(true); // Ensure global loading is true during init

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
            setIsInitializing(false); setLoading(false); return;
          }
          tokenToSet = storedToken;
          if (!paramMyUserName && tokenToSet) {
            const endpoint = `${baseURL}/api/user-profile/my-username`;
            const response = await fetch(endpoint, { headers: { 'Authorization': `Bearer ${tokenToSet}`, 'Content-Type': 'application/json' } });
            if (response.ok) userToSet.name = await response.text();
            else console.warn(`HTTP error fetching user profile: ${response.status}`);
          }
        } catch (e) {
          setInitializationError(e.message || "Failed to load essential chat data.");
          setIsInitializing(false); setLoading(false); return;
        }
      }

      if (!userToSet._id) {
        setInitializationError("User ID could not be determined. Chat cannot proceed.");
        setIsInitializing(false); setLoading(false); return;
      }
      
      setAuthToken(tokenToSet);
      setCurrentUser(userToSet);
      const currentConvId = pathConversationId ? parseInt(pathConversationId, 10) : (USE_DUMMY_DATA ? 1 : null);
      setConversationId(currentConvId);
      // initialLoadForConvIdRef.current = null; // Reset for new potential conversation ID. Handled by dedicated useEffect.

      setIsInitializing(false); // Loading will be set to false by fetchMessages or its failure
      console.log("ChatScreen: Initialization complete. User:", userToSet._id, "ConvID:", currentConvId);
    };
    initializeChat();
  }, [paramMyId, paramMyUserName, pathConversationId, baseURL]); // pathConversationId will trigger this if route changes


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
    if (!isInitializing && conversationId) loadTicketStatus();
  }, [paramTicketId, authToken, isInitializing, t, conversationId]);


  const fetchMessages = useCallback(async (pageNumToFetch = 1, isInitialLoad = true) => {
    // `page` and `hasNextPage` are from useCallback's closure, representing state at callback creation time
    if (!conversationId) {
        console.log("fetchMessages skipped: No conversationId");
        if (isInitialLoad) setLoading(false); else setLoadingEarlier(false);
        return;
    }

    // If this is a "load earlier" request and we already know there are no more pages
    if (!isInitialLoad && !hasNextPage) {
      console.log(`fetchMessages (load earlier) for page ${pageNumToFetch} skipped: hasNextPage (from closure for page ${page}) is false.`);
      setLoadingEarlier(false);
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

    console.log(`fetchMessages: Fetching page ${pageNumToFetch}. InitialLoad: ${isInitialLoad}. ConvID: ${conversationId}. Current page in state: ${page}, HasNextPage in state: ${hasNextPage}`);
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

      setPage(pageNumToFetch);
      const currentFetchHasNextPage = newMappedMessages.length === PAGE_SIZE;
      setHasNextPage(currentFetchHasNextPage);
      console.log(`fetchMessages: Fetched ${newMappedMessages.length} messages for page ${pageNumToFetch}. Set HasNextPage to: ${currentFetchHasNextPage}`);

      if (!USE_DUMMY_DATA && conversationId && authToken && pageNumToFetch === 1 && isInitialLoad) {
        await markAsReadAPIInline(conversationId, authToken);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      Alert.alert(t("Error"), t("Could not load messages. {{message}}", {message: error.message}));
    } finally {
      if (isInitialLoad) setLoading(false); else setLoadingEarlier(false);
    }
  }, [conversationId, authToken, currentUser, otherUserName, t, page, hasNextPage]); // page, hasNextPage ARE NOW dependencies

  // Effect to reset state and initial load flag when conversationId changes
  useEffect(() => {
    if (pathConversationId) { // Only if conversationId is part of the route
        const newConvId = parseInt(pathConversationId, 10);
        console.log(`ChatScreen: Conversation ID from path changed to: ${newConvId}. Resetting state.`);
        setMessages([]);
        setPage(1);
        setHasNextPage(true);
        setLoading(true); // Show loader for new conversation
        initialLoadForConvIdRef.current = null; // Reset the initial load flag
        // conversationId state will be updated by the main initialization useEffect
    } else if (USE_DUMMY_DATA && !pathConversationId) { // Fallback for dummy data if no path ID
        console.log(`ChatScreen: Using dummy conversation ID 1. Resetting state.`);
        setMessages([]);
        setPage(1);
        setHasNextPage(true);
        setLoading(true);
        initialLoadForConvIdRef.current = null;
    }
  }, [pathConversationId]); // pathConversationId is the source of truth for convId changes from route

  // Effect for initial message loading
  useEffect(() => {
    if (!isInitializing && conversationId && (USE_DUMMY_DATA || (authToken && currentUser))) {
      if (initialLoadForConvIdRef.current !== conversationId) {
        console.log(`useEffect: Initial message fetch triggered for convId ${conversationId}.`);
        fetchMessages(1, true);
        initialLoadForConvIdRef.current = conversationId;
      } else {
        // console.log(`useEffect: Initial message fetch for convId ${conversationId} already done.`);
      }
    } else if (!isInitializing && !conversationId && !USE_DUMMY_DATA) {
      setLoading(false); // No conversation ID for live data, stop loading.
      console.log("useEffect: Initial message fetch skipped. No Conversation ID for live data.");
    } else if (!isInitializing) {
      // Other conditions not met (e.g. no auth token or user for live data)
      setLoading(false);
      // console.log("useEffect: Initial message fetch skipped. Other conditions not met.");
    }
  }, [isInitializing, conversationId, authToken, currentUser, fetchMessages, USE_DUMMY_DATA]);


  // SignalR Connection Management
  useEffect(() => {
    if (isInitializing) return;

    if (USE_DUMMY_DATA || !authToken) {
      setSignalRStatus(USE_DUMMY_DATA ? "Disabled (Dummy Mode)" : "Disabled (No Token)");
      if (connectionRef.current) {
         connectionRef.current.stop().catch(err => console.warn("Error stopping SignalR (dummy/no token):", err));
         connectionRef.current = null;
      }
      return;
    }
    if (!conversationId) { setSignalRStatus("Disabled (No Conv ID)"); return; }

    if (connectionRef.current) {
        console.warn("SignalR: Attempting to stop pre-existing connection before creating a new one.");
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
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        const conn = connectionRef.current;
        if (conn && conn.state === HubConnectionState.Disconnected) {
          console.log("SignalR: App became active, attempting to restart connection.");
          conn.start()
            .then(() => {
              if (connectionRef.current !== conn) {
                 console.log("SignalR: App Resume Start: Connection changed or stopped post-successful start.");
                 return;
              }
              setSignalRStatus('Reconnected!');
            })
            .catch(e => handleSignalRError(e, "App Resume Start"));
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      appStateSub.remove();
      const connToStop = connectionRef.current;
      if (connToStop) {
        connectionRef.current = null; 
        console.log("SignalR: Stopping connection (ref) from main connection useEffect cleanup.");
        connToStop.stop()
          .then(() => console.log("SignalR: Connection (ref) stopped successfully from cleanup."))
          .catch(err => {
             console.warn("SignalR: Error encountered while trying to stop connection in cleanup:", err);
          });
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
            if (prev.some(m => m._id === giftedMessage._id)) return prev;
            return GiftedChat.append(prev, [giftedMessage]);
        });
      }
    };
    const sendMessageFailedHandler = (r) => Alert.alert(t("Message Not Sent"), t("Server: {{errorMessage}}", {errorMessage: r.errorMessage || JSON.stringify(r)}));
    const reconnectingHandler = (error) => setSignalRStatus(error ? `Reconnecting: ${String(error.message).substring(0,30)}` : 'Reconnecting...');
    
    const reconnectedHandler = async (connectionId) => {
      const conn = connectionRef.current;
      if (!conn || conn !== currentConnection) {
          console.log("SignalR: Reconnected event fired, but connection instance has changed or is null.");
          return;
      }
      setSignalRStatus('Reconnected!');
      if (conversationId) {
        try {
          // Ensure we are operating on the correct connection instance that just reconnected.
          await conn.invoke('JoinConversation', conversationId);
          console.log("SignalR: Reconnected and re-joined. Fetching messages page 1 to ensure sync.");
          // fetchMessages might have changed due to page/hasNextPage updates.
          // We need to call the *current* version of fetchMessages.
          // Since fetchMessages is a dependency of this useEffect, this 'fetchMessages' reference is up-to-date.
          fetchMessages(1, true);
        } catch (joinError) {
          handleSignalRError(joinError, "Reconnected JoinConversation");
        }
      }
    };

    const closeHandler = (error) => {
        if (error) {
            if (connectionRef.current === null) {
                console.log(`SignalR: Connection closed (expected during client cleanup). Error: ${error.message}`);
                setSignalRStatus("Disconnected (intentional)");
            } else {
                console.warn(`SignalR: Connection closed with error: ${error.message}`);
                setSignalRStatus(`Disconnected: ${String(error.message).substring(0,30)}`);
            }
        } else {
            console.log("SignalR: Connection closed without error.");
            setSignalRStatus(connectionRef.current === null ? "Disconnected (intentional)" : "Disconnected");
        }
    };

    currentConnection.on('ReceiveMessage', receiveMessageHandler);
    currentConnection.on('SendMessageFailed', sendMessageFailedHandler);
    currentConnection.onreconnecting(reconnectingHandler);
    currentConnection.onreconnected(reconnectedHandler);
    currentConnection.onclose(closeHandler);

    if (currentConnection.state === HubConnectionState.Disconnected) {
      currentConnection.start()
        .then(() => {
          if (connectionRef.current !== currentConnection) {
            console.log("SignalR: Initial Start: Connection changed or stopped post-successful start, pre-join.");
            return Promise.reject(new Error("Connection instance changed or stopped post-start."));
          }
          setSignalRStatus('Connected!');
          return currentConnection.invoke('JoinConversation', conversationId);
        })
        .then(() => {
          if (connectionRef.current !== currentConnection) {
             console.log("SignalR: Initial Start: Connection changed or stopped post-join.");
             return;
          }
          console.log("SignalR: Joined conversation", conversationId);
        })
        .catch(e => handleSignalRError(e, "Initial Start / Join"));
    } else if (currentConnection.state === HubConnectionState.Connected) {
        console.log("SignalR: Connection already established, attempting to re-join conversation", conversationId);
        currentConnection.invoke('JoinConversation', conversationId)
            .catch(joinError => handleSignalRError(joinError, "Re-invoking JoinConversation on existing connection"));
    }

    return () => {
      if (currentConnection) {
        currentConnection.off('ReceiveMessage', receiveMessageHandler);
        currentConnection.off('SendMessageFailed', sendMessageFailedHandler);
        // onreconnecting, onreconnected, onclose handlers are typically cleared by .stop()
        // or when the connection object is discarded.
      }
    };
  }, [connectionRef.current, conversationId, isInitializing, t, fetchMessages]); // fetchMessages is now a dep here too

  const onSend = useCallback((newMsgs = []) => {
    if (!canSendMessage) {
      Alert.alert(t('Messaging Disabled'), t('Cannot send message. The ticket is currently "{{status}}".', { status: ticketStatus || t('status unknown')}));
      return;
    }
    const msg = newMsgs[0];
    if (USE_DUMMY_DATA) {
      if (!currentUser) { Alert.alert(t("Error"), t("Cannot send dummy message: Current user not set.")); return; }
      const dummyMessage = { ...msg, _id: generateMessageId(), user: currentUser, createdAt: new Date(), isPrivateMessage: isPrivateChat };
      setMessages(prev => GiftedChat.append(prev, [dummyMessage]));
      // For dummy data, also add to the store if you want it to persist for "load earlier" in the same session
      if (dummyMessagesStore[conversationId]) {
        dummyMessagesStore[conversationId].unshift(dummyMessage); // Add to start for correct sorting
      }
      return;
    }
    const currentConnection = connectionRef.current;
    if (!currentConnection || currentConnection.state !== HubConnectionState.Connected || !conversationId) {
      Alert.alert(t('Not Connected'), t('Cannot send message. SignalR connection issue.')); return;
    }
    if (!currentUser) { Alert.alert(t("Error"), t("Cannot send message: Current user not set.")); return; }

    currentConnection.invoke('SendMessage', { ConversationId: conversationId, Content: msg.text, IsPrivate: isPrivateChat, TicketId: paramTicketId || null })
      .catch(err => {
          Alert.alert(t("Send Error"), t("Message not sent: {{message}}", {message: err.message}));
          handleSignalRError(err, "SendMessage Invoke");
      });
  }, [currentUser, conversationId, isPrivateChat, USE_DUMMY_DATA, canSendMessage, ticketStatus, paramTicketId, t]);

  const toggleIsPrivate = () => setIsPrivateChat(p => !p);

  const loadEarlier = useCallback(() => {
    // `page`, `hasNextPage`, `loadingEarlier` are from closure, representing state when this callback was created.
    // `fetchMessages` is also from closure.
    console.log(`loadEarlier called. hasNextPage: ${hasNextPage}, loadingEarlier: ${loadingEarlier}, page: ${page}, convId: ${conversationId}`);
    if (hasNextPage && !loadingEarlier && conversationId && (USE_DUMMY_DATA || authToken)) {
        fetchMessages(page + 1, false);
    } else {
      console.log("loadEarlier skipped due to conditions:", {hasNextPage, loadingEarlier, conversationId, authTokenExists: !!authToken});
    }
  }, [hasNextPage, loadingEarlier, conversationId, authToken, fetchMessages, page, USE_DUMMY_DATA]);


  const renderCustomBubble = (props) => {
    const { currentMessage } = props;
    // Ensure currentUser from component's state is used for comparison, not props.user if it's unreliable
    if (!currentUser || !currentUser._id) return <Bubble {...props} />; 
    const isCurrentUser = currentMessage.user?._id === currentUser._id;
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
  if (!USE_DUMMY_DATA && !conversationId) {
      return (<View style={styles.centered}><Stack.Screen options={{ title: t("Error") }} /><Text style={styles.errorText}>{t("Chat requires a Conversation ID.")}</Text></View>);
  }
  
  // Show main loading only if messages array is empty AND global loading is true
  // This prevents full screen loader when `loadingEarlier` is true.
  if (loading && messages.length === 0 && !initializationError) {
    return (<View style={styles.centered}><Stack.Screen options={{ title: t('Loading Chat...') }} /><ActivityIndicator size="large" color="#007AFF" /><Text style={styles.loadingText}>{isTicketStatusLoading && !ticketStatus && paramTicketId ? t("Checking ticket status...") : t("Loading messages...")}</Text>{USE_DUMMY_DATA && <Text style={styles.modeText}>({t("Using Dummy Data")})</Text>}</View>);
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: otherUserName || t('Chat') }} />
      {paramTicketId && ticketStatus && (<View style={[styles.statusBanner, !canSendMessage && ticketStatus.toLowerCase() !== 'open' && styles.statusBannerWarning, ticketStatus.toLowerCase() === 'open' && styles.statusBannerSuccess, isTicketStatusLoading && styles.statusBannerLoading]}><Text style={styles.statusBannerText}>{t("Ticket Status")}: {ticketStatus}{isTicketStatusLoading && ` (${t("checking...")})`}{!isTicketStatusLoading && !canSendMessage && ticketStatus.toLowerCase() !== 'open' && ` - ${t("Messaging Disabled")}`}</Text></View>)}
      {DEBUG_SIGNALR && (<Text style={[styles.connectionStatus, { backgroundColor: signalRStatus.includes('Connected') || signalRStatus.includes('Reconnected') ? '#4CAF50' : (signalRStatus.includes('Failed') || signalRStatus.includes('Disconnected') && !signalRStatus.includes('intentional') ? '#F44336' : '#FFC107')}]}>SignalR: {signalRStatus}</Text>)}
      {USE_DUMMY_DATA && (<View style={styles.modeBanner}><Text style={styles.modeBannerText}>{t("DEMO MODE: Using Dummy Data")}</Text></View>)}
      <View style={styles.controls}><Text>{t("Mark new as Private:")}</Text><Switch value={isPrivateChat} onValueChange={toggleIsPrivate} trackColor={{ false: "#767577", true: "#4e8d7c" }} thumbColor={"#ffffff"} ios_backgroundColor="#3e3e3e" /></View>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={currentUser}
        renderUsernameOnMessage
        isLoadingEarlier={loadingEarlier}
        loadEarlier={hasNextPage} // Controls visibility of "Load earlier" button
        onLoadEarlier={loadEarlier} // Callback when button is pressed
        messagesContainerStyle={{ paddingBottom: (Platform.OS === 'android' ? 10 : 0) }}
        renderLoading={() => <View style={styles.centered}><ActivityIndicator size="small" color="#007AFF" /></View>}
        renderBubble={renderCustomBubble} // No need to spread props if renderCustomBubble takes 'props' directly
        textInputProps={{ editable: canSendMessage }}
        extraData={{ticketStatus, canSendMessage, signalRStatus}}
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