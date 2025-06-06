// _layout.tsx (Root)
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router'; // Keep useRouter if needed for notification taps
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native'; // Keep Alert

import { useColorScheme } from '@/hooks/useColorScheme';
import { CartProvider } from '@/context/CartContext';
import CustomHeader from 'proba-package/custom-header';
import { useTranslation } from 'react-i18next';
// Importing i18n configuration
import i18next from './src/i18n/i18n.config';
// Ne treba SecureStore ovdje ako ne provjeravate token za registraciju
// Ne trebaju funkcije registerForPushNotificationsAsync, sendTokenToBackend, getAuthTokenFromStorage ovdje

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const router = useRouter(); // Keep for handling taps
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();
  const {t,ready} = useTranslation();
  // Ensure i18n is ready before rendering
  useEffect(() => {
    const initI18n = async () => {
      await i18next.init({
        lng: 'en', // Set your default language
        fallbackLng: 'en',
        resources: {
          en: { translation: require('./src/i18n/translations/en.json') },
          bs: { translation: require('./src/i18n/translations/bs.json') },
          de: { translation: require('./src/i18n/translations/de.json') },
          es: { translation: require('./src/i18n/translations/es.json') },
        },
      });
    };
    initI18n();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();

      // --- SAMO PODEŠAVANJE LISTNERA ---
      console.log("RootLayout: Setting up notification listeners...");

      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('RootLayout: Notification Received (Foreground):', notification);
        // Alert.alert(notification.request.content.title ?? "Obavijest", notification.request.content.body ?? "");
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('RootLayout: Notification Response Received (User Tapped):', response);
        const data = response.notification.request.content.data;
        if (data?.orderId) { // Use optional chaining
          console.log(`RootLayout: User tapped notification for Order ID: ${data.orderId}. Navigating...`);
          // ➤➤➤ Implementirajte navigaciju ovdje koristeći router ➤➤➤
          // Npr. router.push(`/orders/${data.orderId}`);
        } else {
          console.log("RootLayout: User tapped notification without specific nav data.");
        }
      });

      // Cleanup
      return () => {
        console.log("RootLayout: Cleaning up notification listeners...");
        if (notificationListener.current) {
          Notifications.removeNotificationSubscription(notificationListener.current);
        }
        if (responseListener.current) {
          Notifications.removeNotificationSubscription(responseListener.current);
        }
      };
    }
  }, [loaded, router]); // Add router to dependency array if used inside effect

  if (!loaded || !ready) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <CartProvider>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="screens/orders" options={{ headerShown: false }} />
            <Stack.Screen name="screens/store/[storeId]" options={{ headerShown: false }} />
            <Stack.Screen name="screens/addresses" options={{ headerShown: false }} />
            <Stack.Screen name="screens/orderRoute" options={{ headerShown: false }} />
            <Stack.Screen name="screens/orders/ticketCreate" options={{ headerShown: false }} />
            <Stack.Screen name="screens/myTickets" options={{ headerShown: false }}/>
            <Stack.Screen name="+not-found" />
          </Stack>
        </CartProvider>
      </GestureHandlerRootView>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}