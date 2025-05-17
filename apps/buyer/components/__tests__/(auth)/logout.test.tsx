jest.mock('i18next', () => ({
  use: () => ({
    init: () => {},
  }),
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import axios from 'axios';

import YourScreen from "../../../app/(tabs)/profil"; 

// Definiši ih van mocka da budu isti reference
const mockReplace = jest.fn();
const mockPush = jest.fn();

// MOCK
jest.mock('expo-router', () => ({
  router: {
    replace: mockReplace,
    push: mockPush,
  },
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
}));


jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('axios');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: any) => {
      if (key === 'logout_title') return 'Odjava';
      if (key === 'logout_message') return 'Uspješno ste odjavljeni';
      if (key === 'logout_failed') return 'Greška pri odjavi';
      if (key === 'something_went_wrong') return 'Došlo je do greške. Pokušajte ponovo.';
      if (key === 'error') return 'Greška';
      if (key === 'logout') return 'logout';
      return key;
    },
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

beforeAll(() => {
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('logout', () => {
  it('ID 27 - Logout sa važećim tokenom', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('valid_token');
    (axios.post as jest.Mock).mockResolvedValue({ status: 200 });

    const { getByText } = render(<YourScreen />);
    fireEvent.press(getByText('logout_button'));

    await waitFor(() => {
    expect(Alert.alert).toHaveBeenCalledWith('Odjava', 'Uspješno ste odjavljeni');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
    });
  });

    it('ID 28 - Logout bez pronađenog tokena u SecureStore', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

        const { getByText } = render(<YourScreen />);
        fireEvent.press(getByText('logout_button'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Odjava', 'Uspješno ste odjavljeni');
            expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
            expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
        });
    });

    it('ID 29 - Logout kada backend vrati grešku', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('valid_token');
        (axios.post as jest.Mock).mockResolvedValue({ status: 400 });

        const { getByText } = render(<YourScreen />);
        fireEvent.press(getByText('logout_button'));

        await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
        });

    });

    it('ID 30 - Logout: greška prilikom komunikacije sa serverom', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('valid_token');
        (axios.post as jest.Mock).mockRejectedValue(new Error('error'));

        const { getByText } = render(<YourScreen />);
        fireEvent.press(getByText('logout_button'));

        await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
        });

    });
});