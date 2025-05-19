// app/createTicketScreen.tsx
import React, { useState } from 'react';
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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { t } from 'i18next'; // Ako koristite i18next za prevod
// Pretpostavka: importujte baseURL i USE_DUMMY_DATA ako ih koristite za slanje podataka
import { baseURL, USE_DUMMY_DATA } from 'proba-package';
import * as SecureStore from 'expo-secure-store';

interface TicketFormData {
    title: string;
    description: string;
    orderId: number;
}

export default function CreateTicketScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();

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
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder={t('enter_ticket_title') || 'Enter ticket title'}
                        placeholderTextColor="#999"
                        maxLength={100} // Opciono ograničenje
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t('description_label') || 'Description'}</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder={t('describe_your_issue') || 'Describe your issue or request'}
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={4} // Početni broj linija za multiline
                        textAlignVertical="top" // Za Android
                    />
                </View>

                {isLoading ? (
                    <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
                ) : (
                    <View style={styles.buttonContainer}>
                        <Button title={t('submit_ticket_button') || 'Submit Ticket'} onPress={handleSubmit} color="#4e8d7c" />
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
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