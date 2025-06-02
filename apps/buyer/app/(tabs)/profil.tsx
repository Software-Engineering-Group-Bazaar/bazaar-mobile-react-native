import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, Dimensions, Platform } from "react-native";
import * as SecureStore from 'expo-secure-store'; // Importaj SecureStore
import { useRouter } from 'expo-router'; // Importaj useRouter iz expo-router
// Pretpostavka: Koristiš neku i18n biblioteku. Ako ne, zamijeni 'useTranslation' odgovarajućim načinom dohvaćanja t funkcije.
import { useTranslation } from 'react-i18next'; // Primjer: react-i18next
import {} from '../screens/orders/index'; // Importaj sve potrebne tipove i funkcije iz orders/index
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef } from 'react';
import Tooltip from 'react-native-walkthrough-tooltip'; // Import Tooltip

export default function Profil() {
  const router = useRouter(); // Dohvati router objekt
  const { t } = useTranslation(); // Dohvati t funkciju za prijevode

  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(0);

  const myOrdersRef = useRef(null);
  const myPointsRef = useRef(null);
  const myAddressesRef = useRef(null);
  const myTicketsRef = useRef(null);
  const logoutRef = useRef(null);

  const startWalkthrough = () => {
    setShowWalkthrough(true);
    setWalkthroughStep(1); 
  };

  const goToNextStep = () => {
    setWalkthroughStep(prevStep => prevStep + 1);
  };

  const goToPreviousStep = () => {
    setWalkthroughStep(prevStep => prevStep - 1);
  };

  const finishWalkthrough = () => {
    setShowWalkthrough(false);
    setWalkthroughStep(0);
  };

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
    <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.headerContainer}>
            {/* Lijeva strana - prazna ili za back dugme */}
            <View style={styles.sideContainer} /> 
            
            {/* Naslov headera */}
            <View style={styles.titleContainer}>
              <Text style={styles.headerText} numberOfLines={1} ellipsizeMode="tail">
                {t('profile')}
              </Text>
            </View>
            
            {/* Desna strana - dugme za pomoć */}
            <View style={[styles.sideContainer, styles.rightSideContainer]}>
              <TouchableOpacity onPress={startWalkthrough} style={styles.iconButton}>
                <Ionicons name="help-circle-outline" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
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
      {/*tooltip for my order */}
      <Tooltip
        isVisible={showWalkthrough && walkthroughStep === 1}
        content={
          <View style={styles.tooltipContent}>
            <Text style={{ fontSize: 16, marginBottom: 10 }}>
              {t('tutorial_my_orders')} {/* Add this translation key */}
            </Text>
            <View style={styles.tooltipButtonContainer}>
              {/* No previous button for the first step */}
              <TouchableOpacity
                style={styles.tooltipNextButton}
                onPress={goToNextStep}
              >
                <Text style={styles.tooltipButtonText}>{t('next')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        placement="top" // Adjust placement as needed
        onClose={finishWalkthrough}
        tooltipStyle={{ width: Dimensions.get('window').width * 0.8 }}
        useReactNativeModal={true}
        arrowSize={{ width: 16, height: 8 }}
        showChildInTooltip={true}
      >
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push('../screens/orders')}
        ref={myOrdersRef}
      >
        <Ionicons name="receipt-outline" size={24} color="#4e8d7c" />
        <Text style={styles.actionText}>{t('my_orders')}</Text>
      </TouchableOpacity>
      </Tooltip>

      {/*tooltip for points */}
      <Tooltip
        isVisible={showWalkthrough && walkthroughStep === 2}
        content={
          <View style={styles.tooltipContent}>
            <Text style={{ fontSize: 16, marginBottom: 10 }}>
              {t('tutorial_my_points')} {/* Add this translation key */}
            </Text>
            <View style={styles.tooltipButtonContainer}>
              <TouchableOpacity
                style={[styles.tooltipButtonBase, styles.tooltipPrevButton]}
                onPress={goToPreviousStep}
              >
                <Text style={styles.tooltipButtonText}>{t('previous')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tooltipButtonBase, styles.tooltipNextButton]}
                onPress={goToNextStep}
              >
                <Text style={styles.tooltipButtonText}>{t('next')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        placement="top"
        onClose={finishWalkthrough}
        tooltipStyle={{ width: Dimensions.get('window').width * 0.8 }}
        useReactNativeModal={true}
        arrowSize={{ width: 16, height: 8 }}
        showChildInTooltip={true}
      >
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push('../screens/points')}
        ref={myPointsRef}
      >
        <Ionicons name="wallet-outline" size={24} color="#4e8d7c" />
        <Text style={styles.actionText}>{t('my_points')}</Text>
      </TouchableOpacity>
      </Tooltip>

      {/*tooltip for adresses */}
      <Tooltip
        isVisible={showWalkthrough && walkthroughStep === 3}
        content={
          <View style={styles.tooltipContent}>
            <Text style={{ fontSize: 16, marginBottom: 10 }}>
              {t('tutorial_my_addresses')} {/* Add this translation key */}
            </Text>
            <View style={styles.tooltipButtonContainer}>
              <TouchableOpacity
                style={[styles.tooltipButtonBase, styles.tooltipPrevButton]}
                onPress={goToPreviousStep}
              >
                <Text style={styles.tooltipButtonText}>{t('previous')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tooltipButtonBase, styles.tooltipNextButton]}
                onPress={goToNextStep}
              >
                <Text style={styles.tooltipButtonText}>{t('next')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        placement="top"
        onClose={finishWalkthrough}
        tooltipStyle={{ width: Dimensions.get('window').width * 0.8 }}
        useReactNativeModal={true}
        arrowSize={{ width: 16, height: 8 }}
        showChildInTooltip={true}
      >
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push('../screens/addresses')}
        ref={myAddressesRef}
      >
        <Ionicons name="map-outline" size={24} color="#4e8d7c" />
        <Text style={styles.actionText}>
          {t('my_addresses')}
        </Text>
      </TouchableOpacity>
      </Tooltip>

      {/*tooltip for tickets */}
      <Tooltip
        isVisible={showWalkthrough && walkthroughStep === 4}
        content={
          <View style={styles.tooltipContent}>
            <Text style={{ fontSize: 16, marginBottom: 10 }}>
              {t('tutorial_my_tickets')} {/* Add this translation key */}
            </Text>
            <View style={styles.tooltipButtonContainer}>
              <TouchableOpacity
                style={[styles.tooltipButtonBase, styles.tooltipPrevButton]}
                onPress={goToPreviousStep}
              >
                <Text style={styles.tooltipButtonText}>{t('previous')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tooltipButtonBase, styles.tooltipNextButton]}
                onPress={goToNextStep}
              >
                <Text style={styles.tooltipButtonText}>{t('next')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        placement="top"
        onClose={finishWalkthrough}
        tooltipStyle={{ width: Dimensions.get('window').width * 0.8 }}
        useReactNativeModal={true}
        arrowSize={{ width: 16, height: 8 }}
        showChildInTooltip={true}
      >
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push('../screens/myTickets')}
        ref={myTicketsRef}
      >
        <Ionicons name="warning-outline" size={24} color="#4e8d7c" />
        <Text style={styles.actionText}>
          {t('my_tickets')}
        </Text>
      </TouchableOpacity>
      </Tooltip>

      {/*tooltip for logging out */}
       <Tooltip
        isVisible={showWalkthrough && walkthroughStep === 5}
        content={
          <View style={styles.tooltipContent}>
            <Text style={{ fontSize: 16, marginBottom: 10 }}>
              {t('tutorial_logout_button')} {/* Add this translation key */}
            </Text>
            <View style={styles.tooltipButtonContainer}>
              <TouchableOpacity
                style={[styles.tooltipButtonBase, styles.tooltipPrevButton]}
                onPress={goToPreviousStep}
              >
                <Text style={styles.tooltipButtonText}>{t('previous')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tooltipButtonBase, styles.tooltipFinishButton]}
                onPress={finishWalkthrough}
              >
                <Text style={styles.tooltipButtonText}>{t('finish')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        placement="top" // Adjusted placement as it's the last button
        onClose={finishWalkthrough}
        tooltipStyle={{ width: Dimensions.get('window').width * 0.8 }}
        useReactNativeModal={true}
        arrowSize={{ width: 16, height: 8 }}
        showChildInTooltip={true}
      >
      <TouchableOpacity
        style={[styles.actionButton, styles.logoutButton]}
        onPress={handleLogout}
        ref={logoutRef}
      >
        <Ionicons name="log-out-outline" size={24} color="#fff" />
        <Text style={[styles.actionText, styles.logoutText]}>
          {t('logout_button')}
        </Text>
      </TouchableOpacity>
      </Tooltip>

    </View>
  </SafeAreaView>
  </SafeAreaView>
);
};

