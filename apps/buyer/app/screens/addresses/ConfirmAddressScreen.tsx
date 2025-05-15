// ConfirmAddressScreen.tsx
import React, { useState } from 'react';
import {
  StyleSheet, View, TextInput, Button, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSearchParams } from 'expo-router/build/hooks';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { use } from 'i18next';

type RouteParams = {
  address: string;
  lat: number;
  lng: number;
};

type Props = NativeStackScreenProps<{ Confirm: RouteParams }, 'Confirm'>;

export default function ConfirmAddressScreen({ route, navigation }: Props) {
  const params = useSearchParams();
  const address = params.get('address') as string;
    const lat = parseFloat(params.get('lat') as string);
    const lng = parseFloat(params.get('lng') as string);
    const router = useRouter();
  const [formAddress, setFormAddress] = useState(address);
  console.log(address, lat, lng);

  const onSubmit = () => {
    // Here you can post `formAddress`, `lat`, `lng` to your backend
    Alert.alert('Address Submitted', `${formAddress}\n(${lat}, ${lng})`);
    navigation.popToTop();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <View style={styles.field}>
        <TextInput
          value={formAddress}
          onChangeText={setFormAddress}
          multiline
          style={styles.input}
        />
      </View>
      <View style={styles.submit}>
        <Button title="Submit" onPress={onSubmit} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'space-between' },
  field: { flex: 1 },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 12,
    borderRadius: 4,
    textAlignVertical: 'top',
  },
  submit: { marginBottom: 20 },
});
