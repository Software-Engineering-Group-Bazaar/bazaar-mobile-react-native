import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FontAwesome } from '@expo/vector-icons';
import CustomHeader from 'proba-package/custom-header/index'; 
import { t } from 'i18next';

export default function TabLayout() {
  const colorScheme = useColorScheme();

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
      header: () => <CustomHeader />
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
