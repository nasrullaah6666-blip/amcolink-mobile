/**
 * READ-ONLY integration tests against the STAGING Supabase project (run on GitHub, where the staging key is a secret).
 * They check the security rules the app depends on, as a signed-out visitor. They never write data:
 * every write attempt below is expected to be REFUSED by the database.
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '';

if (!url.includes('ckhoycpsjftavuqxxnss')) throw new Error('Integration tests run against STAGING only.');
if (!key.startsWith('sb_publishable_')) throw new Error('Integration tests need the staging publishable key.');

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

/** A refusal must come from the database or auth server, never from a network failure. */
function expectRefused(error: { message?: string; code?: string; status?: number } | null) {
  expect(error).not.toBeNull();
  expect(String(error?.message ?? '')).not.toMatch(/fetch failed|network|ENOTFOUND|ECONNREFUSED|timeout/i);
}

test('signed-out visitors can read approved shops and published ads', async () => {
  const shops = await db.from('shops').select('id,name,status').eq('status', 'approved').limit(5);
  expect(shops.error).toBeNull();
  const ads = await db.from('ads').select('id,title,status').eq('status', 'published').limit(5);
  expect(ads.error).toBeNull();
});

test('the countries list is available (243 countries on staging)', async () => {
  const res = await db.from('countries').select('code', { count: 'exact', head: true });
  expect(res.error).toBeNull();
  expect(res.count).toBe(243);
});

test('signed-out visitors cannot read a Wanted buyer WhatsApp number', async () => {
  const res = await db.from('wanted_posts').select('id,whatsapp').limit(1);
  expectRefused(res.error);
});

test('signed-out visitors can read the public Wanted columns', async () => {
  const res = await db.from('wanted_posts').select('id,title,city,country,status').limit(1);
  expect(res.error).toBeNull();
});

test('signed-out visitors cannot create a shop', async () => {
  const res = await db.from('shops').insert({ owner_id: '00000000-0000-0000-0000-000000000000', slug: 'ci-should-fail', name: 'CI should fail', city: 'Test' });
  expectRefused(res.error);
});

test('signed-out visitors cannot create a report', async () => {
  const res = await db.from('reports').insert({ reason: 'CI should fail', shop_id: '00000000-0000-0000-0000-000000000000' });
  expectRefused(res.error);
});

test('signed-out visitors cannot use admin functions', async () => {
  const ban = await db.rpc('admin_set_ban', { target: '00000000-0000-0000-0000-000000000000', banned: true });
  expectRefused(ban.error);
  const insights = await db.rpc('insights_summary', { p_days: 7 });
  expectRefused(insights.error);
});

test('public trending lists can be read signed out', async () => {
  const res = await db.rpc('trending_shops', { p_days: 7, p_limit: 5 });
  // Function arguments may differ in name; a "function not found" error is reported clearly instead of passing.
  expect(res.error?.message ?? null).toBeNull();
});

test('sign-up without the security check is refused (CAPTCHA is on)', async () => {
  const res = await db.auth.signUp({ email: `ci-${Date.now()}@example.com`, password: 'ci-test-Password-1' });
  expectRefused(res.error);
  expect(String(res.error?.message).toLowerCase()).toContain('captcha');
});

test('notifications are private', async () => {
  const res = await db.from('notifications').select('id').limit(1);
  // Either refused or no rows: a signed-out visitor must never see notifications.
  if (res.error) expectRefused(res.error);
  else expect(res.data ?? []).toHaveLength(0);
});

// The app's own list queries must be accepted by the real database (staging may have no rows yet).
import { fetchCategory, fetchCollection, fetchLatest, fetchProperties, fetchSearch, fetchShop } from '../src/api/listings';
import { getTrust } from '../src/core/trust';
import { fetchWanted } from '../src/api/wanted';
import { fetchGifts } from '../src/api/listings';
import { getTrending } from '../src/core/trending';

test('app query: latest finds runs on staging', async () => {
  await expect(fetchLatest({}, db)).resolves.toEqual(expect.any(Array));
  await expect(fetchLatest({ country: 'Kenya', page: 1 }, db)).resolves.toEqual(expect.any(Array));
});

