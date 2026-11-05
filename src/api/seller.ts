/**
 * Seller side: the person's own profiles (shops) and ads. Same tables, columns and rules as the website
 * (app/dashboard, components/ShopForm, ItemActions, ConfirmAllButton). Row-level security limits every
 * change to the owner's own rows; the database also re-checks shop and ad rules (validate_shop, guards).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Shop } from '@/core/types';
import { deletePhotos } from '@/core/deletePhotos';
import { saveShop } from '@/core/saveShop';
import type { ShopValues } from '@/core/shop';
import { db, must } from './db';

export async function fetchMyShops(userId: string, c: SupabaseClient = db()): Promise<Shop[]> {
  return must(await c.from('shops').select('*').eq('owner_id', userId).order('created_at', { ascending: false })) as Shop[];
}

/** Website NameInput: is the profile name free? null when the check could not run. */
export async function nameAvailable(name: string, shopId?: string, c: SupabaseClient = db()): Promise<boolean | null> {
  const { data, error } = await c.rpc('shop_name_available', { p_name: name, ...(shopId ? { p_shop: shopId } : {}) });
  return error ? null : Boolean(data);
}

/** Website ShopForm slug rule: name in lower case with dashes, plus 4 random letters. */
export const makeSlug = (name: string) =>
  name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).slice(2, 6);

export async function createShop(userId: string, v: ShopValues, c: SupabaseClient = db()): Promise<void> {
  const error = await saveShop(c, { ...v, owner_id: userId, slug: makeSlug(v.name), logo_url: null, cover_url: null });
  if (error) throw new Error(error.message);
}

export const MY_AD_COLUMNS = 'id,shop_id,title,price,currency,category,status,availability,hidden_by_owner,pinned_at,photo_urls,confirmed_at,review_reason,created_at,rental';
export type MyAd = {
  id: string; shop_id: string; title: string; price: number | null; currency: string; category: string; status: string;
  availability: 'available' | 'reserved' | 'sold'; hidden_by_owner: boolean | null; pinned_at: string | null; photo_urls: string[] | null;
  confirmed_at: string | null; review_reason: string | null; created_at: string;
};

export async function fetchMyAds(shopIds: string[], c: SupabaseClient = db()): Promise<MyAd[]> {
  if (!shopIds.length) return [];
  const light = await c.from('ads').select(MY_AD_COLUMNS).in('shop_id', shopIds).order('created_at', { ascending: false });
  const res = light.error ? await c.from('ads').select('*').in('shop_id', shopIds).order('created_at', { ascending: false }) : light;
  return must(res) as unknown as MyAd[];
}

export type Stat = { shop_id: string; ad_id: string | null; views: number; whatsapp: number; calls: number; shares: number };
export async function fetchMyStats(c: SupabaseClient = db()): Promise<Stat[]> {
  const { data, error } = await c.rpc('my_listing_stats', { p_days: 30 });
  if (error) return []; // stats are extra: never block the page
  return (data ?? []) as Stat[];
}

/** Still available / Reserved / Sold. Setting the same value again confirms the ad (website ConfirmLine). */
export async function setAvailability(adId: string, next: MyAd['availability'], c: SupabaseClient = db()) {
  const { error } = await c.from('ads').update({ availability: next }).eq('id', adId);
  if (error) throw new Error(error.message);
}

export async function updateAd(adId: string, values: Record<string, unknown>, c: SupabaseClient = db()) {
  const { error } = await c.from('ads').update(values).eq('id', adId);
  if (error) throw new Error(/pinned_at/.test(error.message) ? 'Pinning isn’t switched on yet. Try again later.' : error.message);
}

export async function deleteAd(adId: string, photos: string[], c: SupabaseClient = db()) {
  const { error } = await c.from('ads').delete().eq('id', adId);
  if (error) throw new Error(error.message);
  await deletePhotos(c, photos, 'ad-photos');
}

/** Website ConfirmAllButton: every live ad shows as available today. */
export async function confirmAll(userId: string, c: SupabaseClient = db()) {
  const { error } = await c.from('ads').update({ confirmed_at: new Date().toISOString() })
    .eq('owner_id', userId).eq('status', 'published').neq('availability', 'sold');
  if (error) throw new Error(error.message);
}

/** Save Edit profile (website: components/ShopEditForm.tsx → saveShop on the shop's id). */
export async function updateShop(shopId: string, row: Record<string, unknown>, c: SupabaseClient = db()): Promise<void> {
  const error = await saveShop(c, row, shopId, ['property_role']);
  if (error) throw new Error(error.message);
}
