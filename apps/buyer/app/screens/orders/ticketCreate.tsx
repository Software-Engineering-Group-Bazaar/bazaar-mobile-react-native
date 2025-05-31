// app/createTicketScreen.tsx
import React, { useState, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    Button,
    Alert,
    ScrollView, // Dobro za duže forme ili manje ekrane
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Dimensions,
    TouchableOpacity,
    SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { t } from 'i18next'; // Ako koristite i18next za prevod
// Pretpostavka: importujte baseURL i USE_DUMMY_DATA ako ih koristite za slanje podataka
import { baseURL, USE_DUMMY_DATA } from 'proba-package';
import * as SecureStore from 'expo-secure-store';
import Tooltip from 'react-native-walkthrough-tooltip';
import {Ionicons} from '@expo/vector-icons'

interface TicketFormData {
    title: string;
    description: string;
    orderId: number;
}

export default function CreateTicketScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();

    const [showWalkthrough, setShowWalkthrough] = useState(false);
    const [walkthroughStep, setWalkthroughStep] = useState(0);

    const titleInputRef = useRef(null);
    const descriptionInputRef = useRef(null);
    const submitButtonRef = useRef(null);

    const startWalkthrough = () => {
        setShowWalkthrough(true);
        setWalkthroughStep(1); // Počinjemo od prvog koraka (naslov tiketa)
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

    // Dobijanje orderId iz parametara rute
    // Proverite da li params.orderId postoji i da je validan broj
    const orderIdParam = params.orderId ? parseInt(params.orderId as string, 10) : USE_DUMMY_DATA ? 0 : null; // vratiti 0 u null

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Ako orderId nije prosleđen ili nije validan, možete prikazati grešku ili se vratiti
    if (orderIdParam === null || isNaN(orderIdParam)) {
        // Možete odlučiti šta da radite ovde.
        // Na primer, vratiti se nazad ili prikazati poruku.
        // Za sada, prikazaćemo poruku i onemogućiti formu.
        // Idealno bi bilo da se ovo hendluje pre navigacije na ovaj ekran.
        React.useEffect(() => {
            Alert.alert(
                t('error') || 'Error',
                t('missing_order_id') || 'Order ID is missing or invalid. Cannot create ticket.'
            );
            // Možda želite da se automatski vratite:
            if (router.canGoBack()) router.back();
        }, [router]);

        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                    {t('missing_order_id_message') || 'Order ID is required to create a ticket.'}
                </Text>
            </View>
        );
    }

    const handleSubmit = async () => {
        if (!title.trim()) {
            Alert.alert(t('validation_error') || 'Validation Error', t('title_required') || 'Title is required.');
            return;
        }
        if (!description.trim()) {
            Alert.alert(t('validation_error') || 'Validation Error', t('description_required') || 'Description is required.');
            return;
        }

        const ticketData: TicketFormData = {
            title,
            description,
            orderId: orderIdParam, // Koristimo validirani orderIdParam
        };

        setIsLoading(true);
        console.log('Submitting ticket:', ticketData);

        // TODO: Zamenite sa stvarnom logikom slanja (API poziv)
        // Primer sa USE_DUMMY_DATA
        if (USE_DUMMY_DATA) {
            setTimeout(() => {
                setIsLoading(false);
                Alert.alert(t('success') || 'Success', t('ticket_created_successfully') || 'Ticket created successfully!');
                router.back(); // Vratite se na prethodni ekran
            }, 1500);
            return;
        }

        try {
            const authToken = await SecureStore.getItemAsync('auth_token');
            if (!authToken) {
                console.error("No login token");
                return;
            }
            // Primer API poziva (prilagodite vašem endpoint-u)
            const response = await fetch(`${baseURL}/api/Tickets/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify(ticketData),
            });

            const result = await response.json();

            if (!response.ok) {
              throw new Error(result.message || t('failed_to_create_ticket') || 'Failed to create ticket.');
            }

            // Simulacija uspešnog API poziva
            // await new Promise(resolve => setTimeout(resolve, 1500)); // Uklonite ovo za stvarni API

            setIsLoading(false);
            Alert.alert(t('success') || 'Success', t('ticket_created_successfully') || 'Ticket created successfully!');
            // Možete navigirati na neki drugi ekran ili se vratiti nazad
            if (router.canGoBack()) {
                router.back();
            } else {
                // Ako ne može nazad, možda na početni ekran ordera ili neki drugi default
                router.replace('./index'); // Prilagodite putanju
            }
        } catch (error: any) {
            setIsLoading(false);
            console.error('Error creating ticket:', error);
            Alert.alert(t('error') || 'Error', error.message || t('something_went_wrong') || 'Something went wrong.');
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
                {t('creating_ticket')}
              </Text>
            </View>
            
            {/* Desna strana - dugme za pomoć */}
            <View style={[styles.sideContainer, styles.rightSideContainer]}>
              <TouchableOpacity onPress={startWalkthrough} style={styles.iconButton}>
                <Ionicons name="help-circle-outline" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: 'white' }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // Podesite ako imate header
        >
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.headerTitle}>{t('create_new_ticket') || 'Create New Ticket'}</Text>
                <Text style={styles.orderIdText}>
                    {t('order_id_label') || 'Order ID'}: {orderIdParam}
                </Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t('title_label') || 'Title'}</Text>
                    {/* <-- TOOLTIP ZA NASLOV --> */}
            <Tooltip
                isVisible={showWalkthrough && walkthroughStep === 1}
                content={
                    <View style={styles.tooltipContent}>
                        <Text style={{ fontSize: 16, marginBottom: 10 }}>
                            {t('tutorial_ticket_title_input')}
                        </Text>
                        <View style={styles.tooltipButtonContainer}>
                            <TouchableOpacity
                                style={[styles.tooltipButtonBase, styles.tooltipNextButton]}
                                onPress={goToNextStep}
                            >
                                <Text style={styles.tooltipButtonText}>{t('next')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
                placement="bottom"
                onClose={finishWalkthrough}
                tooltipStyle={{ width: Dimensions.get('window').width * 0.8 }}
                useReactNativeModal={true}
                arrowSize={{ width: 16, height: 8 }}
                showChildInTooltip={true}
            >
                    <TextInput
                        ref={titleInputRef}
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder={t('enter_ticket_title') || 'Enter ticket title'}
                        placeholderTextColor="#999"
                        maxLength={100} // Opciono ograničenje
                    />
                    </Tooltip>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t('description_label') || 'Description'}</Text>
                    {/* <-- TOOLTIP ZA OPIS --> */}
            <Tooltip
                isVisible={showWalkthrough && walkthroughStep === 2}
                content={
                    <View style={styles.tooltipContent}>
                        <Text style={{ fontSize: 16, marginBottom: 10 }}>
                            {t('tutorial_ticket_description_input')}
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
                placement="top" // Prilagodi poziciju ako je tastatura aktivna
                onClose={finishWalkthrough}
                tooltipStyle={{ width: Dimensions.get('window').width * 0.8 }}
                useReactNativeModal={true}
                arrowSize={{ width: 16, height: 8 }}
                showChildInTooltip={true}
            >
                    <TextInput
                        ref={descriptionInputRef} 
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder={t('describe_your_issue') || 'Describe your issue or request'}
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={4} // Početni broj linija za multiline
                        textAlignVertical="top" // Za Android
                    />
                    </Tooltip>
                </View>

                {isLoading ? (
                    <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
                ) : (
                    // <-- TOOLTIP ZA DUGME -->
            <Tooltip
                isVisible={showWalkthrough && walkthroughStep === 3}
                content={
                    <View style={styles.tooltipContent}>
                        <Text style={{ fontSize: 16, marginBottom: 10 }}>
                            {t('tutorial_ticket_submit_button')}
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
                placement="bottom"
                onClose={finishWalkthrough}
                tooltipStyle={{ width: Dimensions.get('window').width * 0.8 }}
                useReactNativeModal={true}
                arrowSize={{ width: 16, height: 8 }}
                showChildInTooltip={true}
            >
                    <TouchableOpacity
                    ref={submitButtonRef} 
                    style={styles.submitTicketButton} 
                    onPress={handleSubmit}
                    disabled={isLoading} 
                    >
                    <Text style={styles.submitTicketButtonText}>{t('submit_ticket_button') || 'Submit Ticket'}</Text>
                     </TouchableOpacity>
                    </Tooltip>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

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
    submitTicketButton: {
        backgroundColor: '#4e8d7c',
        paddingVertical: 15,
        borderRadius: 8, // Manje zaobljeno od standardnog buttona
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 4,
        alignSelf: 'stretch'
    },
    submitTicketButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
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
  tooltipButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
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
        flexGrow: 1, // Omogućava da se ScrollView širi ako je sadržaj veći
        padding: 20,
        backgroundColor: 'white',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#333',
    },
    orderIdText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
        color: '#555',
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
        color: '#333',
        alignSelf:'stretch'
    },
    textArea: {
        minHeight: 100, // Minimalna visina za opis
        // textAlignVertical: 'top', // Već je u props TextInput-a, ali može i ovde
    },
    buttonContainer: {
        marginTop: 20,
    },
    loader: {
        marginTop: 20,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        textAlign: 'center',
    },
});