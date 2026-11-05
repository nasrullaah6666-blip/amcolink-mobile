jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('@/api/db', () => ({ db: () => null }));
import { getPriceDrops } from '@/lib/priceDrops';

const day = 86_400_000;
const iso = (msAgo: number) => new Date(Date.now() - msAgo).toISOString();
function client(rows: unknown[]) {
  const chain: Record<string, unknown> = {};
  for (const m of ['select', 'eq', 'not']) chain[m] = () => chain;
  chain.gte = async () => ({ data: rows });
  return { from: () => chain } as never;
}

test('only items saved before their price dropped (website rule), newest drop remembered', async () => {
  const rows = [
    { created_at: iso(5 * day), ads: { id: 'a', price: 80, previous_price: 100, price_dropped_at: iso(1 * day), availability: 'available', status: 'published' } },
    { created_at: iso(1 * day / 2), ads: { id: 'b', price: 80, previous_price: 100, price_dropped_at: iso(1 * day), availability: 'available', status: 'published' } },
    { created_at: iso(5 * day), ads: { id: 'c', price: 80, previous_price: 100, price_dropped_at: iso(2 * day), availability: 'sold', status: 'published' } },
  ];
  const r = await getPriceDrops(client(rows), 'u');
  expect([...r.ids]).toEqual(['a']);
  expect(r.latest).toBe(rows[0].ads.price_dropped_at);
});
