import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ForgotPasswordScreen from '../../../app/(auth)/forgot_password';
import { Alert } from 'react-native';

let mockReplace = jest.fn();
let mockPush = jest.fn();

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


jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        enter_email: 'Unesite email',
        password_reset_email_sent: 'Poslat ćemo Vam email sa kodom za reset',
        reset_password_failed: 'Resetovanje lozinke nije uspjelo',
        something_went_wrong: 'Došlo je do greške. Pokušajte ponovo.',
        error: 'Greška',
        success: 'Uspjeh',
        reset_password: 'Resetuj lozinku',
      };
      return translations[key] || key;
    },
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  global.fetch = jest.fn();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('forgot_password', () => {
  it('ID 31 - Pokušaj resetovanja bez unosa emaila', async () => {
    const { getByText } = render(<ForgotPasswordScreen />);
    fireEvent.press(getByText('Resetuj lozinku'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Greška', 'Unesite email');
    });
  });

  it('ID 32 - Reset sa validnim emailom', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    const { getByText, getByPlaceholderText } = render(<ForgotPasswordScreen />);
    fireEvent.changeText(getByPlaceholderText('email_placeholder'), 'test@example.com');
    fireEvent.press(getByText('Resetuj lozinku'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Uspjeh', 'Poslat ćemo Vam email sa kodom za reset');
      expect(mockPush).toHaveBeenCalledWith('/(auth)/new_password');
    });
  });

  it('ID 33 - Reset sa nepostojećim emailom', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Resetovanje lozinke nije uspjelo' }),
    });

    const { getByText, getByPlaceholderText } = render(<ForgotPasswordScreen />);
    fireEvent.changeText(getByPlaceholderText('email_placeholder'), 'nonexistent@example.com');
    fireEvent.press(getByText('Resetuj lozinku'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Greška', 'Resetovanje lozinke nije uspjelo');
    });
  });

  it('ID 34 - Reset uz gubitak interneta', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { getByText, getByPlaceholderText } = render(<ForgotPasswordScreen />);
    fireEvent.changeText(getByPlaceholderText('email_placeholder'), 'test@example.com');
    fireEvent.press(getByText('Resetuj lozinku'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Greška', 'Došlo je do greške. Pokušajte ponovo.');
    });
  });
});