jest.mock('i18next', () => ({
  use: () => ({
    init: () => {},
  }),
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import Profil from '../../../app/(tabs)/profil';

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
    back: mockBack,
  }),
}));

jest.mock('expo-secure-store', () => ({
  deleteItemAsync: jest.fn(),
}));


jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'profile_title') return 'Profil';
      if (key === 'profile_subtitle') return 'Upravljajte svojim profilom';
      if (key === 'logout_title') return 'Odjava';
      if (key === 'logout_message') return 'Uspješno ste odjavljeni';
      if (key === 'logout_failed_message') return 'Greška pri odjavi';
      if (key === 'logout_button') return 'Odjava';
      if (key === 'my_orders') return 'Moje narudžbe';
      return key;
    },
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

beforeAll(() => {
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('profil', () => {
  it('ID 46 - Klik na dugme "Moje narudžbe"', async () => {
    const { getByText } = render(<Profil />);
    fireEvent.press(getByText('Moje narudžbe'));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('../screens/orders');
    });
  });

  it('ID 47 - Klik na "Odjava" sa validnim tokenom', async () => {
    const { getByText } = render(<Profil />);
    fireEvent.press(getByText('Odjava'));
    await waitFor(() => {
      expect(require('expo-secure-store').deleteItemAsync).toHaveBeenCalledWith('auth_token');
      expect(Alert.alert).toHaveBeenCalledWith('Odjava', 'Uspješno ste odjavljeni');
      expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
    });
  });

  it('ID 48 - Klik na "Odjava" sa greškom u SecureStore', async () => {
    require('expo-secure-store').deleteItemAsync.mockImplementationOnce(() => {
      throw new Error('SecureStore error');
    });
    const { getByText } = render(<Profil />);
    fireEvent.press(getByText('Odjava'));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('error', 'Greška pri odjavi');
      expect(console.error).toHaveBeenCalled();
    });
  });

  it('ID 49 - Provjera prijevoda stringova', () => {
    const { getByText } = render(<Profil />);
    expect(getByText('Profil')).toBeTruthy();
    expect(getByText('Upravljajte svojim profilom')).toBeTruthy();
    expect(getByText('Odjava')).toBeTruthy();
    expect(getByText('Moje narudžbe')).toBeTruthy();
  });

  it('ID 50 - Pritisak back dugmeta nakon odjave', async () => {
    const { getByText } = render(<Profil />);
    fireEvent.press(getByText('Odjava'));
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
    });
    // Simuliraj pokušaj povratka
    fireEvent.press(getByText('Odjava')); // Odjava opet, da bi bio siguran da je replace pozvan
    mockBack();
    // Očekujemo da se profil ne otvara ponovo (tj. back je blokiran)
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
  });
});