/**
 * New listing for Shopping and Services (website: components/AdForm.tsx submit). Same checks, same order,
 * same messages, same columns. Houses & Rentals are not posted from the app yet (separate task).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { needsCondition, needsExpiry, subsOf } from '@/core/categories';
import { CONDITIONS } from '@/core/conditions';
import { categoriesInGroup } from '@/core/property';
import { CATEGORIES } from '@/core/types';
import { db } from './db';

export type PriceMode = 'from' | 'fixed' | 'ask';
export type AdDraft = {
  shopId: string; group: 'shop' | 'service' | ''; title: string; description: string; price: string; currency: string;
  category: string; subcategory: string; condition: string; free: boolean; priceMode: PriceMode;
  expiryDate: string; noExpiry: boolean; availability: 'available' | 'reserved' | 'sold'; rulesOk: boolean; photos: string[];
};

const today = () => new Date().toLocaleDateString('en-CA');

/** Returns the website's message for the first problem, or the row to insert. */
export function buildAd(d: AdDraft, ownerId: string): { ok: false; error: string } | { ok: true; row: Record<string, unknown> } {
  const price = d.price.trim();
  if (d.photos.length < 1) return { ok: false, error: 'Add at least one real photo of the item.' };
  if (d.title.trim().length < 2) return { ok: false, error: 'Add a title.' };
  if (d.description.trim().length < 20) return { ok: false, error: "Write a short description (at least 20 characters): size, colour, what's included." };
  if (!d.category) return { ok: false, error: 'Choose a category.' };
  if (!d.rulesOk) return { ok: false, error: 'Tick the box to confirm your listing follows the rules.' };
  if (!d.group) return { ok: false, error: 'Choose what you are posting: Shopping, Services or Properties.' };
  const allowed = d.group === 'service' ? ['Services'] : categoriesInGroup('shop', CATEGORIES);
  if (!allowed.includes(d.category)) return { ok: false, error: 'Choose a category.' };
  const subs = subsOf(d.category);
  if (subs.length && !subs.includes(d.subcategory)) return { ok: false, error: 'Choose what kind of item it is (e.g. Men, Women, Kids).' };
  const isService = d.category === 'Services';
  if (isService && d.priceMode !== 'ask' && !(Number(price) > 0)) return { ok: false, error: 'Add the price, or choose “Ask me”.' };
  if (!isService && price && !d.free && !(Number(price) > 0)) return { ok: false, error: 'The price must be a number above 0.' };
  const withCondition = needsCondition(d.category, d.subcategory);
  if (withCondition && !CONDITIONS.some((c) => c.value === d.condition)) return { ok: false, error: 'Choose the condition: New, Used or Refurbished.' };
  const withExpiry = needsExpiry(d.category, d.subcategory);
  const expiry = withExpiry && !d.noExpiry ? d.expiryDate.trim() : '';
  if (withExpiry && !d.noExpiry && !expiry) return { ok: false, error: 'Add the expiry date, or tick “No expiry date” if it is fresh or unpackaged.' };
  if (expiry && !/^\d{4}-\d{2}-\d{2}$/.test(expiry)) return { ok: false, error: 'Write the expiry date as year-month-day, e.g. 2027-03-31.' };
  if (expiry && expiry < today()) return { ok: false, error: 'This item has expired. Check the expiry date.' };
  return {
    ok: true,
    row: {
      shop_id: d.shopId,
      owner_id: ownerId,
      title: d.title.trim(),
      description: d.description.trim(),
      price: isService ? (d.priceMode === 'ask' ? null : Number(price)) : d.free ? 0 : price ? Number(price) : null,
      ...(isService ? { price_from: d.priceMode === 'from' } : {}),
      currency: d.currency,
      category: d.category,
      subcategory: d.subcategory || null,
      photo_urls: d.photos,
      availability: d.availability,
      condition: withCondition ? d.condition : null,
      ...(withExpiry ? { expiry_date: d.noExpiry ? null : expiry, no_expiry: d.noExpiry } : {}),
    },
  };
}

export async function insertAd(row: Record<string, unknown>, c: SupabaseClient = db()) {
  const { error } = await c.from('ads').insert(row);
  if (error) throw new Error(error.message);
}

