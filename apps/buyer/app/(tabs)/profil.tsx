import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import * as SecureStore from 'expo-secure-store'; // Importaj SecureStore
import { useRouter } from 'expo-router'; // Importaj useRouter iz expo-router
// Pretpostavka: Koristiš neku i18n biblioteku. Ako ne, zamijeni 'useTranslation' odgovarajućim načinom dohvaćanja t funkcije.
import { useTranslation } from 'react-i18next'; // Primjer: react-i18next
import {} from '../screens/orders/index'; // Importaj sve potrebne tipove i funkcije iz orders/index

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
    <View style={styles.container}>
      <View style={styles.titleContainer}>
         <Text style={styles.title}>{t('profile_title')}</Text>
         <Text style={styles.subtitle}>{t('profile_subtitle')}</Text>
      </View>
      {/* Dugme za "Moje narudžbe" */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('../screens/orders')}
      >
        <Text style={styles.buttonText}>
          {t('my_orders', 'Moje narudžbe')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('../screens/addresses')}
      >
        <Text style={styles.buttonText}>
          {t('my_addresses')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} >
        <Text style={styles.buttonText}>{t('logout_button')}</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // Centriraj sadržaj vertikalno
    alignItems: "center",     // Centriraj sadržaj horizontalno
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 40, // Povećan razmak ispod naslova
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10, // Smanjen razmak ispod glavnog naslova
  },
  subtitle: {
    fontSize: 18,
    color: "#64748b",
    textAlign: 'center', // Centriraj podnaslov ako je duži
  },
  // Možeš koristiti postojeći 'button' stil ili definirati novi za logout
  logoutButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#4e8d7c", // Crvena boja često se koristi za destruktivne akcije poput odjave
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 20, // Dodaj malo razmaka iznad tipke
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
  // Koristi isti stil za gumb “Moje narudžbe”
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#4E8D7C",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 10,
  },
  // Ostali tvoji stilovi...
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: "#f7f7f7",
  },
  logo: {
    width: 420,
    height: 160,
    borderRadius: 80,
    marginBottom: 20,
  },
  text: {
    fontSize: 14,
    color: "#333",
    marginBottom: 15,
  },
  link: {
    color: "#4E8D7C",
    fontWeight: "bold",
  },
  or: {
    fontSize: 16,
    color: "#999",
    marginVertical: 10,
  },
  socialButton: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  socialButtonText: {
    fontSize: 16,
    marginLeft: 10,
  },
  languageButtonContainer: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  languageButton: {
    position: "absolute",
    top: "5%",
    right: "5%",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f1f5f9",
    zIndex: 100,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  languageText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#4E8D7C",
    marginTop: 2,
  },
});
