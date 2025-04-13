import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { t } from 'i18next';

const CustomHeader = () => {
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname.startsWith('/stores/products')) return t('store-products');
    if (pathname.startsWith('/stores')) return t('stores');
    if (pathname.startsWith('/search')) return t('search');
    if (pathname.startsWith('/home')) return t('home');
    if (pathname.startsWith('/profil')) return t('profile');
    return 'Bazaar';
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{getTitle()}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#4e8d7c',
  },
  headerContainer: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4e8d7c',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
  headerText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default CustomHeader;
