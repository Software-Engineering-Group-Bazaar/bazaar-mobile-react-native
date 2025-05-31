// ConfirmAddressScreen.tsx
import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, Button,
  Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, TouchableOpacity,
  SafeAreaView, Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { t } from 'i18next';
import { baseURL, USE_DUMMY_DATA } from 'proba-package';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import Tooltip from 'react-native-walkthrough-tooltip';

export default function ConfirmAddressScreen() {
  const params = useLocalSearchParams();
  const addressParam = params.address as string;   // coming in from router.push
  const lat = parseFloat(params.lat as string);
  const lng = parseFloat(params.lng as string);
  const router = useRouter();

  const [showWalkthrough, setShowWalkthrough] = useState(false);
    
        // Funkcija za pokretanje walkthrough-a
        const startWalkthrough = () => {
            setShowWalkthrough(true);
        };
    
        // Funkcija za završetak walkthrough-a
        const finishWalkthrough = () => {
            setShowWalkthrough(false);
        };

  const [formAddress, setFormAddress] = useState(addressParam);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!formAddress.trim()) {
      Alert.alert('Validation error', 'Address cannot be empty.');
      return;
    }

    setLoading(true);
    if (USE_DUMMY_DATA) {
        // Simulate a network request
        setTimeout(() => {
          Alert.alert('Success', 'Your address has been saved.');
          console.log('Dummy data: Address saved:', formAddress);
          router.back();
        }, 2000);
        return;
    }
    try {
      const authToken = await SecureStore.getItemAsync('auth_token');
      if (!authToken) {
        console.error("No login token");
        return;
      }
      const res = await fetch(
        baseURL + '/api/user-profile/address',  // ← your real endpoint
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // add auth token if needed:
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            address: formAddress,
            latitude: lat,
            longitude: lng,
          }),
        }
      );
      const json = await res.json();

      if (!res.ok) {
        // API returned an error status
        throw new Error(json.message || 'Failed to save address');
      }

      Alert.alert('Success', 'Your address has been saved.');
      router.back();
    } catch (err: any) {
      console.error('Error submitting address:', err);
      Alert.alert('Error', err.message || 'Something went wrong.');
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
                {t('confirm_address')}
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
                                          {t('tutorial_confirm_address_screen')}
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
      <View style={styles.field}>
        <Text style={{ fontSize: 18, marginBottom: 8, fontWeight: 'bold', color: '#333' }}>
            {t('confirm_address')}
        </Text>
        <TextInput
          value={formAddress}
          onChangeText={setFormAddress}
          multiline
          style={styles.input}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={styles.loading} />
      ) : (
        <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]} // Dodat stil za onemogućeno dugme
            onPress={onSubmit}
            disabled={loading} // Onemogući dugme dok se učitava
          >
            <Text style={styles.submitButtonText}>
              {t('submit_address') || 'Submit Address'}
            </Text>
          </TouchableOpacity>
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
  field: { flex: 1 },
  input: {
    maxHeight: 80,
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 12,
    borderRadius: 4,
    textAlignVertical: 'top',
  },
  submit: { marginBottom: 20 },
  loading: { marginBottom: 20 },
  submitButton: {
    backgroundColor: '#4e8d7c',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 20 : 10,
    marginHorizontal: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#A9A9A9',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
