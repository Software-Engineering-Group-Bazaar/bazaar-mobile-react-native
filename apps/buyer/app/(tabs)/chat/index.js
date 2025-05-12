// app/index.js (or app/conversations/index.js, or wherever your list screen is)
// For TypeScript, rename to .tsx and add types.
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect, Stack } from 'expo-router'; // Import useRouter and useFocusEffect from expo-router
import * as SecureStore from 'expo-secure-store';
import { baseURL, USE_DUMMY_DATA } from 'proba-package';


// --- CONFIGURATION & MOCKS ---
// const USE_DUMMY_DATA = true; // SET TO false TO USE LIVE API
const API_BASE_URL = baseURL + '/api/Chat'; // YOUR ACTUAL API BASE URL
let MOCK_TOKEN = "JWT_TOKEN"; // REPLACE with a real token if USE_DUMMY_DATA is false
let MOCK_CURRENT_USER_ID = "user123_from_token"; // This ID should match the one backend extracts from MOCK_TOKEN

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

    console.log("Dosao do ovdje?");

    console.log("sta je u ovome ",response);

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

const DEFAULT_AVATAR = 'https://i.pravatar.cc/150?u=default';

const dummyConversationsData = [
  {
    id: 1,
    otherUserId: 'user456',
    sellerUsername: 'Ana Anić (Dummy)',
    otherUserAvatar: 'https://i.pravatar.cc/150?u=ana',
    lastMessageContent: 'Hey, are you free for a call later today? I wanted to discuss the project.',
    lastMessageSentAt: new Date(Date.now() - 60000 * 5).toISOString(), // 5 minutes ago
    unreadMessageCount: 2,
    conversationTitle: 'Project Alpha Discussion',
  },
  {
    id: 2,
    otherUserId: 'user789',
    sellerUsername: 'Pero Perić (Dummy)',
    otherUserAvatar: 'https://i.pravatar.cc/150?u=pero',
    lastMessageContent: 'Sure, sounds good! Let me know when.',
    lastMessageSentAt: new Date(Date.now() - 60000 * 60 * 3).toISOString(), // 3 hours ago
    unreadMessageCount: 0,
    conversationTitle: 'Weekend Plans',
  },
  {
    id: 3,
    otherUserId: 'userABC',
    sellerUsername: 'Iva Ivić (Dummy)',
    otherUserAvatar: null, // Will use default avatar
    lastMessageContent: 'Thanks for the update!',
    lastMessageSentAt: new Date(Date.now() - 60000 * 60 * 24 * 2).toISOString(), // 2 days ago
    unreadMessageCount: 0,
    conversationTitle: null, // No specific title
  },
];
// --- END CONFIGURATION & MOCKS ---


