import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation(); 

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4E8D7C',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('tab_home'), 
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="pregled_prodavnica"
        options={{
          title: t('tab_stores'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="storefront" color={color} />,
        }}
      />
    </Tabs>
  );
}
