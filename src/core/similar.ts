// Copied from the website: lib/similar.ts + cityPattern from lib/nearby.ts (commit 13076bf7). Keep in step with the website.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Ad } from "@/core/types";
import { cutoffIso, FRESH_DAYS } from "@/core/freshness";

export function cityPattern(city: string): string {
  return city.replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 60);
}

/**
 * "Similar items": same category, still available, from other listings — same town first,
 * then anywhere — closest in price to the item being viewed.
 */
export async function getSimilarAds(s: SupabaseClient, ad: Ad, city: string, blocked: Set<string>, limit = 8): Promise<{ ads: Ad[]; local: boolean }> {
  // Property: only the same deal (a sale is never "similar" to a rental: the prices are 100x apart).
  const deal = ad.category === "Houses & Rentals" ? (ad as Ad & { transaction_type?: string | null }).transaction_type : null;
  const base = () => {
    const q = s.from("ads").select("*, shops!inner(id,name,slug,city,region,is_verified,status)")
      .eq("status", "published").eq("availability", "available").eq("shops.status", "approved")
      .eq("category", ad.category).neq("id", ad.id).gte("confirmed_at", cutoffIso(FRESH_DAYS))
      .order("feed_boost", { ascending: false }).order("created_at", { ascending: false }).limit(40);
    return deal ? q.eq("transaction_type", deal) : q;
  };
  const pattern = cityPattern(city || "");
  const [localRes, anyRes] = await Promise.all([
    pattern ? base().ilike("shops.city", pattern) : Promise.resolve({ data: [] as unknown[] }),
    base(),
  ]);
  const price = ad.price != null ? Number(ad.price) : null;
  const closeness = (x: Ad) => (price != null && x.price != null ? Math.abs(Number(x.price) - price) / Math.max(price, 1) : 10);
  const pick = (rows: Ad[]) => rows.filter((x) => !blocked.has(x.shop_id)).sort((a, b) => closeness(a) - closeness(b));
  const local = pick((localRes.data || []) as unknown as Ad[]);
  const seen = new Set(local.map((x) => x.id));
  const others = pick(((anyRes.data || []) as unknown as Ad[]).filter((x) => !seen.has(x.id)));
  const ads = [...local, ...others].slice(0, limit);
  return { ads, local: local.length > 0 };
}