const styles = StyleSheet.create({
  safeArea: {
      backgroundColor: '#4e8d7c',
      flex: 1, // Omogućava da SafeAreaView zauzme cijeli ekran
      marginTop:30
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#4e8d7c',
      paddingVertical: Platform.OS === 'ios' ? 12 : 18, // Prilagođeno za iOS/Android
      paddingHorizontal: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 4,
    },
    sideContainer: {
      width: 40, // Održava razmak na lijevoj strani za potencijalno dugme nazad
      justifyContent: 'center',
    },
    rightSideContainer: {
      alignItems: 'flex-end', // Poravnava dugme za pomoć desno
    },
    titleContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 5,
    },
    headerText: {
      color: '#fff',
      fontSize: 22,
      fontWeight: 'bold',
      letterSpacing: 1,
      textAlign: 'center',
    },
    iconButton: {
      padding: 5, // Dodao padding za lakši klik
    },
  tooltipButtonBase: { 
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25, // Više zaobljeno
        marginHorizontal: 5,
        elevation: 2, // Mala sjena
        minWidth: 80, // Minimalna širina
        alignItems: 'center', // Centriraj tekst
    },
  tooltipButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tooltipContent: {
    alignItems: 'center',
    padding: 5,
  },
  tooltipButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  tooltipNextButton: {
    backgroundColor: '#4E8D7C',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  tooltipPrevButton: {
    backgroundColor: '#4E8D7C', 
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  tooltipFinishButton: {
    backgroundColor: '#4E8D7C',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  fab: {
    position: 'absolute',
    top: 20,
    right: 30,
    backgroundColor: '#4E8D7C',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
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
    alignSelf:'stretch'
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