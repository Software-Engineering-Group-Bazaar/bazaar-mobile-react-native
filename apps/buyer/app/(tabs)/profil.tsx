import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from "react-native";
import * as SecureStore from 'expo-secure-store'; // Importaj SecureStore
import { useRouter } from 'expo-router'; // Importaj useRouter iz expo-router
// Pretpostavka: Koristiš neku i18n biblioteku. Ako ne, zamijeni 'useTranslation' odgovarajućim načinom dohvaćanja t funkcije.
import { useTranslation } from 'react-i18next'; // Primjer: react-i18next
import {} from '../screens/orders/index'; // Importaj sve potrebne tipove i funkcije iz orders/index
import { Ionicons } from '@expo/vector-icons';

export default function Profil() {
  const router = useRouter(); // Dohvati router objekt
  const { t } = useTranslation(); // Dohvati t funkciju za prijevode

  // Funkcija koja se poziva pritiskom na tipku
  const handleLogout = async () => {
    try {
      // 1. Izbriši token iz SecureStore
      await SecureStore.deleteItemAsync('auth_token');

      // 2. Pokaži alert poruku (koristeći prijevode)
      // Osiguraj da imaš 'logout_title' i 'logout_message' definirane u svojim prijevodima
      Alert.alert(t('logout_title'), t('logout_message'));

      // 3. Preusmjeri korisnika na login ekran
      // replace sprječava povratak na Profil ekran pritiskom na back tipku
      router.replace('/(auth)/login');

    } catch (error) {
      console.error("Greška prilikom odjave:", error);
      // Opcionalno: Pokaži korisniku poruku o grešci
      Alert.alert(t('error'), t('logout_failed_message')); // Pretpostavka za ključeve prijevoda greške
    }
  };

  return (
  <SafeAreaView style={styles.container}>
    {/* Header with avatar, title & subtitle */}
    <View style={styles.header}>
      <View style={styles.avatarPlaceholder}>
        <Ionicons name="person-circle-outline" size={80} color="#ccc" />
      </View>
      <Text style={styles.title}>{t('profile_title')}</Text>
      <Text style={styles.subtitle}>{t('profile_subtitle')}</Text>
    </View>

    {/* Action buttons */}
    <View style={styles.actions}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push('../screens/orders')}
      >
        <Ionicons name="receipt-outline" size={24} color="#4e8d7c" />
        <Text style={styles.actionText}>{t('my_orders')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push('../screens/addresses')}
      >
        <Ionicons name="map-outline" size={24} color="#4e8d7c" />
        <Text style={styles.actionText}>
          {t('my_addresses')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push('../screens/myTickets')}
      >
        <Ionicons name="warning-outline" size={24} color="#4e8d7c" />
        <Text style={styles.actionText}>
          {t('my_tickets')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={24} color="#fff" />
        <Text style={[styles.actionText, styles.logoutText]}>
          {t('logout_button')}
        </Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  actions: {
    width: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionText: {
    marginLeft: 12,
    fontSize: 18,
    color: '#4e8d7c',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#4e8d7c',
  },
  logoutText: {
    color: '#fff',
  },
});