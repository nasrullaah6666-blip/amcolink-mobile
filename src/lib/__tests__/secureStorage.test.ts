// Sessions bigger than one secure-storage slot must be split and joined back exactly.
const mockStore = new Map<string, string>();
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (k: string) => (mockStore.has(k) ? mockStore.get(k)! : null)),
  setItemAsync: jest.fn(async (k: string, v: string) => {
    if (!/^[A-Za-z0-9._-]+$/.test(k)) throw new Error('bad key ' + k);
    if (v.length > 2048) throw new Error('value too large');
    mockStore.set(k, v);
  }),
  deleteItemAsync: jest.fn(async (k: string) => { mockStore.delete(k); }),
}));

import { secureStorage } from '../secureStorage';

beforeEach(() => mockStore.clear());

test('a large session is stored in parts and read back unchanged', async () => {
  const session = JSON.stringify({ access_token: 'x'.repeat(5000), user: { id: 'u1' } });
  await secureStorage.setItem('sb-ckhoycpsjftavuqxxnss-auth-token', session);
  expect(await secureStorage.getItem('sb-ckhoycpsjftavuqxxnss-auth-token')).toBe(session);
  expect([...mockStore.keys()].length).toBeGreaterThan(2);
});

test('removing deletes every part', async () => {
  await secureStorage.setItem('k', 'y'.repeat(4000));
  await secureStorage.removeItem('k');
  expect(mockStore.size).toBe(0);
  expect(await secureStorage.getItem('k')).toBeNull();
});

test('a shorter value replaces a longer one without leftovers', async () => {
  await secureStorage.setItem('k', 'a'.repeat(4000));
  await secureStorage.setItem('k', 'short');
  expect(await secureStorage.getItem('k')).toBe('short');
  expect(mockStore.size).toBe(2);
});

test('keys with unusual characters are made safe', async () => {
  await secureStorage.setItem('sb:auth/token', 'v');
  expect(await secureStorage.getItem('sb:auth/token')).toBe('v');
});
