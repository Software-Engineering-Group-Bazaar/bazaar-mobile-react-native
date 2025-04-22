import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react'; // <<< Dodaj useState
import 'react-native-reanimated';
import { Platform, Alert } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store'; // <<< Dodaj SecureStore
import { apiSetNotificationsAsRead } from '../app/api/inboxApi';

import { useColorScheme } from '@/hooks/useColorScheme';

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

// --- Helper Funkcije ---

// Funkcija za dohvat tokena iz SecureStore
async function getAuthTokenFromStorage(): Promise<string | null> {
  try {
    const token = await SecureStore.getItemAsync('accessToken'); // Koristi isti ključ kao u login.tsx
    // console.log("Retrieved token from storage:", token ? "Exists" : "null");
    return token;
  } catch (e) {
    console.error("Error getting auth token from storage:", e);
    return null;
  }
}

// ➤➤➤ ZAMIJENI SA SVOJIM BACKEND URL-om ➤➤➤
const DEVICES_API_ENDPOINT = 'https://bazaar-system.duckdns.org/api/Devices/pushNotification';
// Primjer za Android emulator: 'http://10.0.2.2:5000/api/Devices/me/device'

async function sendTokenToBackend(nativeToken: string) {
  const authToken = await getAuthTokenFromStorage(); // Koristi funkciju za dohvat iz storage-a
  if (!authToken) {
    console.error("Cannot send device token: User not authenticated (token not found in storage).");
    return; // Ne šalji ako nema tokena
  }
  console.log(`Sending native FCM token [${nativeToken.substring(0,10)}...] to backend.`); // Loguj skraćeni token
  try {
    const response = await fetch(DEVICES_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ deviceToken: nativeToken }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error sending token to backend:', response.status, errorText);
       // Ne prikazuj Alert korisniku za pozadinske greške
       // Alert.alert("Greška", `Neuspješno registrovanje uređaja: ${response.status}`);
    } else {
      console.log('Device token successfully registered with backend.');
       // Sačuvaj poslani token da ga ne šalješ svaki put ako se nije promijenio
       await SecureStore.setItemAsync('sentPushToken', nativeToken);
    }
  } catch (error: any) {
     console.error('Network or other error sending token to backend:', error);
     // Alert.alert("Mrežna Greška", `Greška u komunikaciji sa serverom: ${error.message}`);
  }
}

async function registerForPushNotificationsAsync(): Promise<string | undefined> {
   let token: string | undefined;
    if (!Device.isDevice) {
        console.warn('Push notifications require a physical device.');
        return;
    }
    if (Platform.OS === 'android') {
        try {
             await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
             });
        } catch (e) { console.error("Failed to set notification channel:", e); }
    }

    console.log('Checking notification permissions...');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        console.log('Requesting notification permissions...');
        try { // Dodaj try-catch oko requestPermissionsAsync
             const { status } = await Notifications.requestPermissionsAsync();
             finalStatus = status;
        } catch (permError) {
             console.error("Error requesting notification permissions:", permError);
             Alert.alert('Greška Dozvola', 'Došlo je do greške prilikom traženja dozvola za notifikacije.');
             return; // Ne nastavljaj ako je došlo do greške
        }
    }
    if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted!');
        // Ne prikazuj alert svaki put, možda samo prvi put?
        // Alert.alert('Upozorenje', 'Niste omogućili dozvole za notifikacije.');
        return;
    }
    console.log('Notification permissions granted.');

    try {
        console.log('Getting native device token...');
        const pushTokenData = await Notifications.getDevicePushTokenAsync();
        console.log('Native push token data:', pushTokenData);
        token = pushTokenData.data;
    } catch (e: unknown) {
        // Alert.alert('Greška', `Neuspješno dobijanje push tokena: ${e}`);
        console.error("Error getting device push token:", e);
    }
    return token;
}


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

      // --- Provjera Autentifikacije i Pokretanje Registracije ---
      const checkAuthAndRegisterPush = async () => {
          const userToken = await getAuthTokenFromStorage();
          // Pokreni registraciju samo ako korisnik ima token I ako nismo već pokušali
          if (userToken && !hasAttemptedPushRegistration) {
              console.log("User authenticated, attempting push registration...");
              setHasAttemptedPushRegistration(true); // Označi da smo pokušali

              const pushToken = await registerForPushNotificationsAsync();
              if (pushToken) {
                  console.log("Obtained native token in _layout:", pushToken);
                  // Provjeri da li smo već poslali ovaj token
                  const lastSentToken = await SecureStore.getItemAsync('sentPushToken');
                  if (lastSentToken !== pushToken) {
                      console.log("New or changed push token, sending to backend...");
                      await sendTokenToBackend(pushToken);
                  } else {
                      console.log("Push token already sent to backend.");
                  }
              } else {
                  console.log("Could not get push token in _layout.");
              }
          } else if (!userToken) {
               console.log("User not authenticated, skipping push registration.");
               // Resetuj flag ako korisnik uradi logout negdje drugdje
               setHasAttemptedPushRegistration(false);
               SecureStore.deleteItemAsync('sentPushToken'); // Obriši poslani token pri logoutu
          }
      };

      checkAuthAndRegisterPush(); // Pozovi provjeru

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
          router.push({
            pathname: './(CRUD)/narudzba_detalji',
            params: { id: data.orderId.toString() },
          });
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
  }, [loaded, hasAttemptedPushRegistration]);


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