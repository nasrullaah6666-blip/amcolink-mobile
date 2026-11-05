import type { SupabaseClient } from '@supabase/supabase-js';
import { db, must } from '@/api/db';
import type { Listing } from '@/api/listings';
import { cutoffIso, FRESH_DAYS } from '@/core/freshness';
import { boxAround, distanceKm, type Point } from '@/core/distance';
import { cityPattern } from '@/core/similar';

/** Website: NEAR_MAX in app/page.tsx — listings fetched before sorting by distance. */
const NEAR_MAX = 300;
const SELECT = '*, shops!inner(id,name,slug,city,region,country,is_verified,status,lat,lng)';

/**
 * Website: lib/nearby.ts guessBuyerCity — the buyer's town without any outside map service:
 * the town of the closest profile that shared its location (within 15 km).
 */
export async function guessBuyerCity(s: SupabaseClient, p: Point, withinKm = 15): Promise<string | null> {
  const b = boxAround(p, withinKm);
  const { data } = await s.from('shops').select('city,lat,lng').eq('status', 'approved')
    .gte('lat', b.minLat).lte('lat', b.maxLat).gte('lng', b.minLng).lte('lng', b.maxLng).limit(300);
  let best: { city: string; km: number } | null = null;
  for (const row of (data || []) as { city: string; lat: number; lng: number }[]) {
    if (!row.city) continue;
    const km = distanceKm(p, { lat: row.lat, lng: row.lng });
    if (km <= withinKm && (!best || km < best.km)) best = { city: row.city, km };
  }
  return best?.city || null;
}

export type NearRow = Listing & { km: number | null };

/**
 * Near me (website: Home with ?near=): 1) profiles that shared their location, inside the radius, closest first;
 * 2) then listings from the buyer's town whose profile never shared a location (no distance shown).
 * Any country (works by distance). Blocked profiles are left out by the caller.
 */
export async function fetchNear(p: Point, radiusKm: number, c: SupabaseClient = db()): Promise<{ rows: NearRow[]; city: string | null }> {
  const live = () => c.from('ads').select(SELECT)
    .eq('status', 'published').in('availability', ['available', 'reserved'])
    .gte('confirmed_at', cutoffIso(FRESH_DAYS)).eq('shops.status', 'approved');
  const b = boxAround(p, radiusKm);
  const near = must(await live().gte('shops.lat', b.minLat).lte('shops.lat', b.maxLat).gte('shops.lng', b.minLng).lte('shops.lng', b.maxLng)
    .order('created_at', { ascending: false }).limit(NEAR_MAX)) as Listing[];
  const rows: NearRow[] = near.map((ad) => {
    const s = ad.shops as unknown as { lat?: number | null; lng?: number | null } | null;
    const km = s?.lat != null && s?.lng != null ? distanceKm(p, { lat: s.lat, lng: s.lng }) : Infinity;
    return { ...ad, km };
  }).filter((a) => (a.km ?? Infinity) <= radiusKm).sort((x, y) => (x.km ?? 1e6) - (y.km ?? 1e6));
  const city = await guessBuyerCity(c, p);
  if (city) {
    const pattern = cityPattern(city);
    if (pattern) {
      const same = must(await live().is('shops.lat', null).ilike('shops.city', `%${pattern}%`).order('created_at', { ascending: false }).limit(NEAR_MAX)) as Listing[];
      const seen = new Set(rows.map((a) => a.id));
      for (const ad of same) if (!seen.has(ad.id)) rows.push({ ...ad, km: null });
    }
  }
  return { rows, city };
}
