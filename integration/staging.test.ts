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
  expect(res.error).not.toBeNull();
});

test('signed-out visitors can read the public Wanted columns', async () => {
  const res = await db.from('wanted_posts').select('id,title,city,country,status').limit(1);
  expect(res.error).toBeNull();
});

test('signed-out visitors cannot create a shop', async () => {
  const res = await db.from('shops').insert({ owner_id: '00000000-0000-0000-0000-000000000000', slug: 'ci-should-fail', name: 'CI should fail', city: 'Test' });
  expect(res.error).not.toBeNull();
});

test('signed-out visitors cannot create a report', async () => {
  const res = await db.from('reports').insert({ reason: 'CI should fail', shop_id: '00000000-0000-0000-0000-000000000000' });
  expect(res.error).not.toBeNull();
});

test('signed-out visitors cannot use admin functions', async () => {
  const ban = await db.rpc('admin_set_ban', { target: '00000000-0000-0000-0000-000000000000', banned: true });
  expect(ban.error).not.toBeNull();
  const insights = await db.rpc('insights_summary', { p_days: 7 });
  expect(insights.error).not.toBeNull();
});

test('public trending lists can be read signed out', async () => {
  const res = await db.rpc('trending_shops', { p_days: 7, p_limit: 5 });
  // Function arguments may differ in name; a "function not found" error is reported clearly instead of passing.
  expect(res.error?.message ?? null).toBeNull();
});

test('sign-up without the security check is refused (CAPTCHA is on)', async () => {
  const res = await db.auth.signUp({ email: `ci-${Date.now()}@example.com`, password: 'ci-test-Password-1' });
  expect(res.error).not.toBeNull();
  expect(String(res.error?.message).toLowerCase()).toContain('captcha');
});

test('notifications are private', async () => {
  const res = await db.from('notifications').select('id').limit(1);
  // Either refused or no rows: a signed-out visitor must never see notifications.
  expect(res.error !== null || (res.data ?? []).length === 0).toBe(true);
});
