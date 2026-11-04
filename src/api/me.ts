/**
 * The signed-in person's own things: saved listings and shops, reports, blocked shops.
 * Same tables and rules as the website (components/FavoriteButton, ReportButton, BlockButton; app/favorites).
 * Row-level security on the database makes sure a person only ever touches their own rows.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { db, must } from './db';

export type SavedIds = { ads: Set<string>; shops: Set<string> };

export async function fetchSavedIds(userId: string, c: SupabaseClient = db()): Promise<SavedIds> {
  const rows = must(await c.from('favorites').select('shop_id,ad_id').eq('user_id', userId)) as { shop_id: string | null; ad_id: string | null }[];
  const ads = new Set<string>(); const shops = new Set<string>();
  for (const f of rows) { if (f.ad_id) ads.add(f.ad_id); if (f.shop_id) shops.add(f.shop_id); }
  return { ads, shops };
}

/** Save or un-save one listing or shop. Returns the new state (true = saved). */
export async function toggleFavorite(userId: string, target: { adId?: string; shopId?: string }, c: SupabaseClient = db()): Promise<boolean> {
  const base = c.from('favorites').select('id').eq('user_id', userId);
  const res = target.shopId
    ? await base.eq('shop_id', target.shopId).is('ad_id', null).maybeSingle()
    : await base.eq('ad_id', target.adId!).is('shop_id', null).maybeSingle();
  if (res.error) throw new Error(res.error.message);
  if (res.data) {
    const { error } = await c.from('favorites').delete().eq('id', (res.data as { id: string }).id);
    if (error) throw new Error(error.message);
    return false;
  }
  const { error } = await c.from('favorites').insert({ user_id: userId, shop_id: target.shopId ?? null, ad_id: target.adId ?? null });
  if (error && error.code !== '23505') throw new Error(error.message);
  return true;
}

export type SavedItem = {
  id: string;
  shop: { id: string; name: string; slug: string; city: string | null; logo_url: string | null } | null;
  ad: { id: string; title: string; photo_urls: string[] | null; price: number | null; currency: string | null; availability: string | null; previous_price: number | null; price_dropped_at: string | null } | null;
};

/** The Saved list (website app/favorites): newest first; items that are no longer visible are skipped. */
export async function fetchSavedItems(userId: string, c: SupabaseClient = db()): Promise<SavedItem[]> {
  const rows = must(await c.from('favorites')
    .select('id,shop_id,ad_id,shops(id,name,slug,city,logo_url),ads(id,title,photo_urls,price,currency,availability,previous_price,price_dropped_at)')
    .eq('user_id', userId).order('created_at', { ascending: false })) as unknown as Record<string, unknown>[];
  const one = (v: unknown) => (Array.isArray(v) ? v[0] : v) ?? null;
  return rows
    .map((f) => ({ id: f.id as string, shop: f.shop_id ? one(f.shops) : null, ad: f.ad_id ? one(f.ads) : null }) as SavedItem)
    .filter((f) => f.shop || f.ad);
}

/** Report a listing or shop. The chosen reason comes first so reports can be counted by type (website rule). */
export function reportText(choice: string, note: string): string | null {
  const extra = note.trim();
  if (!choice) return null;
  if (choice === 'Other' && extra.length < 3) return null;
  return (choice === 'Other' ? extra : extra ? `${choice}: ${extra}` : choice).slice(0, 500);
}

export async function sendReport(userId: string, target: { adId?: string; shopId?: string }, reason: string, c: SupabaseClient = db()): Promise<'sent' | 'already'> {
  const { error } = await c.from('reports').insert({ reporter_id: userId, shop_id: target.shopId ?? null, ad_id: target.adId ?? null, reason });
  if (error) {
    if (error.code === '23505') return 'already';
    throw new Error(error.message);
  }
  return 'sent';
}

export async function fetchBlockedIds(userId: string, c: SupabaseClient = db()): Promise<Set<string>> {
  const rows = must(await c.from('blocked_shops').select('shop_id').eq('user_id', userId).limit(200)) as { shop_id: string }[];
  return new Set(rows.map((r) => r.shop_id));
}

export async function setBlocked(userId: string, shopId: string, block: boolean, c: SupabaseClient = db()): Promise<void> {
  const { error } = block
    ? await c.from('blocked_shops').insert({ user_id: userId, shop_id: shopId })
    : await c.from('blocked_shops').delete().eq('user_id', userId).eq('shop_id', shopId);
  if (error && error.code !== '23505') throw new Error(error.message);
}

export async function fetchBlockedShops(userId: string, c: SupabaseClient = db()): Promise<{ id: string; name: string; slug: string }[]> {
  const rows = must(await c.from('blocked_shops').select('shop_id, shops(id,name,slug)').eq('user_id', userId).order('created_at', { ascending: false }).limit(200)) as unknown as { shops: unknown }[];
  return rows.map((b) => (Array.isArray(b.shops) ? b.shops[0] : b.shops)).filter(Boolean) as { id: string; name: string; slug: string }[];
}