/** The listing as loaded for editing (only the fields the edit form uses). */
export type EditableAd = {
  id: string; shop_id: string; title: string; description: string; price: number | null; currency: string; category: string;
  subcategory?: string | null; condition?: string | null; photo_urls: string[]; availability: 'available' | 'reserved' | 'sold';
  expiry_date?: string | null; no_expiry?: boolean; price_from?: boolean;
};

/**
 * Edit a Shopping or Services listing (website: components/AdEditForm.tsx submit). Same checks and messages.
 * Differences on purpose, as on the website: an unchanged expiry date that has since passed is allowed (so the item
 * can still be marked sold); photos may be kept as they are. Property listings are edited on the website for now.
 */
export function buildAdEdit(d: Omit<AdDraft, 'shopId' | 'group' | 'rulesOk'>, ad: EditableAd): { ok: false; error: string } | { ok: true; values: Record<string, unknown>; removedPhotos: string[] } {
  const price = d.price.trim();
  if (d.photos.length < 1) return { ok: false, error: 'Add at least one real photo of the item.' };
  if (d.title.trim().length < 2) return { ok: false, error: 'Add a title.' };
  if (d.description.trim().length < 20) return { ok: false, error: "Write a short description (at least 20 characters): size, colour, what's included." };
  const allowed = categoriesInGroup('shop', CATEGORIES).concat('Services');
  if (d.category !== ad.category && !allowed.includes(d.category)) return { ok: false, error: 'Choose a category.' };
  const subs = subsOf(d.category);
  if (subs.length && !subs.includes(d.subcategory)) return { ok: false, error: 'Choose what kind of item it is (e.g. Men, Women, Kids).' };
  const withCondition = needsCondition(d.category, d.subcategory);
  if (withCondition && !CONDITIONS.some((c) => c.value === d.condition)) return { ok: false, error: 'Choose the condition: New, Used or Refurbished.' };
  const withExpiry = needsExpiry(d.category, d.subcategory);
  const expiry = withExpiry && !d.noExpiry ? d.expiryDate.trim() : '';
  if (withExpiry && !d.noExpiry && !expiry) return { ok: false, error: 'Add the expiry date, or tick “No expiry date” if it is fresh or unpackaged.' };
  if (expiry && !/^\d{4}-\d{2}-\d{2}$/.test(expiry)) return { ok: false, error: 'Write the expiry date as year-month-day, e.g. 2027-03-31.' };
  if (expiry && expiry !== ad.expiry_date && expiry < today()) return { ok: false, error: 'This item has expired. Check the expiry date.' };
  const isService = d.category === 'Services';
  if (isService && d.priceMode !== 'ask' && !(Number(price) > 0)) return { ok: false, error: 'Add the price, or choose “Ask me”.' };
  if (!isService && price && !d.free && !(Number(price) > 0)) return { ok: false, error: 'The price must be a number above 0.' };
  return {
    ok: true,
    values: {
      title: d.title.trim(),
      description: d.description.trim(),
      price: isService ? (d.priceMode === 'ask' ? null : Number(price)) : d.free ? 0 : price ? Number(price) : null,
      ...(isService ? { price_from: d.priceMode === 'from' } : ad.price_from ? { price_from: false } : {}),
      currency: d.currency,
      category: d.category,
      subcategory: d.subcategory || null,
      availability: d.availability,
      condition: withCondition ? d.condition : null,
      ...(withExpiry ? { expiry_date: d.noExpiry ? null : expiry, no_expiry: d.noExpiry } : {}),
      rental: null,
      photo_urls: d.photos,
    },
    removedPhotos: (ad.photo_urls ?? []).filter((u) => !d.photos.includes(u)),
  };
}

export async function fetchEditableAd(id: string, c: SupabaseClient = db()): Promise<EditableAd & { owner_id: string; status: string } | null> {
  const { data, error } = await c.from('ads').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as never;
}

export async function saveAdEdit(id: string, values: Record<string, unknown>, removedPhotos: string[], c: SupabaseClient = db()) {
  const { error } = await c.from('ads').update(values).eq('id', id);
  if (error) throw new Error(error.message);
  // Delete files that were removed from the listing (website does the same; a left-over file is harmless).
  const paths = removedPhotos.map((u) => /\/ad-photos\/(.+)$/.exec(u)?.[1]).filter(Boolean).map((p) => decodeURIComponent(p!));
  if (paths.length) { try { await c.storage.from('ad-photos').remove(paths); } catch { /* ignore */ } }
}
