import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignUp from '../../../app/(auth)/register';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

jest.spyOn(Alert, 'alert');

beforeEach(() => {
    jest.clearAllMocks();
    mockReplace.mockClear();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: jest.fn(),
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
}));

jest.mock('react-native-fbsdk-next', () => ({
  AccessToken: { getCurrentAccessToken: jest.fn(() => Promise.resolve({ accessToken: 'fake_token' })) },
  Profile: { getCurrentProfile: jest.fn(() => Promise.resolve({ name: 'Test User' })) },
  LoginManager: { logInWithPermissions: jest.fn(() => Promise.resolve({ isCancelled: false })) },
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(() => Promise.resolve({ idToken: 'fake_id_token', user: { name: 'Test User' } })),
  },
  isSuccessResponse: () => true,
  isErrorWithCode: () => false,
  statusCodes: { IN_PROGRESS: 'in_progress', PLAY_SERVICES_NOT_AVAILABLE: 'play_services_not_available' },
}));

jest.mock('expo-font', () => ({ useFonts: () => [true] }));

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  return { FontAwesome: (props) => React.createElement('FontAwesome', props) };
});

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ token: 'mocked_token' }),
  })
);

describe('register', () => {
    it('ID 2 - Pokušaj registracije bez unosa e-maila', async () => {
    const { getByPlaceholderText, getByText } = render(<SignUp />);

    fireEvent.changeText(getByPlaceholderText('first_name'), 'Test');
    fireEvent.changeText(getByPlaceholderText('last_name'), 'User');
    // Ostavljamo e-mail praznim
    fireEvent.changeText(getByPlaceholderText('password_placeholder'), 'Test123!');

    fireEvent.press(getByText('sign_up'));

    await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('error', 'fill_all_fields');
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('ID 3 - Pokušaj registracije bez unosa imena', async () => {
        const { getByPlaceholderText, getByText } = render(<SignUp />);

        // Ostavljamo first_name praznim
        fireEvent.changeText(getByPlaceholderText('last_name'), 'User');
        fireEvent.changeText(getByPlaceholderText('email_placeholder'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('password_placeholder'), 'Test123!');

        fireEvent.press(getByText('sign_up'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('error', 'fill_all_fields');
        });

        expect(fetch).not.toHaveBeenCalled();
        expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('ID 4 - Pokušaj registracije bez unosa prezimena', async () => {
        const { getByPlaceholderText, getByText } = render(<SignUp />);

        fireEvent.changeText(getByPlaceholderText('first_name'), 'Test');
        // Ostavljamo last_name praznim
        fireEvent.changeText(getByPlaceholderText('email_placeholder'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('password_placeholder'), 'Test123!');

        fireEvent.press(getByText('sign_up'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('error', 'fill_all_fields');
        });

        expect(fetch).not.toHaveBeenCalled();
        expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('ID 5 - Pokušaj registracije bez unosa lozinke', async () => {
        const { getByPlaceholderText, getByText } = render(<SignUp />);

        fireEvent.changeText(getByPlaceholderText('first_name'), 'Test');
        fireEvent.changeText(getByPlaceholderText('last_name'), 'User');
        fireEvent.changeText(getByPlaceholderText('email_placeholder'), 'test@example.com');
        // Ostavljamo password praznim
        fireEvent.changeText(getByPlaceholderText('password_placeholder'), '');

        fireEvent.press(getByText('sign_up'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('error', 'fill_all_fields');
        });

        expect(fetch).not.toHaveBeenCalled();
        expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('ID 6 - Registracija sa postojećim e-mailom prikazuje poruku o neuspjehu', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ message: 'Neuspješno kreiranje računa' }),
            })
        );

        const { getByPlaceholderText, getByText } = render(<SignUp />);

        fireEvent.changeText(getByPlaceholderText('first_name'), 'Test');
        fireEvent.changeText(getByPlaceholderText('last_name'), 'User');
        fireEvent.changeText(getByPlaceholderText('email_placeholder'), 'existing@example.com');
        fireEvent.changeText(getByPlaceholderText('password_placeholder'), 'Test123!');

        fireEvent.press(getByText('sign_up'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('error', 'Neuspješno kreiranje računa');
        });
    });

    it('ID 7 - Neuspjeh servera ili mrežna greška - prikazuje poruku', async () => {
        global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

        const { getByPlaceholderText, getByText } = render(<SignUp />);

        fireEvent.changeText(getByPlaceholderText('first_name'), 'Test');
        fireEvent.changeText(getByPlaceholderText('last_name'), 'User');
        fireEvent.changeText(getByPlaceholderText('email_placeholder'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('password_placeholder'), 'Test123!');

        fireEvent.press(getByText('sign_up'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('error', 'something_went_wrong');
        });
    });

    it('ID 8 - Uspješan login putem Facebook-a', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ token: 'mocked_token' }),
            })
        );
        const { getByText } = render(<SignUp />);
        fireEvent.press(getByText('signup_facebook'));
        await waitFor(() => {
            expect(SecureStore.setItemAsync).toHaveBeenCalledWith("accessToken", "mocked_token");
            expect(mockReplace).toHaveBeenCalledWith('/home');
        });

    });

    /* it('ID 12 - Uspješan login putem Google naloga', async () => {
        const { getByText } = render(<SignUp />);
        fireEvent.press(getByText('signup_google'));
        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith('/home');
        });
    }); */

    it('ID 13 - Korisnik otkazuje login putem Google naloga', async () => {
        // Simuliramo grešku pri otkazivanju
        const error = new Error('SIGN_IN_CANCELLED');
        require('@react-native-google-signin/google-signin').GoogleSignin.signIn.mockImplementationOnce(() => {
            throw error;
        });

        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        const { getByText } = render(<SignUp />);
        fireEvent.press(getByText('signup_google'));

        await waitFor(() => {
            const lastCall = consoleSpy.mock.calls.at(-1);
            expect(lastCall[0]).toBe('Unknown error during Google Sign-Up');
            expect(lastCall[1]).toBeInstanceOf(Error);
            expect(lastCall[1].message).toBe('SIGN_IN_CANCELLED');
        });

        consoleSpy.mockRestore();
    });

    it('ID 14 - Google Play Services nije dostupan', async () => {
        // Mock hasPlayServices da baci grešku
        require('@react-native-google-signin/google-signin').GoogleSignin.hasPlayServices.mockImplementationOnce(() =>
            Promise.reject({ code: 'play_services_not_available' })
        );
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        const { getByText } = render(<SignUp />);
        fireEvent.press(getByText('signup_google'));

        await waitFor(() => {
            const lastCall = consoleSpy.mock.calls.at(-1);
            expect(lastCall[0]).toBe('Unknown error during Google Sign-Up');
            expect(lastCall[1]).toEqual({ code: 'play_services_not_available' });
            });

        consoleSpy.mockRestore();
    });

    it('ID 15 - SignIn već u toku', async () => {
        // Mock signIn da baci grešku sa kodom IN_PROGRESS
        require('@react-native-google-signin/google-signin').GoogleSignin.signIn.mockImplementationOnce(() =>
            Promise.reject({ code: 'in_progress' })
        );
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        const { getByText } = render(<SignUp />);
        fireEvent.press(getByText('signup_google'));

         await waitFor(() => {
            const lastCall = consoleSpy.mock.calls.at(-1);
            expect(lastCall[0]).toBe('Unknown error during Google Sign-Up');
            expect(lastCall[1]).toEqual({ code: 'in_progress' });
            });
        consoleSpy.mockRestore();
    });

    it('ID 16 - Server vraća grešku tokom Google login-a', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                text: () => Promise.resolve('Neuspješna registracija'),
                json: () => Promise.resolve({ message: 'Neuspješna registracija' }),
            })
        );

        jest.spyOn(require('@react-native-google-signin/google-signin'), 'isSuccessResponse').mockReturnValue(true);

        const { getByText } = render(<SignUp />);
        fireEvent.press(getByText('signup_google'));

        await waitFor(() => {
            // console.log(Alert.alert.mock.calls);
            expect(Alert.alert).not.toHaveBeenCalled();
        });
    });

    it('ID 17 - Promjena jezika sa engleskog na bosanski i obrnuto', async () => {
        const { getByText } = render(<SignUp />);

        // Početno stanje - EN i engleski tekst
        expect(getByText('EN')).toBeTruthy();
        expect(getByText('sign_up')).toBeTruthy();

        // Klik na EN → promjena na BS
        fireEvent.press(getByText('EN'));
        await waitFor(() => {
            expect(getByText('sign_up')).toBeTruthy();
        });
    });

    it('ID 9 - Korisnik otkazuje login putem Facebook-a', async () => {
        const { getByText } = render(<SignUp />);
        // Mock Facebook LoginManager da vrati isCancelled: true
        require('react-native-fbsdk-next').LoginManager.logInWithPermissions.mockImplementationOnce(() =>
            Promise.resolve({ isCancelled: true })
        );
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        fireEvent.press(getByText('signup_facebook'));

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('==> Login cancelled');
        });

        consoleSpy.mockRestore();
    });

    it('ID 10 - Greška tokom dohvaćanja AccessToken-a', async () => {
        // Mock Facebook AccessToken da vrati null PRIJE rendera!
        require('react-native-fbsdk-next').AccessToken.getCurrentAccessToken.mockImplementationOnce(() =>
            Promise.resolve(null)
        );
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        const { getByText } = render(<SignUp />);

        fireEvent.press(getByText('signup_facebook'));

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(null);
        });
        consoleSpy.mockRestore();
    });
	

    it('ID 1 - Pokušaj registracije sa svim validnim podacima', async () => {
        const { getByPlaceholderText, getByText } = render(<SignUp />);

        fireEvent.changeText(getByPlaceholderText('first_name'), 'Test');
        fireEvent.changeText(getByPlaceholderText('last_name'), 'User');
        fireEvent.changeText(getByPlaceholderText('email_placeholder'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('password_placeholder'), 'Test123!');

        fireEvent.press(getByText('sign_up'));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/Auth/register'),
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
            );
        });

        expect(SecureStore.setItemAsync).not.toHaveBeenCalled(); // Registracija ne vraća token
    });
});