// --- API HELPER (Self-contained) ---
const fetchApi = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (MOCK_TOKEN && !USE_DUMMY_DATA) {
    headers['Authorization'] = `Bearer ${MOCK_TOKEN}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, { ...options, headers });
    if (!response.ok) {
      let errorData = 'Unknown error';
      try { errorData = await response.text(); } catch (e) { /* ignore */ }
      console.error(`API Error ${response.status} for ${endpoint}:`, errorData);
      throw new Error(`HTTP error ${response.status}: ${errorData.substring(0,100)}`);
    }
    if (response.status === 204) return null;
    return response.json();
  } catch (error) {
    console.error("Network or API call failed:", error);
    throw error;
  }
};

const fetchMyConversationsAPI = () => {
  if (USE_DUMMY_DATA) {
    console.log("Using DUMMY conversations data.");
    return Promise.resolve(JSON.parse(JSON.stringify(dummyConversationsData)));
  }
  console.log("Fetching conversations from LIVE API.");
  return fetchApi('conversations');
};

const fetchConversationDetailsAPI = (conversationId) => {
  if (USE_DUMMY_DATA) {
    console.log(`Using DUMMY details data for conversation ${conversationId}.`);
    return Promise.resolve(dummyConversationDetails[conversationId] || { extraInfo: "No specific dummy details.", participantCount: 2, lastActivityByType: "Unknown"});
  }
  console.log(`Fetching details for conversation ${conversationId} from LIVE API.`);
  // Replace 'conversations/${conversationId}/details' with your actual endpoint structure
  return fetchApi(`conversations/${conversationId}/all-messages?page=1&pageSize=1`);
};
// --- END API HELPER ---

// --- DATE FORMATTER (Self-contained) ---
const formatConversationTimestamp = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};
// --- END DATE FORMATTER ---


const ConversationsListScreen = () => {
  const router = useRouter(); // Use useRouter from expo-router
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadConversations = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      let fetchedConversations;
      if(USE_DUMMY_DATA){
        fetchedConversations = await fetchMyConversationsAPI();
      }else{
        let initialConversations = await fetchMyConversationsAPI();

        // 2. Fetch additional details for each conversation
        const conversationsWithDetailsPromises = initialConversations.map(async (conversation) => {
          try {
            // const details = await fetchConversationDetailsAPI(conversation.id); // Assuming 'conversation.id' is the correct identifier
            // Merge the original conversation object with the new details
            // If details is null or undefined, it will just return the original conversation

            // console.log("detalji");
            // console.log(details[0].content);

            // console.log({ ...conversation, lastMessageContent: details[0].content, lastMessageSentAt: details[0].sentAt});
            // console.log({ ...conversation});
            
            return { ...conversation, lastMessageContent: conversation.lastMessage.content, lastMessageSentAt: conversation.lastMessage.sentAt};
          } catch (detailError) {
            console.warn(`Failed to fetch details for conversation ${conversation.id}:`, detailError);
            // Return the original conversation, perhaps with an error flag or default details
            return { ...conversation};
          }
        });

        // Wait for all detail-fetching promises to resolve
        fetchedConversations = await Promise.all(conversationsWithDetailsPromises);
      }
      // console.log(fetchedConversations);
      fetchedConversations.sort((a, b) => {
        if (!a.lastMessageSentAt && !b.lastMessageSentAt) return 0;
        if (!a.lastMessageSentAt) return 1;
        if (!b.lastMessageSentAt) return -1;
        return new Date(b.lastMessageSentAt).getTime() - new Date(a.lastMessageSentAt).getTime();
      });
      setConversations(fetchedConversations);
    } catch (err) {
      console.error("Failed to load conversations:", err);
      setError(err.message || "Couldn't load conversations. Please try again.");
      if (USE_DUMMY_DATA) {
          Alert.alert("Dummy Data Error", "There was an issue loading dummy data.");
      }
    } finally {
      if (!isRefresh) setLoading(false);
      setRefreshing(false);
    }
  }, []); // Empty dependency array if fetchMyConversationsAPI itself doesn't change

  useFocusEffect(
    useCallback(() => {
      loadConversations();
      return () => {};
    }, [loadConversations]) // loadConversations is stable
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadConversations(true);
  }, [loadConversations]); // loadConversations is stable

  const handleConversationPress = (item) => {
    // Navigate using expo-router
    // The path `/chat/${item.id}` should correspond to a file like `app/chat/[conversationId].js` or `app/chat/[id].js`
    // Params passed here will be available in ChatScreen via `useLocalSearchParams`
    router.push({
      pathname: `(tabs)/chat/${item.id}`, // Dynamic route using conversation ID
      params: {
        // conversationId is already part of the path, but you can pass it explicitly if needed
        // or if your ChatScreen expects it as a query param rather than a path segment.
        // For this example, assuming [conversationId].js handles the path segment.
        sellerUsername: item.sellerUsername,
        otherUserAvatar: item.otherUserAvatar || DEFAULT_AVATAR,
        // MOCK_CURRENT_USER_ID is handled within ChatScreen's self-contained logic
      },
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleConversationPress(item)}>
      <Image
        source={{ uri: item.otherUserAvatar || DEFAULT_AVATAR }}
        style={styles.avatar}
      />
      <View style={styles.textContainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{item.sellerUsername || "Unknown User"}</Text>
          {item.lastMessageSentAt && (
            <Text style={styles.time}>{formatConversationTimestamp(item.lastMessageSentAt)}</Text>
          )}
        </View>
        {item.conversationTitle && <Text style={styles.conversationTitle} numberOfLines={1}>{item.conversationTitle}</Text>}
        <View style={styles.row}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessageContent || (USE_DUMMY_DATA && !item.lastMessageContent ? "Tap to start chatting!" : "No messages yet")}
          </Text>
          {item.unreadMessageCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadMessageCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        {/* Set title for this screen in the layout file or here if dynamic */}
        {/*<Stack.Screen options={{ title: 'My Chats' }} />*/}
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading conversations...</Text>
        {USE_DUMMY_DATA && <Text style={styles.modeText}>(Using Dummy Data)</Text>}
      </View>
    );
  }

  if (error && !conversations.length) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: 'Error' }} />
        <Text style={styles.errorText}>{error}</Text>
        {!USE_DUMMY_DATA && MOCK_TOKEN === "YOUR_VALID_JWT_TOKEN_HERE_FOR_LIVE_API_TESTING" && (
            <Text style={styles.warningText}>Reminder: Replace MOCK_TOKEN with a real JWT for live API calls.</Text>
        )}
        <TouchableOpacity onPress={() => loadConversations()} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Expo Router: Screen options are typically set in _layout.tsx or via <Stack.Screen /> */}
      {/* If this is the 'index' screen of a stack, its options are set in _layout.tsx's <Stack.Screen name="index" /> */}
      {/* Or you can use <Stack.Screen options={{...}} /> here if it's not an index route of a layout */}
      {/*<Stack.Screen options={{ title: 'My Chats' }} />*/}

      {USE_DUMMY_DATA && (
        <View style={styles.modeBanner}>
          <Text style={styles.modeBannerText}>DEMO MODE: Using Dummy Data</Text>
        </View>
      )}
      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          !loading && !error && (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No conversations yet.</Text>
              <Text style={styles.emptySubText}>Start a new chat to see it here.</Text>
            </View>
          )
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007AFF"]}
            tintColor={"#007AFF"}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F8',
  },
  modeBanner: {
    backgroundColor: '#FFA000',
    paddingVertical: 8,
    alignItems: 'center',
  },
  modeBannerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F4F4F8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  modeText: {
    marginTop: 5,
    fontSize: 12,
    color: '#888',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  warningText: {
    color: '#FFA000',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#E0E0E0',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  conversationTitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  time: {
    fontSize: 12,
    color: '#777',
  },
  lastMessage: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginLeft: 78,
  },
  emptyText: {
    fontSize: 18,
    color: '#777',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  }
});

export default ConversationsListScreen;