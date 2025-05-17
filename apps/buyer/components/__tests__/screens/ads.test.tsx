// screens/ads/index.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ProductDetailsScreen from '../../../app/screens/orders/productDetails/[productId]';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/context/CartContext';
import * as SecureStore from 'expo-secure-store';

// Mock dependencies
jest.mock('expo-router', () => {
  return {
    useRouter: jest.fn(),
    useLocalSearchParams: jest.fn(),
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('@/context/CartContext', () => ({
  useCart: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
}));

jest.mock('proba-package', () => ({
  baseURL: 'http://localhost:3000',
  USE_DUMMY_DATA: false,
}));
jest.mock('expo-font');
jest.mock('@expo/vector-icons');


const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
};

const mockNavigation = {
  setOptions: jest.fn(),
};

const mockCart = {
  cartItems: [],
  addToCart: jest.fn(),
};

const mockTranslation = {
  t: (key: string) => key,
  i18n: { language: 'en' },
};

const mockProduct = {
  id: 101,
  name: 'Test Product',
  productCategory: { id: 1, name: 'Test Category' },
  retailPrice: 10,
  wholesalePrice: 8,
  storeId: 123,
  photos: ['image1.jpg', 'image2.jpg'],
  isActive: true,
  quantity: 10,
};

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue(mockRouter);
  (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
  (useCart as jest.Mock).mockReturnValue(mockCart);
  (useTranslation as jest.Mock).mockReturnValue(mockTranslation);
  (useLocalSearchParams as jest.Mock).mockReturnValue({});
  (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('test_token');
  global.fetch = jest.fn();
  Alert.alert = jest.fn();

  // Mockiranje console.error
  jest.spyOn(console, 'error').mockImplementation(() => {});
});


describe('Ads Screen', () => {
  it('ID 179 - Učitavanje detalja proizvoda sa ispravnim ID', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ productId: '101' });
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockProduct),
    });

    const { getByText, queryByTestId } = render(<ProductDetailsScreen />);

    await waitFor(() => {
      expect(getByText('Test Product')).toBeTruthy();
      expect(queryByTestId('loading-indicator')).toBeNull();
    });
  });

  it('ID 180 - Navigacija sa parametrima oglasa', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      productId: '101',
      adId: '123',
      featureVec: '[0.1,0.2,0.3]',
      conversionPrice: '5.99',
    });

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockProduct),
    });

    render(<ProductDetailsScreen />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

    it('ID 181 - Navigacija bez parametara oglasa', () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({ productId: '101' });
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockProduct),
        });

        const { queryByTestId } = render(<ProductDetailsScreen />);

        expect(queryByTestId('ad-context-specific-element')).toBeNull();
        expect(Alert.alert).not.toHaveBeenCalled();
        expect(console.error).not.toHaveBeenCalled();
    });

    it('ID 182 - Chat bez autentifikacije', async () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({ productId: '101' });
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockProduct),
        });
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

        const { debug, getByText } = render(<ProductDetailsScreen />);

        await waitFor(() => expect(getByText('Test Product')).toBeTruthy());
        expect(Alert.alert).not.toHaveBeenCalled();
    });
});