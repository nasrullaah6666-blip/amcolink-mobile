// Copied from the Amcolink website repo, lib/freshness.ts at commit 22b64ce6 (only import paths and env names adapted). The website is the source of truth: update both together.
// "Still available" freshness rules. Sellers confirm listings with one tap; listings not
// confirmed for FRESH_DAYS drop out of search until the seller confirms again.
export const FRESH_DAYS = 14;
export const NUDGE_DAYS = 7;
/** Houses and rooms (rent and sale) take longer to let or sell: they stay listed for 30 days per confirmation. */
export const PROPERTY_FRESH_DAYS = 30;
const PROPERTY_CATEGORY = "Houses & Rentals";

/** Days a listing stays listed after its last "still available" confirmation (property 30, everything else 14). */
export function freshDaysFor(category?: string | null): number {
  return category === PROPERTY_CATEGORY ? PROPERTY_FRESH_DAYS : FRESH_DAYS;
}

/** From this age on, the seller is asked to confirm (one week before the listing would drop out). */
export function nudgeDaysFor(category?: string | null): number {
  return freshDaysFor(category) - (FRESH_DAYS - NUDGE_DAYS);
}
export const DEAL_DAYS = 7;
/** Minimum discount for the Deals tab and the home "Deals" row. */
export const BIG_DEAL_PERCENT = 30;

const DAY = 86_400_000;

export function cutoffIso(days: number): string {
  return new Date(Date.now() - days * DAY).toISOString();
}

export function daysSince(iso?: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? Math.max(0, Math.floor((Date.now() - t) / DAY)) : null;
}

/** "today", "yesterday", "3 days ago" */
export function agoLabel(iso?: string | null): string {
  const d = daysSince(iso);
  if (d === null) return "";
  return d === 0 ? "today" : d === 1 ? "yesterday" : `${d} days ago`;
}

export function isFresh(iso?: string | null, category?: string | null): boolean {
  const d = daysSince(iso);
  return d !== null && d < freshDaysFor(category);
}

/** Returns the % drop when the listing is a current deal, otherwise null. */
export function dealPercent(ad: { price: number | null; previous_price?: number | null; price_dropped_at?: string | null }): number | null {
  if (ad.price === null || ad.previous_price == null || !ad.price_dropped_at) return null;
  const d = daysSince(ad.price_dropped_at);
  if (d === null || d >= DEAL_DAYS) return null;
  const prev = Number(ad.previous_price);
  const pct = Math.round((1 - Number(ad.price) / prev) * 100);
  return pct >= 5 && pct < 100 ? pct : null;
}
