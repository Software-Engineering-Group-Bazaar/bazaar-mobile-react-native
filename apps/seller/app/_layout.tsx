import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react'; // <<< Dodaj useState
import 'react-native-reanimated';
import * as Notifications from 'expo-notifications';

import { useColorScheme } from '@/hooks/useColorScheme';

import { LogBox } from "react-native";

LogBox.ignoreLogs([
  "Warning: Text strings must be rendered within a <Text> component.",
]);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// --- Notification Handler ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// --- Glavna Layout Komponenta ---
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const router = useRouter();
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();
  // Stanje da pratimo da li smo pokušali registraciju
  const [hasAttemptedPushRegistration, setHasAttemptedPushRegistration] = useState(false);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      
      // Postavi Listenere (uvijek ih postavi, možda stigne notifikacija i za neulogovanog?)
      // Listener za primljene notifikacije (foreground)
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification Received (Foreground) in _layout:', notification);
        //Alert.alert(notification.request.content.title ?? "Obavijest", notification.request.content.body ?? "");
      });

      // Listener za klik na notifikaciju
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification Response Received (User Tapped) in _layout:', response);
        const data = response.notification.request.content.data;
        if (data && data.orderId) {
          console.log(`User tapped notification for Order ID: ${data.orderId}. Navigating...`);
          if (/narudžb/i.test(data.message)) {
            router.push({
              pathname: '/(CRUD)/narudzba_detalji',
              params: { id: data.orderId.toString() },
            });
          } else {
            router.push('../(tabs)/zalihe');
          }
          /*const handleNotificationTap = async () => {
            router.push({
              pathname: '/(CRUD)/narudzba_detalji',
              params: { id: data.orderId.toString() },
            });
      
            try {
              console.log("Notification ID:", data);
              await apiSetNotificationsAsRead(data.id);
            } catch (error) {
              console.error("Failed to mark notification as read:", error);
            }
          };
          handleNotificationTap();*/
        } else {
             console.log("User tapped notification without specific nav data.");
        }
      });

      // Cleanup
      return () => {
        console.log("RootLayout useEffect cleanup. Removing notification listeners...");
        if (notificationListener.current) {
          Notifications.removeNotificationSubscription(notificationListener.current);
        }
        if (responseListener.current) {
          Notifications.removeNotificationSubscription(responseListener.current);
        }
      };
    }
  }, [loaded, router]);


  if (!loaded) {
    return null;
  }

  // Originalni return
  return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(CRUD)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
  );
}