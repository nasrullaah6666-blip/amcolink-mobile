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
