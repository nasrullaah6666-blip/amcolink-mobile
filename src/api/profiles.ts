import type { SupabaseClient } from '@supabase/supabase-js';
import { db, must } from '@/api/db';
import { groupFilter, type Group } from '@/core/property';
import { sanitizeSearch } from '@/core/utils';
import { getTrust, type Trust } from '@/core/trust';

export const PROFILES_PAGE = 24;
export type ProfileRow = {
  id: string; slug: string; name: string; city: string | null; region: string | null; country: string | null;
  logo_url: string | null; cover_url: string | null; is_verified: boolean; description: string | null;
};

/**
 * Profiles directory (website: components/ShopsDirectory.tsx for /shops and /services):
 * approved profiles with live ads in that group; search by name; town matches town or region; verified first;
 * newest first, or A–Z when a town is chosen. Blocked profiles are left out by the caller.
 */
export async function fetchProfiles(kind: Group, f: { q?: string; city?: string; country?: string; page?: number }, c: SupabaseClient = db()) {
  const q = sanitizeSearch(f.q);
  const city = sanitizeSearch(f.city);
  let qy = groupFilter(c.from('shops').select('id,slug,name,city,region,country,logo_url,cover_url,is_verified,description').eq('status', 'approved'), kind);
  if (q) qy = qy.ilike('name', `%${q}%`);
  if (city) qy = qy.or(`city.ilike.%${city}%,region.ilike.%${city}%`);
  if (f.country) qy = qy.eq('country', f.country);
  qy = qy.order('is_verified', { ascending: false });
  qy = city ? qy.order('name', { ascending: true }) : qy.order('created_at', { ascending: false });
  const from = (f.page ?? 0) * PROFILES_PAGE;
  const rows = must(await qy.range(from, from + PROFILES_PAGE - 1)) as ProfileRow[];
  const trust: Map<string, Trust> = rows.length ? await getTrust(c, rows.map((r) => r.id)).catch(() => new Map()) : new Map();
  return rows.map((r) => ({ ...r, trust: trust.get(r.id) ?? null }));
}
