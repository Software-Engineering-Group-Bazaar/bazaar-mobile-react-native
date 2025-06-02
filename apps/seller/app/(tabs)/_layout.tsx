import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";
import { Platform, Alert } from "react-native";
import NotificationIcon from "@/components/ui/NotificationIcon";
import { baseURL } from "../env";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { CopilotProvider } from "react-native-copilot";
import LoyaltyScreen from "./loyalty";
import ChatListScreen from "./messaging";
import StoresScreen from "./pregled_prodavnica";
import ZaliheScreen from "./zalihe";

const Tab = createBottomTabNavigator();

const AUTH_TOKEN_KEY = "accessToken";
const SENT_PUSH_TOKEN_KEY = "sentPushToken";

// Funkcija za dohvat tokena iz SecureStore
async function getAuthTokenFromStorage(): Promise<string | null> {
  try {
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    console.log(
      "(TabsLayout) Retrieved auth token:",
      token ? "Exists" : "null"
    );
    return token;
  } catch (e) {
    console.error("(TabsLayout) Error getting auth token:", e);
    return null;
  }
}

// ➤➤➤ ZAMIJENI SA SVOJIM BACKEND URL-om ➤➤➤
const DEVICES_API_ENDPOINT =
  `${baseURL}/api/Devices/pushNotification`;

async function sendTokenToBackend(nativeToken: string) {
  const authToken = await getAuthTokenFromStorage();
  if (!authToken) {
    console.error(
      "(TabsLayout) Cannot send device token: User not authenticated."
    );
    return;
  }
  console.log(
    `(TabsLayout) Sending native FCM token [${nativeToken.substring(
      0,
      10
    )}...] to backend.`
  );
  try {
    const response = await fetch(DEVICES_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ deviceToken: nativeToken }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "(TabsLayout) Error sending token to backend:",
        response.status,
        errorText
      );
    } else {
      console.log(
        "(TabsLayout) Device token successfully registered with backend."
      );
      await SecureStore.setItemAsync(SENT_PUSH_TOKEN_KEY, nativeToken); // Sačuvaj uspješno poslani token
    }
  } catch (error: any) {
    console.error(
      "(TabsLayout) Network or other error sending token to backend:",
      error
    );
  }
}

async function registerForPushNotificationsAsync(): Promise<
  string | undefined
> {
  let token: string | undefined;
  if (!Device.isDevice) {
    console.warn("Push notifications require a physical device.");
    return;
  }
  if (Platform.OS === "android") {
    try {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    } catch (e) {
      console.error("Failed to set notification channel:", e);
    }
  }

  console.log("Checking notification permissions...");
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    console.log("Requesting notification permissions...");
    try {
      // Dodaj try-catch oko requestPermissionsAsync
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    } catch (permError) {
      console.error("Error requesting notification permissions:", permError);
      Alert.alert(
        "Greška Dozvola",
        "Došlo je do greške prilikom traženja dozvola za notifikacije."
      );
      return; // Ne nastavljaj ako je došlo do greške
    }
  }
  if (finalStatus !== "granted") {
    console.warn("Notification permissions not granted!");
    // Ne prikazuj alert svaki put, možda samo prvi put?
    // Alert.alert('Upozorenje', 'Niste omogućili dozvole za notifikacije.');
    return;
  }
  console.log("Notification permissions granted.");

  try {
    console.log("Getting native device token...");
    const pushTokenData = await Notifications.getDevicePushTokenAsync();
    console.log("Native push token data:", pushTokenData);
    token = pushTokenData.data;
  } catch (e: unknown) {
    // Alert.alert('Greška', `Neuspješno dobijanje push tokena: ${e}`);
    console.error("Error getting device push token:", e);
  }
  return token;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  const [hasAttemptedPushRegistration, setHasAttemptedPushRegistration] =
    useState(false);

  useEffect(() => {
    // Ova logika će se izvršiti kada se TabLayout montira (tj. nakon logina)
    const attemptPushRegistration = async () => {
      console.log(
        "(TabsLayout) useEffect triggered. Attempting push registration..."
      );
      // Provjera tokena ovdje je dobra praksa, iako bi trebao postojati
      const userToken = await getAuthTokenFromStorage();
      if (userToken && !hasAttemptedPushRegistration) {
        // Provjeri i flag
        setHasAttemptedPushRegistration(true); // Označi da smo pokušali u ovom mount-u
        const pushToken = await registerForPushNotificationsAsync();
        if (pushToken) {
          console.log("(TabsLayout) Obtained native token:", pushToken);
          const lastSentToken = await SecureStore.getItemAsync(
            SENT_PUSH_TOKEN_KEY
          );
          await sendTokenToBackend(pushToken);
        } else {
          console.log("(TabsLayout) Could not get push token.");
        }
      } else if (!userToken) {
        console.warn(
          "(TabsLayout) Auth token missing after navigating to tabs. Skipping push registration."
        );
        // Možda obrisati SENT_PUSH_TOKEN_KEY ako auth token nestane?
        await SecureStore.deleteItemAsync(SENT_PUSH_TOKEN_KEY);
      } else {
        console.log(
          "(TabsLayout) Push registration already attempted in this tab session."
        );
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
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#4E8D7C",
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: { position: "absolute" },
          default: {},
        }),
        headerRight: () => <NotificationIcon />,
        // headerRightContainerStyle: { paddingRight: 16 },
      }}
    >
      <Tab.Screen name="pregled_prodavnica"
        options={{
          title: t("tab_stores"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="storefront" color={color} />
          ),
        }}
      >
        {() => (
          <StoresScreen />
        )}
      </Tab.Screen>
      <Tab.Screen name="zalihe"
        options={{
          title: t("tab_inventory"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="shippingbox" color={color} />
          ),
        }}
      >
        {() => (
          <ZaliheScreen />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="messaging"
        options={{
          title: t("messages"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="message.fill" color={color} />
          ), 
        }}
      >
        {() => (
          <ChatListScreen />
        )}
      </Tab.Screen>
      <Tab.Screen name="loyalty"
        options={{
          title: t("loyalty"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="wallet.fill" color={color} />
          ),
        }}
      >
        {() => (
          <LoyaltyScreen />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
