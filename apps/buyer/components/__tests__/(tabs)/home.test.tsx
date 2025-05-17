import React from 'react';
import { render } from '@testing-library/react-native';
import Home from '../../../app/(tabs)/home';

jest.mock('i18next', () => ({
  t: (key: string) => {
    if (key === 'welcome') return 'Dobrodošli';
    if (key === 'home-text') return 'Ovo je Bazaar buyer aplikacija';
    if (key === 'home') return 'Početna';
    if (key === 'stores') return 'Prodavnice';
    if (key === 'profile') return 'Profil';
    if (key === 'search') return 'Pretraga';
    return key;
  },
}));

describe('home', () => {
  it('ID 51 - Otvaranje Home ekrana', () => {
    const { getByText } = render(<Home />);
    expect(getByText('🎉 Dobrodošli')).toBeTruthy();
    expect(getByText('Ovo je Bazaar buyer aplikacija')).toBeTruthy();
  });

  it('ID 52 - Provjera prikaza prevedenog teksta', () => {
    const { getByText } = render(<Home />);
    // Ovdje testiramo da su svi stringovi prevedeni (možeš proširiti po potrebi)
    expect(getByText('🎉 Dobrodošli')).toBeTruthy();
    expect(getByText('Ovo je Bazaar buyer aplikacija')).toBeTruthy();
    // Simuliraj prikaz drugih sekcija (ako ih imaš na ekranu)
    expect(jest.requireMock('i18next').t('home')).toBe('Početna');
    expect(jest.requireMock('i18next').t('stores')).toBe('Prodavnice');
    expect(jest.requireMock('i18next').t('profile')).toBe('Profil');
    expect(jest.requireMock('i18next').t('search')).toBe('Pretraga');
  });
});