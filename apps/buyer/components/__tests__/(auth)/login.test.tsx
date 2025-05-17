jest.mock('i18next', () => ({
  use: () => ({
    init: () => {},
  }),
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignIn from '../../../app/(auth)/login';
import { Alert } from 'react-native';

jest.spyOn(Alert, 'alert');

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
}));

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  return { FontAwesome: (props: any) => React.createElement('FontAwesome', props) };
});

jest.mock('react-native-fbsdk-next', () => ({
  AccessToken: { getCurrentAccessToken: jest.fn(() => Promise.resolve({ accessToken: 'fb_token' })) },
  Profile: { getCurrentProfile: jest.fn(() => Promise.resolve({ name: 'Test User' })) },
  LoginManager: { logInWithPermissions: jest.fn(() => Promise.resolve({ isCancelled: false })) },
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(() => Promise.resolve({ data: { idToken: 'fake_id_token' } })),
  },
  isSuccessResponse: (res: any) => !!res?.data?.idToken,
  isErrorWithCode: (err: any) => !!err?.code,
  statusCodes: { IN_PROGRESS: 'in_progress', PLAY_SERVICES_NOT_AVAILABLE: 'play_services_not_available' },
}));

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('login', () => {
    it('ID 18 - Pokušaj login-a bez unosa emaila i lozinke', async () => {
        const { getByPlaceholderText, getByText } = render(<SignIn />);
        fireEvent.changeText(getByPlaceholderText('email_placeholder'), '');
        fireEvent.changeText(getByPlaceholderText('password_placeholder'), '');
        fireEvent.press(getByText('continue'));
        await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('error', 'fill_all_fields');
        });
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('ID 19 - Login sa neodobrenim nalogom', async () => {
        global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ token: 'mocked_token', mail: false }),
            text: () => Promise.resolve(''),
            headers: {
            get: () => null,
            },
        } as unknown as Response)
        );
        const { getByPlaceholderText, getByText } = render(<SignIn />);
        fireEvent.changeText(getByPlaceholderText('email_placeholder'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('password_placeholder'), 'Test123!');
        fireEvent.press(getByText('continue'));
        await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('access_denied', 'account_not_approved');
        });
    });

    it('ID 20 - Login sa pogrešnom lozinkom', async () => {
        global.fetch = jest.fn(() =>
        Promise.resolve({
            status: 401,
            ok: false,
            json: () => Promise.resolve({}),
            text: () => Promise.resolve(''),
        } as Response)
        );
        const { getByPlaceholderText, getByText } = render(<SignIn />);
        fireEvent.changeText(getByPlaceholderText('email_placeholder'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('password_placeholder'), 'wrongpass');
        fireEvent.press(getByText('continue'));
        await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('login_failed', 'invalid_credentials');
        });
    });

    it('ID 21 - Server greška tokom login-a', async () => {
        global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
        const { getByPlaceholderText, getByText } = render(<SignIn />);
        fireEvent.changeText(getByPlaceholderText('email_placeholder'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('password_placeholder'), 'Test123!');
        fireEvent.press(getByText('continue'));
        await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('error', 'something_went_wrong');
        });
    });

    it('ID 22 - Google login: korisnik otkazuje login', async () => {
        require('@react-native-google-signin/google-signin').GoogleSignin.signIn.mockImplementationOnce(() => Promise.resolve({}));
        const { getByText } = render(<SignIn />);
        fireEvent.press(getByText('login_google'));
        await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Google Sign-in cancelled');
        });
    });

    it('ID 23 - Google login: Play Services nisu dostupni', async () => {
        require('@react-native-google-signin/google-signin').GoogleSignin.hasPlayServices.mockImplementationOnce(() =>
        Promise.reject({ code: 'play_services_not_available' })
        );
        const { getByText } = render(<SignIn />);
        fireEvent.press(getByText('login_google'));
        await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Play services not available');
        });
    });

    it('ID 24 - Google login: login već u toku', async () => {
        require('@react-native-google-signin/google-signin').GoogleSignin.signIn.mockImplementationOnce(() =>
        Promise.reject({ code: 'in_progress' })
        );
        const { getByText } = render(<SignIn />);
        fireEvent.press(getByText('login_google'));
        await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('Sign-in in progress');
        });
    });

    it('ID 25 - Google login: backend vraća grešku', async () => {
        require('@react-native-google-signin/google-signin').GoogleSignin.signIn.mockImplementationOnce(() =>
        Promise.resolve({ data: { idToken: 'fake_id_token' } })
        );
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                status: 400,
                json: () => Promise.resolve({}),
                text: () => Promise.resolve('Neuspješna prijava'),
            } as unknown as Response)
        );
        const { getByText } = render(<SignIn />);
        fireEvent.press(getByText('login_google'));
        await waitFor(() => {
            expect(Alert.alert).not.toHaveBeenCalled();
        });
    });

    it('ID 26 - Facebook login: backend vraća grešku', async () => {
        require('react-native-fbsdk-next').LoginManager.logInWithPermissions.mockImplementationOnce(() =>
        Promise.resolve({ isCancelled: false })
        );
        require('react-native-fbsdk-next').AccessToken.getCurrentAccessToken.mockImplementationOnce(() =>
        Promise.resolve({ accessToken: 'fb_token' })
        );
        global.fetch = jest.fn(() =>
        Promise.resolve({
                ok: false,
                status: 400,
                json: () => Promise.resolve({}),
                text: () => Promise.resolve('Neuspješna prijava'),
            } as unknown as Response)
        );
        const { getByText } = render(<SignIn />);
        fireEvent.press(getByText('login_facebook'));
        await waitFor(() => {
            expect(Alert.alert).not.toHaveBeenCalled();
        });
    });
});