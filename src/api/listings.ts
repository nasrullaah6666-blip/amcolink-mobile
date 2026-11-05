/**
 * Listing and shop queries. Each one copies the website's query rules (source noted), so the app shows
 * exactly what the website shows: published ads of approved shops, confirmed in the last 14 days, verified sellers first.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Ad, Shop } from '@/core/types';
import { BIG_DEAL_PERCENT, cutoffIso, DEAL_DAYS, dealPercent, FRESH_DAYS } from '@/core/freshness';
import { RENTAL } from '@/core/rentals';
import { searchWords, wordFilter, rankByRelevance } from '@/core/searchWords';
import { sanitizeSearch } from '@/core/utils';
import { db, must, mustOne } from './db';

export type ShopLite = Pick<Shop, 'id' | 'name' | 'slug' | 'city' | 'country' | 'is_verified' | 'status'> & { region?: string | null };
export type Listing = Ad & { shops: ShopLite | null };

export const PAGE_SIZE = 24;
// Same shop fields the website loads with each listing (lib/publicData.ts).
const LISTING_SELECT = '*, shops!inner(id,name,slug,city,region,country,is_verified,status)';

/** Published, available or reserved, confirmed recently, approved shop — the website's feed rules. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function liveListings(c: SupabaseClient): any {
  return c.from('ads').select(LISTING_SELECT)
    .eq('status', 'published').in('availability', ['available', 'reserved'])
    .gte('confirmed_at', cutoffIso(FRESH_DAYS)).eq('shops.status', 'approved');
}

/** Home "The latest finds" (website: getLatestListings). Property and services included, as on the website. */
export async function fetchLatest(opts: { country?: string; page?: number } = {}, c: SupabaseClient = db()): Promise<Listing[]> {
  const from = (opts.page ?? 0) * PAGE_SIZE;
  let q = liveListings(c);
  if (opts.country) q = q.eq('shops.country', opts.country);
  const res = await q.order('feed_boost', { ascending: false }).order('created_at', { ascending: false }).range(from, from + PAGE_SIZE - 1);
  return must(res) as Listing[];
}

export type CategoryFilters = {
  category: string; sub?: string; q?: string; city?: string; min?: number; max?: number;
  condition?: string; verified?: boolean; sort?: 'price_asc' | 'price_desc'; country?: string; page?: number;
};

/** One category page (website: app/category/[slug]/page.tsx). */
export async function fetchCategory(f: CategoryFilters, c: SupabaseClient = db()): Promise<Listing[]> {
  const from = (f.page ?? 0) * PAGE_SIZE;
  let q = liveListings(c).eq('category', f.category);
  if (f.sub) q = q.eq('subcategory', f.sub);
  if (f.country) q = q.eq('shops.country', f.country);
  const text = sanitizeSearch(f.q);
  if (text) for (const w of searchWords(text)) q = q.or(wordFilter(w));
  const city = sanitizeSearch(f.city);
  if (city) q = q.or(`city.ilike.%${city}%,region.ilike.%${city}%`, { referencedTable: 'shops' });
  if (f.min != null) q = q.gte('price', f.min);
  if (f.max != null) q = q.lte('price', f.max);
  if (f.condition) q = q.eq('condition', f.condition);
  if (f.verified) q = q.eq('shops.is_verified', true);
  q = q.order('feed_boost', { ascending: false });
  if (f.sort === 'price_asc') q = q.order('price', { ascending: true, nullsFirst: false });
  else if (f.sort === 'price_desc') q = q.order('price', { ascending: false, nullsFirst: false });
  q = q.order('created_at', { ascending: false });
  const ranked = Boolean(text) && !f.sort; // typed search: closest title first (as on the website)
  const res = await (ranked ? q.range(0, 119) : q.range(from, from + PAGE_SIZE - 1));
  const rows = must(res) as Listing[];
  return ranked ? rankByRelevance(rows, text, (a: Listing) => a.title).slice(from, from + PAGE_SIZE) : rows;
}

/** Search across every category (the website's home search uses the same word rules). */
export async function fetchSearch(text: string, opts: { country?: string; page?: number } = {}, c: SupabaseClient = db()): Promise<Listing[]> {
  const clean = sanitizeSearch(text);
  if (!clean) return [];
  let q = liveListings(c);
  if (opts.country) q = q.eq('shops.country', opts.country);
  for (const w of searchWords(clean)) q = q.or(wordFilter(w));
  const res = await q.order('feed_boost', { ascending: false }).order('created_at', { ascending: false }).range(0, 119);
  const from = (opts.page ?? 0) * PAGE_SIZE;
  return rankByRelevance(must(res) as Listing[], clean, (a: Listing) => a.title).slice(from, from + PAGE_SIZE);
}

export type PropertyFilters = { deal: 'rent' | 'sale'; type?: string; area?: string; country?: string; page?: number };

