import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import NewPasswordScreen from '../../../app/(auth)/new_password';

const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
    back: mockBack,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'error') return 'Greška';
      if (key === 'success') return 'Uspjeh';
      if (key === 'enter_email') return 'Unesite email';
      if (key === 'enter_code') return 'Unesite kod';
      if (key === 'enter_new_password') return 'Unesite novu lozinku';
      if (key === 'passwords_do_not_match') return 'Lozinke se ne podudaraju';
      if (key === 'password_reset_successful') return 'Lozinka je uspješno resetovana';
      if (key === 'reset_password_failed') return 'Resetovanje lozinke nije uspjelo';
      if (key === 'something_went_wrong') return 'Došlo je do greške. Pokušajte ponovo.';
      if (key === 'set_new_password_title') return 'Nova lozinka';
      if (key === 'email_placeholder') return 'Email';
      if (key === 'code_placeholder') return 'Kod';
      if (key === 'new_password_placeholder') return 'Nova lozinka';
      if (key === 'confirm_new_password_placeholder') return 'Potvrdi lozinku';
      if (key === 'set_new_password_button') return 'Postavi novu lozinku';
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

describe('new_password', () => {
  it('ID 35 - Pokušaj bez unosa emaila', async () => {
    const { getByText } = render(<NewPasswordScreen />);
    fireEvent.press(getByText('Postavi novu lozinku'));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Greška', 'Unesite email');
    });
  });

  it('ID 36 - Pokušaj bez unosa koda', async () => {
    const { getByText, getByPlaceholderText } = render(<NewPasswordScreen />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.press(getByText('Postavi novu lozinku'));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Greška', 'Unesite kod');
    });
  });

  it('ID 37 - Pokušaj bez unosa lozinke i potvrde', async () => {
    const { getByText, getByPlaceholderText } = render(<NewPasswordScreen />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Kod'), '123456');
    fireEvent.press(getByText('Postavi novu lozinku'));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Greška', 'Unesite novu lozinku');
    });
  });

  it('ID 38 - Lozinke se ne poklapaju', async () => {
    const { getByText, getByPlaceholderText } = render(<NewPasswordScreen />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Kod'), '123456');
    fireEvent.changeText(getByPlaceholderText('Nova lozinka'), 'lozinka123');
    fireEvent.changeText(getByPlaceholderText('Potvrdi lozinku'), 'lozinka456');
    fireEvent.press(getByText('Postavi novu lozinku'));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Greška', 'Lozinke se ne podudaraju');
    });
  });

  it('ID 39 - Validan unos emaila, koda i lozinki', async () => {
   global.fetch = jest.fn().mockResolvedValueOnce({ ok: true });
    const { getByText, getByPlaceholderText } = render(<NewPasswordScreen />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Kod'), '123456');
    fireEvent.changeText(getByPlaceholderText('Nova lozinka'), 'lozinka123');
    fireEvent.changeText(getByPlaceholderText('Potvrdi lozinku'), 'lozinka123');
    fireEvent.press(getByText('Postavi novu lozinku'));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Uspjeh', 'Lozinka je uspješno resetovana');
      expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
    });
  });

  it('ID 40 - Backend vraća grešku', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Resetovanje lozinke nije uspjelo' }),
    });
    const { getByText, getByPlaceholderText } = render(<NewPasswordScreen />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Kod'), '123456');
    fireEvent.changeText(getByPlaceholderText('Nova lozinka'), 'lozinka123');
    fireEvent.changeText(getByPlaceholderText('Potvrdi lozinku'), 'lozinka123');
    fireEvent.press(getByText('Postavi novu lozinku'));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Greška', 'Resetovanje lozinke nije uspjelo');
    });
  });

  it('ID 41 - Gubitak interneta prilikom slanja', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));
    const { getByText, getByPlaceholderText } = render(<NewPasswordScreen />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Kod'), '123456');
    fireEvent.changeText(getByPlaceholderText('Nova lozinka'), 'lozinka123');
    fireEvent.changeText(getByPlaceholderText('Potvrdi lozinku'), 'lozinka123');
    fireEvent.press(getByText('Postavi novu lozinku'));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Greška', 'Došlo je do greške. Pokušajte ponovo.');
    });
  });
});