test('app query: category page with every filter runs on staging', async () => {
  await expect(fetchCategory({ category: 'Fashion', sub: 'Men', q: 'shoes', city: 'Nairobi', min: 1, max: 9999, condition: 'used', verified: true, sort: 'price_asc' }, db)).resolves.toEqual(expect.any(Array));
  await expect(fetchCategory({ category: 'Phones & Tablets', q: 'samsung' }, db)).resolves.toEqual(expect.any(Array));
});

test('app query: properties for rent and for sale run on staging', async () => {
  await expect(fetchProperties({ deal: 'rent', area: 'Eastleigh', type: 'apartment' }, db)).resolves.toEqual(expect.any(Array));
  await expect(fetchProperties({ deal: 'sale' }, db)).resolves.toEqual(expect.any(Array));
});

test('app query: search runs on staging', async () => {
  await expect(fetchSearch('t-shirt', {}, db)).resolves.toEqual(expect.any(Array));
});

test('app query: Explore collections run on staging', async () => {
  for (const k of ['deals', 'free', 'used', 'new'] as const) {
    await expect(fetchCollection(k, {}, db)).resolves.toEqual(expect.any(Array));
  }
});

test('app query: shop profile lookup and trust run on staging', async () => {
  await expect(fetchShop('no-such-shop-for-test', db)).resolves.toBeNull();
  const res = await db.rpc('shop_trust', { p_shops: ['00000000-0000-0000-0000-000000000000'] });
  expect(res.error).toBeNull();
  await expect(getTrust(db, [])).resolves.toBeInstanceOf(Map);
});

test('signed-out visitors cannot save, block or read other people\'s saved items', async () => {
  const fav = await db.from('favorites').insert({ user_id: '00000000-0000-0000-0000-000000000000', ad_id: '00000000-0000-0000-0000-000000000000' });
  expectRefused(fav.error);
  const blk = await db.from('blocked_shops').insert({ user_id: '00000000-0000-0000-0000-000000000000', shop_id: '00000000-0000-0000-0000-000000000000' });
  expectRefused(blk.error);
  const read = await db.from('favorites').select('id').limit(1);
  if (read.error) expectRefused(read.error); else expect(read.data ?? []).toHaveLength(0);
});

test('signed-out visitors cannot post an ad or upload a photo', async () => {
  const ad = await db.from('ads').insert({ shop_id: '00000000-0000-0000-0000-000000000000', owner_id: '00000000-0000-0000-0000-000000000000', title: 'test', description: 'integration test should be refused', currency: 'KES', category: 'Other', photo_urls: [] });
  expectRefused(ad.error);
  const up = await db.storage.from('ad-photos').upload(`00000000-0000-0000-0000-000000000000/ci-${Date.now()}.jpg`, new Uint8Array([0xff, 0xd8, 0xff]), { contentType: 'image/jpeg' });
  expect(up.error).not.toBeNull();
});

// Finding (build 7): the repository grants this check to signed-in people only, but staging also lets visitors run it
// (Supabase's default grants to "anon"). Low risk: it only says whether a profile name is taken, and approved names are public.
// Kept as a record of the real behaviour; reported to the owner, nothing changed.
test('profile name check answers yes/no (visitors can run it on staging — see note)', async () => {
  const res = await db.rpc('shop_name_available', { p_name: 'Amcolink CI name check ' + Date.now() });
  if (res.error) expectRefused(res.error); else expect(typeof res.data).toBe('boolean');
});

test('app query: Wanted list runs on staging as a visitor', async () => {
  await expect(fetchWanted({ signedIn: false, city: 'Nairobi', category: 'Other' }, db)).resolves.toEqual(expect.any(Array));
});

test('app query: Gifts and Trending run on staging as a visitor', async () => {
  await expect(fetchGifts({}, db)).resolves.toEqual(expect.any(Array));
  await expect(fetchGifts({ occasion: 'eid', forWho: 'her', sort: 'price_asc' }, db)).resolves.toEqual(expect.any(Array));
  const t = await getTrending(db, new Set(), 10);
  expect(Array.isArray(t.ads) && Array.isArray(t.shops)).toBe(true);
});
