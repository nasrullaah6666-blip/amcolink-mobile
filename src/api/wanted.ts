/** Wanted requests (website: app/wanted, components/WantedForm, WantedOwnerActions). */
import type { SupabaseClient } from '@supabase/supabase-js';
import { countryByName } from '@/core/geo';
import { normalizePhone } from '@/core/phone';
import { sanitizeSearch } from '@/core/utils';
import { db, must } from './db';

export const WANTED_PAGE = 30;
const PUBLIC_COLUMNS = 'id,user_id,title,details,category,country,city,budget,currency,poster_name,status,created_at';

export type WantedPost = {
  id: string; user_id?: string; title: string; details: string; category: string; country: string; city: string;
  budget: number | null; currency: string; poster_name: string; status: string; created_at: string; whatsapp?: string;
};

/**
 * Open requests (or my own). Signed-in members also get the buyer's WhatsApp number; visitors only see the request
 * (the database enforces this: visitors cannot read the whatsapp column).
 */
export async function fetchWanted(o: { signedIn: boolean; mineUserId?: string; city?: string; category?: string; page?: number }, c: SupabaseClient = db()): Promise<WantedPost[]> {
  const from = (o.page ?? 0) * WANTED_PAGE;
  let q = c.from('wanted_posts').select(o.signedIn ? `${PUBLIC_COLUMNS},whatsapp` : PUBLIC_COLUMNS.replace('user_id,', ''))
    .order('created_at', { ascending: false }).range(from, from + WANTED_PAGE - 1);
  if (o.mineUserId) q = q.eq('user_id', o.mineUserId).neq('status', 'removed');
  else q = q.eq('status', 'open').gt('expires_at', new Date().toISOString());
  const city = sanitizeSearch(o.city);
  if (city) q = q.ilike('city', `%${city}%`);
  if (o.category) q = q.eq('category', o.category);
  return must(await q) as unknown as WantedPost[];
}

export type WantedDraft = { title: string; details: string; category: string; budget: string; currency: string; country: string; city: string; whatsapp: string };

/** Website WantedForm checks, same messages. */
export function buildWanted(d: WantedDraft, userId: string): { ok: false; error: string } | { ok: true; row: Record<string, unknown> } {
  const title = d.title.trim();
  const city = d.city.trim();
  const budgetRaw = d.budget.replace(/[^\d.]/g, '');
  const budget = budgetRaw ? Number(budgetRaw) : null;
  const countryName = countryByName(d.country)?.name;
  const whatsapp = normalizePhone(d.whatsapp, countryName || 'Kenya');
  if (title.length < 3) return { ok: false, error: 'Say what you are looking for (at least 3 letters).' };
  if (!countryName) return { ok: false, error: 'Please choose a country from the list.' };
  if (!city) return { ok: false, error: 'Add your city or town.' };
  if (!whatsapp) return { ok: false, error: 'WhatsApp number looks wrong. Use your local number, e.g. 0712 345 678.' };
  if (budget !== null && !(budget >= 0 && budget < 1e12)) return { ok: false, error: 'Please enter a sensible budget.' };
  return { ok: true, row: { user_id: userId, title: title.slice(0, 100), details: d.details.trim().slice(0, 1000), category: d.category || 'Other', country: countryName, city: city.slice(0, 60), budget, currency: d.currency, whatsapp } };
}

export async function insertWanted(row: Record<string, unknown>, c: SupabaseClient = db()) {
  const { error } = await c.from('wanted_posts').insert(row);
  if (error) throw new Error(error.message);
}

export async function wantedAction(id: string, action: 'found' | 'reopen' | 'delete', c: SupabaseClient = db()) {
  const t = c.from('wanted_posts');
  const { error } = action === 'delete' ? await t.delete().eq('id', id) : await t.update({ status: action === 'found' ? 'found' : 'open' }).eq('id', id);
  if (error) throw new Error(error.message);
}
