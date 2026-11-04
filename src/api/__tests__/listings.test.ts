// The app's queries must apply the same rules as the website. A fake Supabase client records every call.
import { fetchCategory, fetchCollection, fetchListing, fetchShop, fetchLatest, fetchProperties, fetchSearch, PAGE_SIZE } from '../listings';

type Call = [string, ...unknown[]];
function fakeClient(rows: unknown[] = []) {
  const calls: Call[] = [];
  const chain: Record<string, unknown> = {};
  for (const m of ['from', 'select', 'eq', 'in', 'gte', 'lte', 'or', 'order', 'not']) {
    chain[m] = (...args: unknown[]) => { calls.push([m, ...args]); return chain; };
  }
  chain.range = (...args: unknown[]) => { calls.push(['range', ...args]); return Promise.resolve({ data: rows, error: null }); };
  chain.limit = (...args: unknown[]) => { calls.push(['limit', ...args]); return Promise.resolve({ data: rows, error: null }); };
  return { client: chain as never, calls };
}
const has = (calls: Call[], ...expected: unknown[]) => calls.some((c) => JSON.stringify(c) === JSON.stringify(expected));

test('latest finds: published, available or reserved, approved shops, verified first, newest next', async () => {
  const { client, calls } = fakeClient();
  await fetchLatest({}, client);
  expect(has(calls, 'from', 'ads')).toBe(true);
  expect(has(calls, 'eq', 'status', 'published')).toBe(true);
  expect(has(calls, 'in', 'availability', ['available', 'reserved'])).toBe(true);
  expect(has(calls, 'eq', 'shops.status', 'approved')).toBe(true);
  expect(calls.some((c) => c[0] === 'gte' && c[1] === 'confirmed_at')).toBe(true);
  const orders = calls.filter((c) => c[0] === 'order').map((c) => c[1]);
  expect(orders).toEqual(['feed_boost', 'created_at']);
  expect(has(calls, 'range', 0, PAGE_SIZE - 1)).toBe(true);
});

test('second page asks for the next rows', async () => {
  const { client, calls } = fakeClient();
  await fetchLatest({ page: 1 }, client);
  expect(has(calls, 'range', PAGE_SIZE, 2 * PAGE_SIZE - 1)).toBe(true);
});

test('country filter uses the shop country', async () => {
  const { client, calls } = fakeClient();
  await fetchLatest({ country: 'Kenya' }, client);
  expect(has(calls, 'eq', 'shops.country', 'Kenya')).toBe(true);
});

test('category page filters by category, sub, price and condition', async () => {
  const { client, calls } = fakeClient();
  await fetchCategory({ category: 'Fashion', sub: 'Men', min: 100, max: 500, condition: 'used', verified: true }, client);
  expect(has(calls, 'eq', 'category', 'Fashion')).toBe(true);
  expect(has(calls, 'eq', 'subcategory', 'Men')).toBe(true);
  expect(has(calls, 'gte', 'price', 100)).toBe(true);
  expect(has(calls, 'lte', 'price', 500)).toBe(true);
  expect(has(calls, 'eq', 'condition', 'used')).toBe(true);
  expect(has(calls, 'eq', 'shops.is_verified', true)).toBe(true);
});

test('typed text is cleaned before it reaches the database filter', async () => {
  const { client, calls } = fakeClient();
  await fetchCategory({ category: 'Fashion', q: 'shoes),or(status.eq.removed' }, client);
  const ors = calls.filter((c) => c[0] === 'or').map((c) => String(c[1]));
  expect(ors.length).toBeGreaterThan(0);
  for (const o of ors) expect(o).not.toContain('status.eq.removed');
});

test('search with only symbols does not query at all', async () => {
  const { client, calls } = fakeClient();
  expect(await fetchSearch('%%%,,()', {}, client)).toEqual([]);
  expect(calls).toHaveLength(0);
});

test('properties: rent or sale, Houses & Rentals only', async () => {
  const { client, calls } = fakeClient();
  await fetchProperties({ deal: 'sale', type: 'land' }, client);
  expect(has(calls, 'eq', 'category', 'Houses & Rentals')).toBe(true);
  expect(has(calls, 'eq', 'transaction_type', 'sale')).toBe(true);
  expect(has(calls, 'eq', 'rental->>type', 'land')).toBe(true);
});

test('database errors become a thrown error', async () => {
  const chain: Record<string, unknown> = {};
  for (const m of ['from', 'select', 'eq', 'in', 'gte', 'order']) chain[m] = () => chain;
  chain.range = () => Promise.resolve({ data: null, error: { message: 'boom' } });
  await expect(fetchLatest({}, chain as never)).rejects.toThrow('boom');
});

test('free stuff: price 0, available only (website /free)', async () => {
  const { client, calls } = fakeClient();
  await fetchCollection('free', {}, client);
  expect(has(calls, 'eq', 'price', 0)).toBe(true);
  expect(has(calls, 'eq', 'availability', 'available')).toBe(true);
  expect(has(calls, 'eq', 'shops.status', 'approved')).toBe(true);
});

test('used: used or refurbished (website /used)', async () => {
  const { client, calls } = fakeClient();
  await fetchCollection('used', {}, client);
  expect(has(calls, 'in', 'condition', ['used', 'refurbished'])).toBe(true);
});

test('deals: only 30% or more off, biggest discount first', async () => {
  const now = new Date().toISOString();
  const rows = [
    { id: 'a', price: 90, previous_price: 100, price_dropped_at: now },
    { id: 'b', price: 50, previous_price: 100, price_dropped_at: now },
    { id: 'c', price: 60, previous_price: 100, price_dropped_at: now },
  ];
  const { client, calls } = fakeClient(rows);
  const out = await fetchCollection('deals', {}, client);
  expect(calls.some((c) => c[0] === 'not' && c[1] === 'previous_price')).toBe(true);
  expect(out.map((a) => a.id)).toEqual(['b', 'c']);
});

test('one-row lookups return null when nothing is found (not an empty list)', async () => {
  const chain: Record<string, unknown> = {};
  for (const m of ['from', 'select', 'eq']) chain[m] = () => chain;
  chain.maybeSingle = () => Promise.resolve({ data: null, error: null });
  await expect(fetchShop('none', chain as never)).resolves.toBeNull();
  await expect(fetchListing('none', chain as never)).resolves.toBeNull();
});
