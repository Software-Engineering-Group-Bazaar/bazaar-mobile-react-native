jest.mock('i18next', () => ({
  use: () => ({
    init: () => {},
  }),
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import CartScreen from '../../../../app/(tabs)/cart/index';

const mockPush = jest.fn();
const mockClearCart = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    push: mockPush,
  },
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue('test_token'),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      if (key === 'empty_cart') return 'Tvoja korpa je prazna.';
      if (key === 'total') return 'Ukupno';
      if (key === 'submit_order') return 'Pošalji narudžbu';
      if (key === 'quantity_changed_title') return 'Količina promijenjena';
      if (key === 'quantity_changed_message') return `Količina za proizvod ${params?.productName} se promijenila`;
      return key;
    },
    i18n: { language: 'bs', changeLanguage: jest.fn() },
  }),
}));

jest.mock('@/context/CartContext', () => ({
  useCart: () => ({
    cartItems: mockCartItems,
    handleQuantityChange: jest.fn(),
    clearCart: mockClearCart,
  }),
}));

jest.mock('proba-package/cart-item/index', () => (props: any) => (
  <>{props.product.name} x {props.quantity}</>
));

beforeAll(() => {
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
  mockCartItems.length = 0;
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

// Shared mock cart items array for tests
const mockCartItems: any[] = [];

describe('cart', () => {
    it('ID 53 - Prikaz prazne korpe', () => {
        mockCartItems.length = 0;
        const { getByText } = render(<CartScreen />);
        expect(getByText('Tvoja korpa je prazna.')).toBeTruthy();
    });

    it('ID 54 - Prikaz artikala u korpi', () => {
        mockCartItems.length = 0;
        mockCartItems.push({
            product: { id: 1, name: 'Artikal 1', retailPrice: 10, wholesalePrice: 8, storeId: 1, productCategory: { id: 1, name: 'Kategorija' }, photos: [], isActive: true },
            qty: 2,
        });
        const { getByText } = render(<CartScreen />);
        expect(getByText('Ukupno: 20.00 KM')).toBeTruthy();
    });

    it('ID 55 - Prikaz artikla u korpi', () => {
        mockCartItems.length = 0;
        mockCartItems.push({
            product: { id: 2, name: 'Artikal 2', retailPrice: 5, wholesalePrice: 4, storeId: 1, productCategory: { id: 1, name: 'Kategorija' }, photos: [], isActive: true },
            qty: 1,
        });
        const { queryAllByText } = render(<CartScreen />);
        expect(queryAllByText('Artikal 2 x 1')).toHaveLength(0);
    });

    it('ID 56 - Korištenje maloprodajne cijene', () => {
        mockCartItems.length = 0;
        mockCartItems.push({
        product: { id: 3, name: 'Artikal 3', retailPrice: 12, wholesalePrice: 10, storeId: 1, productCategory: { id: 1, name: 'Kategorija' }, photos: [], isActive: true, wholesaleThreshold: 10 },
        qty: 2,
        });
        const { getByText } = render(<CartScreen />);
        expect(getByText(/Ukupno: 24.00 KM/)).toBeTruthy();
    });

    it('ID 57 - Korištenje veleprodajne cijene', () => {
        mockCartItems.length = 0;
        mockCartItems.push({
        product: { id: 4, name: 'Artikal 4', retailPrice: 20, wholesalePrice: 15, storeId: 1, productCategory: { id: 1, name: 'Kategorija' }, photos: [], isActive: true, wholesaleThreshold: 2 },
        qty: 3,
        });
        const { getByText } = render(<CartScreen />);
        expect(getByText(/Ukupno: 45.00 KM/)).toBeTruthy();
    });

    it('ID 58 - Detekcija smanjene količine na stanju', async () => {
        mockCartItems.length = 0;
        mockCartItems.push({
        product: { id: 5, name: 'Artikal 5', retailPrice: 10, wholesalePrice: 8, storeId: 1, productCategory: { id: 1, name: 'Kategorija' }, photos: [], isActive: true },
        qty: 5,
        });
        global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => [{ quantity: 2 }],
        });
        render(<CartScreen />);
        await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
            'Količina promijenjena',
            'Količina za proizvod Artikal 5 se promijenila'
        );
        });
    });

    it('ID 59 - Slanje narudžbe sa ispravnim podacima', async () => {
        mockCartItems.length = 0;
        mockCartItems.push({
            product: { id: 6, name: 'Artikal 6', retailPrice: 10, wholesalePrice: 8, storeId: 1, productCategory: { id: 1, name: 'Kategorija' }, photos: [], isActive: true },
            qty: 1,
        });
        global.fetch = jest.fn()
        // Prvi fetch (login)
        .mockResolvedValueOnce({
            status: 201,
            json: async () => ({}),
        })
        // Drugi fetch (order)
        .mockResolvedValueOnce({
            status: 201,
            json: async () => ({}),
        });
        const { getByText } = render(<CartScreen />);
        fireEvent.press(getByText('Pošalji narudžbu'));
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Narudžba uspješna', "Narudžba je uspješno napravljena.");
            expect(mockClearCart).toHaveBeenCalled();
        });
    });

    it('ID 60 - Pokušaj slanja narudžbe sa API greškom', async () => {
        mockCartItems.length = 0;
        mockCartItems.push({
            product: { id: 7, name: 'Artikal 7', retailPrice: 10, wholesalePrice: 8, storeId: 1, productCategory: { id: 1, name: 'Kategorija' }, photos: [], isActive: true },
            qty: 1,
        });
        global.fetch = jest.fn()
            .mockResolvedValueOnce({
            status: 201,
            json: async () => ({}),
            })
            .mockResolvedValueOnce({
            status: 400,
            json: async () => ({}),
            });
        const { getByText } = render(<CartScreen />);
        fireEvent.press(getByText('Pošalji narudžbu'));
        await waitFor(() => {
            expect(Alert.alert).not.toHaveBeenCalled();
        });
    });

    it('ID 61 - Ukupna cijena prikazana ispravno', () => {
        mockCartItems.length = 0;
        mockCartItems.push({
        product: { id: 8, name: 'Artikal 8', retailPrice: 10, wholesalePrice: 8, storeId: 1, productCategory: { id: 1, name: 'Kategorija' }, photos: [], isActive: true },
        qty: 2,
        });
        mockCartItems.push({
        product: { id: 9, name: 'Artikal 9', retailPrice: 5, wholesalePrice: 4, storeId: 1, productCategory: { id: 1, name: 'Kategorija' }, photos: [], isActive: true },
        qty: 3,
        });
        const { getByText } = render(<CartScreen />);
        expect(getByText(/Ukupno: 35.00 KM/)).toBeTruthy();
    });

    it('ID 62 - Dugme "submit_order" samo za nepraznu korpu', () => {
        mockCartItems.length = 0;
        let { queryByText, rerender } = render(<CartScreen />);
        expect(queryByText('Pošalji narudžbu')).toBeNull();

        mockCartItems.push({
        product: { id: 10, name: 'Artikal 10', retailPrice: 10, wholesalePrice: 8, storeId: 1, productCategory: { id: 1, name: 'Kategorija' }, photos: [], isActive: true },
        qty: 1,
        });
        rerender(<CartScreen />);
        expect(queryByText('Pošalji narudžbu')).toBeTruthy();
    });

    it('ID 63 - Korištenje auth_tokena iz SecureStore', async () => {
        mockCartItems.length = 0;
        mockCartItems.push({
            product: { id: 11, name: 'Artikal 11', retailPrice: 10, wholesalePrice: 8, storeId: 1, productCategory: { id: 1, name: 'Kategorija' }, photos: [], isActive: true },
            qty: 1,
        });
        global.fetch = jest.fn()
            .mockResolvedValueOnce({
            status: 201,
            json: async () => ({}),
            })
            .mockResolvedValueOnce({
            status: 201,
            json: async () => ({}),
            });
        const { getByText } = render(<CartScreen />);
        fireEvent.press(getByText('Pošalji narudžbu'));
        await waitFor(() => {
            expect(require('expo-secure-store').getItemAsync).toHaveBeenCalledWith('auth_token');
            expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/OrderBuyer/order/create'),
            expect.objectContaining({
                headers: expect.objectContaining({
                Authorization: expect.stringContaining('test_token'),
                }),
            })
            );
        });
    });
});