const store: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: async (k: string) => store[k] ?? null,
  setItem: async (k: string, v: string) => { store[k] = v; },
  removeItem: async (k: string) => { delete store[k]; },
}));
import { clearRecent, loadRecent, recordView } from '@/lib/recent';

const item = (id: string) => ({ id, title: `Item ${id}`, price: 'KES 100', photo: null, city: 'Nairobi' });

test('newest first, no doubles, max 12 kept and 10 shown, older than 30 days dropped', async () => {
  const now = 1_800_000_000_000;
  for (let i = 1; i <= 14; i++) await recordView(item(String(i)), now + i);
  await recordView(item('3'), now + 100);
  const list = await loadRecent(now + 200);
  expect(list).toHaveLength(10);
  expect(list[0].id).toBe('3');
  expect(new Set(list.map((x) => x.id)).size).toBe(10);
  expect(await loadRecent(now + 31 * 86_400_000)).toHaveLength(0);
  await clearRecent();
  expect(await loadRecent(now)).toHaveLength(0);
});
