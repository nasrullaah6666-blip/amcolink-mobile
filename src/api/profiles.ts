import type { SupabaseClient } from '@supabase/supabase-js';
import { db, must } from '@/api/db';
import { groupFilter, type Group } from '@/core/property';
import { sanitizeSearch } from '@/core/utils';
import { getTrust, type Trust } from '@/core/trust';
import { boxAround, distanceKm, type Point } from '@/core/distance';
import { cityPattern } from '@/core/similar';
import { guessBuyerCity } from '@/api/nearby';

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
export async function fetchProfiles(kind: Group, f: { q?: string; city?: string; exactCity?: boolean; country?: string; page?: number }, c: SupabaseClient = db()) {
  const q = sanitizeSearch(f.q);
  const city = sanitizeSearch(f.city);
  let qy = groupFilter(c.from('shops').select('id,slug,name,city,region,country,logo_url,cover_url,is_verified,description').eq('status', 'approved'), kind);
  if (q) qy = qy.ilike('name', `%${q}%`);
  // A town picked from the list is matched exactly (website); typed text matches town or region.
  if (city) qy = f.exactCity ? qy.ilike('city', city) : qy.or(`city.ilike.%${city}%,region.ilike.%${city}%`);
  if (f.country) qy = qy.eq('country', f.country);
  qy = qy.order('is_verified', { ascending: false });
  qy = city ? qy.order('name', { ascending: true }) : qy.order('created_at', { ascending: false });
  const from = (f.page ?? 0) * PROFILES_PAGE;
  const rows = must(await qy.range(from, from + PROFILES_PAGE - 1)) as ProfileRow[];
  const trust: Map<string, Trust> = rows.length ? await getTrust(c, rows.map((r) => r.id)).catch(() => new Map()) : new Map();
  return rows.map((r) => ({ ...r, trust: trust.get(r.id) ?? null }));
}

/**
 * Towns that have profiles of this kind, with counts (website: getShopPlaces + the directory's grouping).
 * Region (or country when All countries) is shown as the hint; sorted A–Z. Exact town match when picked.
 */
export async function fetchProfilePlaces(kind: Group, country: string | undefined, c: SupabaseClient = db()) {
  let qy = groupFilter(c.from('shops').select('city,region,country').eq('status', 'approved').limit(5000), kind);
  if (country) qy = qy.eq('country', country);
  const rows = must(await qy) as { city: string | null; region: string | null; country: string }[];
  const map = new Map<string, { name: string; hint: string; count: number }>();
  for (const r of rows) {
    if (!r.city) continue;
    const key = `${r.country}|${r.city.trim().toLowerCase()}`;
    const cur = map.get(key);
    if (cur) cur.count++; else map.set(key, { name: r.city.trim(), hint: country ? (r.region ?? '') : r.country, count: 1 });
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Near me for profiles (website: ShopsDirectory with ?near=): profiles that shared a map pin inside the radius,
 * closest first; then profiles in the buyer's town without a pin (no distance).
 */
export async function fetchProfilesNear(kind: Group, p: Point, radiusKm: number, c: SupabaseClient = db()) {
  const base = () => groupFilter(c.from('shops').select('id,slug,name,city,region,country,logo_url,cover_url,is_verified,description,lat,lng').eq('status', 'approved'), kind);
  const b = boxAround(p, radiusKm);
  const boxed = must(await base().gte('lat', b.minLat).lte('lat', b.maxLat).gte('lng', b.minLng).lte('lng', b.maxLng).limit(300)) as (ProfileRow & { lat: number; lng: number })[];
  const rows: (ProfileRow & { km: number | null })[] = boxed
    .map((x) => ({ ...x, km: distanceKm(p, { lat: x.lat, lng: x.lng }) }))
    .filter((x) => (x.km ?? Infinity) <= radiusKm).sort((x, y) => (x.km ?? 0) - (y.km ?? 0));
  const city = await guessBuyerCity(c, p);
  const pattern = city ? cityPattern(city) : '';
  if (pattern) {
    const same = must(await base().is('lat', null).ilike('city', `%${pattern}%`).order('created_at', { ascending: false }).limit(300)) as ProfileRow[];
    const seen = new Set(rows.map((x) => x.id));
    for (const x of same) if (!seen.has(x.id)) rows.push({ ...x, km: null });
  }
  const top = rows.slice(0, 100);
  const trust: Map<string, Trust> = top.length ? await getTrust(c, top.map((r) => r.id)).catch(() => new Map()) : new Map();
  return { rows: top.map((r) => ({ ...r, trust: trust.get(r.id) ?? null })), city };
}
