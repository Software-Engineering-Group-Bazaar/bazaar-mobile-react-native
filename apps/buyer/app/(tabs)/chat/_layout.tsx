// app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Recommended for better gestures

// It's good practice to wrap your root layout with GestureHandlerRootView
// especially if you use gesture-based navigators or components.
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        // Screen options can be configured globally here
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4e8d7c', // Example header color
          },
          headerTintColor: '#fff', // Example header text/icon color
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          // You might want to hide the header for some root layouts
          // headerShown: false,
        }}
      >
        {/*
          The `Stack.Screen` component for the index route of this layout.
          This is effectively your "ConversationsListScreen" if it's at `app/index.tsx`
          or `app/conversations/index.tsx` and this layout is `app/conversations/_layout.tsx`.

          If your ConversationsListScreen is a separate file like `app/conversations-list.tsx`,
          then you'd define it like the ChatScreen below.
        */}
        <Stack.Screen
          name="index" // This refers to `app/index.tsx` if this _layout is in `app/`
                      // or `app/conversations/index.tsx` if this is `app/conversations/_layout.tsx`
          options={{
            headerShown: false,
            title: 'My Chats',
          }}
        />
        <Stack.Screen
          name="chat/[conversationId]" // This would correspond to a file like `app/chat/[conversationId].tsx`
                                       // Expo Router uses file-based routing for dynamic segments.
                                       // The ChatScreen would then use `useLocalSearchParams` to get `conversationId`.
          options={({ route }) => ({
            // Title can be set dynamically based on route params,
            // but with file-based routing, params are usually fetched inside the screen component.
            // For now, a generic title or you can set it inside the ChatScreen component itself
            // using `navigation.setOptions`.
            title: 'Chat', // Static title here, or set dynamically in ChatScreen
            // headerBackTitleVisible: false, // Optional: hide back button text on iOS
          })}
        />
        {/*
          If your screens are NOT following the index pattern for the list,
          and you have separate files like:
          app/conversationsList.tsx
          app/chatScreen.tsx

          Then you'd define them as:
        <Stack.Screen name="conversationsList" options={{ title: 'My Chats' }} />
        <Stack.Screen name="chatScreen" options={{ title: 'Chat' }} />
        And your ChatScreen would get params like `conversationId` passed during navigation.
        The navigation in ConversationsListScreen would be:
        router.push({ pathname: '/chatScreen', params: { conversationId: item.id, otherUserName: item.otherUserName } });
        And in ChatScreen:
        const { conversationId, otherUserName } = useLocalSearchParams<{ conversationId: string, otherUserName: string }>();

        For this example, I'll assume you'll make `app/index.tsx` your `ConversationsListScreen`
        and `app/chat/[conversationId].tsx` your `ChatScreen`.
        */}
      </Stack>
    </GestureHandlerRootView>
  );
}