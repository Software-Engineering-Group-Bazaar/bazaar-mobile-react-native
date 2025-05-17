import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ConfirmResetScreen from '../../../app/(auth)/confirm_reset';

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'error') return 'Greška';
      if (key === 'enter_verification_code') return 'Unesite verifikacijski kod';
      if (key === 'invalid_verification_code') return 'Neispravan verifikacijski kod';
      if (key === 'something_went_wrong') return 'Došlo je do greške. Pokušajte ponovo.';
      if (key === 'enter_verification_code_title') return 'Unesite kod';
      if (key === 'verification_code_placeholder') return 'Kod';
      if (key === 'confirm_code_button') return 'Potvrdi kod';
      if (key === 'back') return 'Nazad';
      return key;
    },
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

beforeAll(() => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('confirm_reset', () => {
  it('ID 42 - Pokušaj potvrde bez unosa koda', async () => {
    const { getByText } = render(<ConfirmResetScreen />);
    fireEvent.press(getByText('Potvrdi kod'));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Greška', 'Unesite verifikacijski kod');
    });
  });

  it('ID 43 - Unos validnog koda', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'valid_token' }),
    });
    const { getByText, getByPlaceholderText } = render(<ConfirmResetScreen />);
    fireEvent.changeText(getByPlaceholderText('Kod'), '123456');
    fireEvent.press(getByText('Potvrdi kod'));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({ pathname: '/(auth)/new_password', params: { token: 'valid_token' } });
    });
  });

  it('ID 44 - Unos nevažećeg verifikacijskog koda', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Neispravan verifikacijski kod' }),
    });
    const { getByText, getByPlaceholderText } = render(<ConfirmResetScreen />);
    fireEvent.changeText(getByPlaceholderText('Kod'), '000000');
    fireEvent.press(getByText('Potvrdi kod'));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Greška', 'Neispravan verifikacijski kod');
    });
  });

  it('ID 45 - Pokušaj potvrde bez internetske konekcije', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));
    const { getByText, getByPlaceholderText } = render(<ConfirmResetScreen />);
    fireEvent.changeText(getByPlaceholderText('Kod'), '123456');
    fireEvent.press(getByText('Potvrdi kod'));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Greška', 'Došlo je do greške. Pokušajte ponovo.');
    });
  });
});