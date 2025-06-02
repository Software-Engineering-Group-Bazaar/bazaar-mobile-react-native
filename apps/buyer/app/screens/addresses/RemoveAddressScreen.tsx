// RemoveAddressScreen.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Button,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { t } from 'i18next';
import { Icon } from 'react-native-vector-icons/Icon';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import Tooltip from 'react-native-walkthrough-tooltip';

import Constants from 'expo-constants';

const baseURL = Constants.expoConfig!.extra!.apiBaseUrl as string;
const USE_DUMMY_DATA = Constants.expoConfig!.extra!.useDummyData as boolean;


export default function RemoveAddressScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;              // ID of address to delete
  const address = params.address as string;
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [showWalkthrough, setShowWalkthrough] = useState(false);
      
          // Funkcija za pokretanje walkthrough-a
          const startWalkthrough = () => {
              setShowWalkthrough(true);
          };
      
          // Funkcija za završetak walkthrough-a
          const finishWalkthrough = () => {
              setShowWalkthrough(false);
          };

  const onRemove = async () => {
    setLoading(true);

    if (USE_DUMMY_DATA) {
      // simulate network delay
      setTimeout(() => {
        Alert.alert(t('remove_success'), t('address_removed_dummy'));
        router.back();
      }, 1500);
      return;
    }

    try {
      const authToken = await SecureStore.getItemAsync('auth_token');
      if (!authToken) {
        console.error("No login token");
        return;
      }
      const res = await fetch(
        `${baseURL}/api/user-profile/address/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            // add auth token header if needed
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || t('remove_failed'));
      }
      Alert.alert(t('remove_success'), t('address_removed'));
      router.back();
    } catch (err: any) {
      console.error('Error deleting address:', err);
      Alert.alert(t('error'), err.message || t('remove_failed'));
    } finally {
      setLoading(false);
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
                {t('remove_address')}
              </Text>
            </View>
            
            {/* Desna strana - dugme za pomoć */}
            <View style={[styles.sideContainer, styles.rightSideContainer]}>
              <TouchableOpacity onPress={startWalkthrough} style={styles.iconButton}>
                <Ionicons name="help-circle-outline" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          <Tooltip
                                    isVisible={showWalkthrough}
                                    content={
                                      <View style={styles.tooltipContent}>
                                        <Text style={{ fontSize: 16, marginBottom: 10 }}>
                                          {t('tutorial_remove_address_screen')}
                                        </Text>
                                        <View style={styles.tooltipButtonContainer}>
                                          <TouchableOpacity
                                            style={[styles.tooltipButtonBase, styles.tooltipFinishButton]}
                                            onPress={finishWalkthrough}
                                          >
                                            <Text style={styles.tooltipButtonText}>{t('finish')}</Text>
                                          </TouchableOpacity>
                                        </View>
                                      </View>
                                    }
                                    placement="center" // Ili "bottom"
                                    onClose={finishWalkthrough}
                                    tooltipStyle={{ width: Dimensions.get('window').width * 0.8 }}
                                    useReactNativeModal={true}
                                    arrowSize={{ width: 16, height: 8 }}
                                    showChildInTooltip={true}
                                  ></Tooltip>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <View style={styles.content}>
        <Text style={styles.label}>{t('confirm_remove_address')}</Text>
        <Text style={styles.addressText}>{address}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={styles.loading} />
      ) : (
        <View style={styles.actions}>
          <Button title={t('remove')} onPress={onRemove} color="darkred" />
          <View style={styles.spacer} />
          <Button title={t('cancel')} onPress={() => router.back()} color="gray" />
        </View>
      )}
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
   tooltipButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginTop: 10,
    },
     tooltipContent: {
          alignItems: 'center',
          padding: 10, 
          backgroundColor: 'white',
          borderRadius: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
      },
      tooltipButtonBase: {
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 25,
          marginHorizontal: 5,
          elevation: 2,
          minWidth: 80,
          alignItems: 'center',
      },
      tooltipButtonText: {
          color: '#fff',
          fontSize: 14,
          fontWeight: 'bold',
      },
      tooltipFinishButton: {
          backgroundColor: '#4E8D7C', // Zelena boja
          paddingVertical: 8,
          paddingHorizontal: 20,
          borderRadius: 20,
          marginHorizontal: 5,
      },
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
  container: { flex: 1, padding: 16, justifyContent: 'space-between', backgroundColor: 'white' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  addressText: { fontSize: 16, textAlign: 'center' },
  actions: { marginBottom: 20, flexDirection: 'row', justifyContent: 'center' },
  spacer: { width: 16 },
  loading: { marginBottom: 20 },
});