/** Properties for rent or sale (website: components/PropertyMarket.tsx). */
export async function fetchProperties(f: PropertyFilters, c: SupabaseClient = db()): Promise<Listing[]> {
  const from = (f.page ?? 0) * PAGE_SIZE;
  let q = c.from('ads').select(LISTING_SELECT)
    .eq('status', 'published').eq('category', RENTAL).eq('transaction_type', f.deal)
    .in('availability', ['available', 'reserved']).eq('shops.status', 'approved');
  if (f.country) q = q.eq('shops.country', f.country);
  const area = sanitizeSearch(f.area);
  if (area) q = q.or(`rental->>area.ilike.%${area}%,title.ilike.%${area}%`);
  if (f.type) q = q.eq('rental->>type', f.type);
  const res = await q.order('feed_boost', { ascending: false }).order('created_at', { ascending: false }).range(from, from + PAGE_SIZE - 1);
  return must(res) as Listing[];
}

/** One listing with its shop (website: app/ads/[id]/page.tsx). Returns null when not found or not visible. */
export async function fetchListing(id: string, c: SupabaseClient = db()): Promise<(Ad & { shops: Shop | null }) | null> {
  const res = await c.from('ads').select('*, shops(*)').eq('id', id).maybeSingle();
  return mustOne(res) as (Ad & { shops: Shop | null }) | null;
}

/** A shop profile by its address name (website: app/shops/[slug]/page.tsx). */
export async function fetchShop(slug: string, c: SupabaseClient = db()): Promise<Shop | null> {
  const res = await c.from('shops').select('*').eq('slug', slug).maybeSingle();
  return mustOne(res) as Shop | null;
}

/** All published ads of one shop, newest first (website: same page). */
export async function fetchShopListings(shopId: string, c: SupabaseClient = db()): Promise<Listing[]> {
  const res = await c.from('ads').select('*,shops(id,name,slug,city,is_verified)')
    .eq('shop_id', shopId).eq('status', 'published').order('created_at', { ascending: false }).limit(500);
  return must(res) as Listing[];
}

export type CollectionKind = 'deals' | 'free' | 'used' | 'new';

/**
 * Explore collections. Rules copied from the website pages:
 * deals → app/deals (price dropped 30%+ in the last 7 days, biggest discount first, verified first),
 * free → app/free (price 0), used → app/used (used or refurbished), new → Home with condition=new.
 */
export async function fetchCollection(kind: CollectionKind, opts: { category?: string; country?: string; page?: number } = {}, c: SupabaseClient = db()): Promise<Listing[]> {
  const from = (opts.page ?? 0) * PAGE_SIZE;
  let q = kind === 'new'
    ? liveListings(c).eq('condition', 'new')
    : c.from('ads').select(LISTING_SELECT).eq('status', 'published').eq('availability', 'available').eq('shops.status', 'approved');
  if (opts.country) q = q.eq('shops.country', opts.country);
  if (opts.category) q = q.eq('category', opts.category);
  if (kind === 'deals') {
    q = q.not('previous_price', 'is', null).gte('price_dropped_at', cutoffIso(DEAL_DAYS)).gte('confirmed_at', cutoffIso(FRESH_DAYS))
      .order('feed_boost', { ascending: false }).order('price_dropped_at', { ascending: false }).limit(400);
    const all = (must(await q) as Listing[]).filter((a) => (dealPercent(a) || 0) >= BIG_DEAL_PERCENT);
    const vf = (a: Listing, b: Listing) => Number(Boolean(b.feed_boost)) - Number(Boolean(a.feed_boost));
    all.sort((a, b) => vf(a, b) || (dealPercent(b) || 0) - (dealPercent(a) || 0));
    return all.slice(from, from + PAGE_SIZE);
  }
  if (kind === 'free') q = q.eq('price', 0);
  if (kind === 'used') q = q.in('condition', ['used', 'refurbished']);
  const res = await q.order('feed_boost', { ascending: false }).order('created_at', { ascending: false }).range(from, from + PAGE_SIZE - 1);
  return must(res) as Listing[];
}

/** Gifts (website: app/gifts): items sellers tagged as gifts, by occasion and/or who it is for. */
export async function fetchGifts(f: { occasion?: string; forWho?: string; sort?: 'price_asc' | 'price_desc'; country?: string; page?: number }, c: SupabaseClient = db()): Promise<Listing[]> {
  const from = (f.page ?? 0) * PAGE_SIZE;
  let q = c.from('ads').select(LISTING_SELECT).eq('status', 'published').eq('availability', 'available').eq('shops.status', 'approved');
  if (f.country) q = q.eq('shops.country', f.country);
  if (f.occasion) q = q.contains('gift_occasions', [f.occasion]);
  if (f.forWho) q = q.contains('gift_for', [f.forWho]);
  if (!f.occasion && !f.forWho) q = q.or('gift_occasions.neq.{},gift_for.neq.{}');
  if (f.sort === 'price_asc') q = q.order('price', { ascending: true, nullsFirst: false });
  if (f.sort === 'price_desc') q = q.order('price', { ascending: false, nullsFirst: false });
  const res = await q.order('feed_boost', { ascending: false }).order('created_at', { ascending: false }).range(from, from + PAGE_SIZE - 1);
  return must(res) as Listing[];
}
