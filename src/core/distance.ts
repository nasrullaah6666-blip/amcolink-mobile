// Copied from the website: lib/distance.ts (commit 13076bf7). Keep in step with the website.
export type Point = { lat: number; lng: number };

/** Reads "lat,lng" from the URL. Rounded to ~0.5 km so exact locations never end up in links or logs. */
export function parseNear(value?: string | null): Point | null {
  if (!value) return null;
  const m = /^(-?\d{1,2}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)$/.exec(value.trim());
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  if (!(lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180)) return null;
  return { lat: snap(lat), lng: snap(lng) };
}

/** Rounds a coordinate to a 0.005° grid (about 0.5 km), so exact spots are never stored or shared. */
export function snap(v: number): number {
  return Math.round(v * 200) / 200;
}

export function nearParam(p: Point): string {
  return `${snap(p.lat).toFixed(3)},${snap(p.lng).toFixed(3)}`;
}

/** Radius choices for "Near me", in km. */
export const RADII = [2, 5, 10, 25, 50] as const;
export const DEFAULT_RADIUS = 10;
export function parseRadius(v?: string | null): number {
  const n = Number(v);
  return (RADII as readonly number[]).includes(n) ? n : DEFAULT_RADIUS;
}

/** Great-circle distance in km. */
export function distanceKm(a: Point, b: Point): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Bounding box around a point, for a quick database filter before exact sorting. */
export function boxAround(p: Point, km: number) {
  const dLat = km / 111;
  const dLng = km / (111 * Math.max(0.2, Math.cos((p.lat * Math.PI) / 180)));
  return { minLat: p.lat - dLat, maxLat: p.lat + dLat, minLng: p.lng - dLng, maxLng: p.lng + dLng };
}

/** Distances are shown in 0.5 km steps (locations are only accurate to about 0.5 km). */
export function formatKm(km: number): string {
  if (km < 0.5) return "under 0.5 km away";
  if (km >= 10) return `about ${Math.round(km)} km away`;
  const half = Math.round(km * 2) / 2;
  return `about ${Number.isInteger(half) ? half.toFixed(0) : half.toFixed(1)} km away`;
}
