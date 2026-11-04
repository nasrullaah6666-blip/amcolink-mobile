import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ListingCard } from '../ListingCard';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('expo-image', () => ({ Image: () => null }));
jest.mock('@/auth/mine', () => ({ useSaved: () => ({ signedIn: false, saved: { ads: new Set(), shops: new Set() }, toggle: { mutate: jest.fn(), isPending: false } }) }));

const base = {
  id: 'a1', shop_id: 's1', owner_id: 'u1', title: 'Samsung A15', description: '', price: 15000, currency: 'KES',
  category: 'Phones & Tablets', condition: 'used', photo_urls: [], availability: 'available', status: 'published',
  created_at: '2026-11-01T00:00:00Z', shops: { id: 's1', name: 'Mohamud Electronics', slug: 'mohamud', city: 'Nairobi', country: 'Kenya', is_verified: false, status: 'approved' },
} as never;

test('shows price, title and town', async () => {
  await render(<ListingCard ad={base} />);
  expect(screen.getByText('KES 15,000')).toBeTruthy();
  expect(screen.getByText('Samsung A15')).toBeTruthy();
  expect(screen.getByText(/Nairobi/)).toBeTruthy();
});

test('price on request when there is no price', async () => {
  await render(<ListingCard ad={{ ...(base as object), price: null } as never} />);
  expect(screen.getByText('Price on request')).toBeTruthy();
});

test('shows Reserved', async () => {
  await render(<ListingCard ad={{ ...(base as object), availability: 'reserved' } as never} />);
  expect(screen.getByText('Reserved')).toBeTruthy();
});
