import { Tabs, router } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FontAwesome } from '@expo/vector-icons';
import CustomHeader from 'proba-package/custom-header/index'; 
import { t } from 'i18next';

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store'; // Treba SecureStore ovdje
import { Platform, Alert } from 'react-native';

import Constants from 'expo-constants';

const baseURL = Constants.expoConfig!.extra!.apiBaseUrl as string;
const USE_DUMMY_DATA = Constants.expoConfig!.extra!.useDummyData as boolean;


const AUTH_TOKEN_KEY = 'auth_token'; // Koristite konstantu
const SENT_PUSH_TOKEN_KEY = 'sentPushToken'; // Koristite konstantu

// Funkcija za dohvat tokena iz SecureStore
async function getAuthTokenFromStorage(): Promise<string | null> {
  try {
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    console.log("(TabsLayout) Retrieved auth token:", token ? "Exists" : "null");
    return token;
  } catch (e) {
    console.error("(TabsLayout) Error getting auth token:", e);
    return null;
  }
}

// ➤➤➤ ZAMIJENI SA SVOJIM BACKEND URL-om ➤➤➤
const DEVICES_API_ENDPOINT = baseURL + '/api/Devices/pushNotification';

async function sendTokenToBackend(nativeToken: string) {
  const authToken = await getAuthTokenFromStorage();
  if (!authToken) {
    console.error("(TabsLayout) Cannot send device token: User not authenticated.");
    return;
  }
  console.log(`(TabsLayout) Sending native FCM token [${nativeToken.substring(0,10)}...] to backend.`);
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
      console.error('(TabsLayout) Error sending token to backend:', response.status, errorText);
    } else {
      console.log('(TabsLayout) Device token successfully registered with backend.');
      await SecureStore.setItemAsync(SENT_PUSH_TOKEN_KEY, nativeToken); // Sačuvaj uspješno poslani token
    }
  } catch (error: any) {
     console.error('(TabsLayout) Network or other error sending token to backend:', error);
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

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const [hasAttemptedPushRegistration, setHasAttemptedPushRegistration] = useState(false);

  useEffect(() => {
    // Ova logika će se izvršiti kada se TabLayout montira (tj. nakon logina)
    const attemptPushRegistration = async () => {
        console.log("(TabsLayout) useEffect triggered. Attempting push registration...");
        // Provjera tokena ovdje je dobra praksa, iako bi trebao postojati
        const userToken = await getAuthTokenFromStorage();
        if (userToken && !hasAttemptedPushRegistration) { // Provjeri i flag
            setHasAttemptedPushRegistration(true); // Označi da smo pokušali u ovom mount-u
            const pushToken = await registerForPushNotificationsAsync();
            if (pushToken) {
                console.log("(TabsLayout) Obtained native token:", pushToken);
                const lastSentToken = await SecureStore.getItemAsync(SENT_PUSH_TOKEN_KEY);
                if (lastSentToken !== pushToken) {
                    console.log("(TabsLayout) New or changed push token, sending to backend...");
                    await sendTokenToBackend(pushToken);
                } else {
                    console.log("(TabsLayout) Push token already sent to backend.");
                }
            } else {
                console.log("(TabsLayout) Could not get push token.");
            }
        } else if (!userToken) {
            console.warn("(TabsLayout) Auth token missing after navigating to tabs. Skipping push registration.");
             // Možda obrisati SENT_PUSH_TOKEN_KEY ako auth token nestane?
             await SecureStore.deleteItemAsync(SENT_PUSH_TOKEN_KEY);
        } else {
             console.log("(TabsLayout) Push registration already attempted in this tab session.");
        }
    };

    attemptPushRegistration();

    // Cleanup funkcija za useEffect nije nužno potrebna za ovu logiku,
    // osim ako pokrećete nešto što treba eksplicitno zaustaviti.
    // Ostavljamo prazno za sada.
    return () => {
       console.log("(TabsLayout) Unmounting.");
       // Ovdje ne uklanjamo globalne listenere
    };
  }, []); // Prazan dependency array `[]` znači da će se ovo izvršiti samo JEDNOM kada se TabLayout montira.


  return (
    <Tabs
    screenOptions={{
      tabBarStyle: { 
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderColor: '#b6d6ce'
      },
      tabBarActiveTintColor: '#4e8d7c',
      tabBarInactiveTintColor: '#6B7280',
      headerShown:false
    }}>
      <Tabs.Screen
        name="home"
        options={{
          title: t('home'),
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stores"
        options={{
          title: t('stores'),
          tabBarIcon: ({ color }) => (
            <FontAwesome name="shopping-bag" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t('search'),
          tabBarIcon: ({ color }) => (<FontAwesome size={28} name="search" color={color} />)
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t('cart'),
          tabBarIcon: ({ color }) => (<FontAwesome size={28} name="shopping-cart" color={color} />)
        }}
      />
      <Tabs.Screen
        name="chat" // This name corresponds to the 'chat' directory
        options={{
          title: t('chat', 'Poruke'),
          tabBarIcon: ({ color }) => (<FontAwesome size={28} name="comments" color={color} />),
          // Other options...
        }}
        // --- Move the listeners prop here, outside of options ---
        listeners={({ navigation, route }) => ({
          tabPress: e => {
            // Prevent the default action
            e.preventDefault();

            // Navigate to the root screen of this tab's stack ('chat/index')
            router.navigate('/chat');
          },
        })}
        // -------------------------------------------------------
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user-circle" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
