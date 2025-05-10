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

// --- CONFIGURATION & MOCKS ---
const USE_DUMMY_DATA = false; // SET TO false TO USE LIVE API
const API_BASE_URL = 'http://192.168.0.25:5054/api/Chat'; // YOUR ACTUAL API BASE URL
const MOCK_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxYzE0OTg2YS00Y2E2LTQ4YzctOTkyMS04NjExZjNmYmRkYzgiLCJlbWFpbCI6InByb2JhQHRlc3QuY29tIiwianRpIjoiY2YzZGE5NTMtNDA0MS00ZmYyLTg5NTItNDQ0MWVjNzMxNjk5Iiwicm9sZSI6IkJ1eWVyIiwibmJmIjoxNzQ2ODkyMDk4LCJleHAiOjE3NDY4OTU2OTgsImlhdCI6MTc0Njg5MjA5OCwiaXNzIjoiaHR0cHM6Ly9iYXphYXIuYXBpIiwiYXVkIjoiaHR0cHM6Ly9iYXphYXIuY2xpZW50cyJ9.qYZ3LF7KYXUXGKOsciDRif79Q1p3ZKPrdMWo7ObwyDs"; // REPLACE with a real token if USE_DUMMY_DATA is false
const MOCK_CURRENT_USER_ID = "user123_from_token"; // This ID should match the one backend extracts from MOCK_TOKEN

const DEFAULT_AVATAR = 'https://i.pravatar.cc/150?u=default';

const dummyConversationsData = [
  {
    id: 1,
    otherUserId: 'user456',
    otherUserName: 'Ana Anić (Dummy)',
    otherUserAvatar: 'https://i.pravatar.cc/150?u=ana',
    lastMessageContent: 'Hey, are you free for a call later today? I wanted to discuss the project.',
    lastMessageSentAt: new Date(Date.now() - 60000 * 5).toISOString(), // 5 minutes ago
    unreadMessageCount: 2,
    conversationTitle: 'Project Alpha Discussion',
  },
  {
    id: 2,
    otherUserId: 'user789',
    otherUserName: 'Pero Perić (Dummy)',
    otherUserAvatar: 'https://i.pravatar.cc/150?u=pero',
    lastMessageContent: 'Sure, sounds good! Let me know when.',
    lastMessageSentAt: new Date(Date.now() - 60000 * 60 * 3).toISOString(), // 3 hours ago
    unreadMessageCount: 0,
    conversationTitle: 'Weekend Plans',
  },
  {
    id: 3,
    otherUserId: 'userABC',
    otherUserName: 'Iva Ivić (Dummy)',
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
      const fetchedConversations = await fetchMyConversationsAPI();
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
      pathname: `screens/chat/${item.id}`, // Dynamic route using conversation ID
      params: {
        // conversationId is already part of the path, but you can pass it explicitly if needed
        // or if your ChatScreen expects it as a query param rather than a path segment.
        // For this example, assuming [conversationId].js handles the path segment.
        otherUserName: item.otherUserName,
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
          <Text style={styles.name}>{item.otherUserName || "Unknown User"}</Text>
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
        <Stack.Screen options={{ title: 'My Chats' }} />
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
      <Stack.Screen options={{ title: 'My Chats' }} />

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