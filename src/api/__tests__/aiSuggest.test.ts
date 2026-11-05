jest.mock('@/api/db', () => ({ db: () => ({ auth: { getSession: async () => ({ data: { session: { access_token: 'tok' } } }) } }) }));
import { aiHelperAvailable, middlePrice, suggestFromPhoto } from '@/api/aiSuggest';

const realFetch = global.fetch;
afterEach(() => { global.fetch = realFetch; });

test('only the store app (production) shows the photo helper', () => {
  expect(aiHelperAvailable()).toBe(false);
});

test('middle of the price range, rounded', () => {
  expect(middlePrice({ low: 12000, high: 15001 })).toBe(13501);
});

test('sends the sign-in and returns the suggestion', async () => {
  const fetchMock = jest.fn(async () => ({ ok: true, json: async () => ({ title: 'Samsung A15', category: 'Phones & Tablets', subcategory: 'Phones', condition: 'used', description: 'x', price: null }) }));
  global.fetch = fetchMock as unknown as typeof fetch;
  const s = await suggestFromPhoto('https://x.supabase.co/storage/v1/object/public/ad-photos/u/a.jpg', 'shop1');
  expect(s.title).toBe('Samsung A15');
  const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
  expect(url).toMatch(/\/api\/ai\/suggest$/);
  expect((init.headers as Record<string, string>).authorization).toBe('Bearer tok');
});

test("shows the website's own message when it refuses", async () => {
  global.fetch = (async () => ({ ok: false, json: async () => ({ error: "You've used the AI helper 20 times today." }) })) as unknown as typeof fetch;
  await expect(suggestFromPhoto('u', 's')).rejects.toThrow('20 times today');
});
