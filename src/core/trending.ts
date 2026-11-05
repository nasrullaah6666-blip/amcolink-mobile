// Copied from the Amcolink website repo, lib/trending.ts at commit 13076bf7 (only import paths adapted). The website is the source of truth: update both together.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Ad } from "@/core/types";

export const TRENDING_DAYS = 7;

export type TrendingShop = {
  id: string; name: string; slug: string; city: string; logo_url: string | null; is_verified: boolean; people: number;
};

/** Top 10 items by unique viewers, and top 10 shops by unique people who contacted them (last 7 days). */
export async function getTrending(s: SupabaseClient, blocked: Set<string> = new Set(), limit = 10) {
  const [adRank, shopRank] = await Promise.all([
    s.rpc("trending_ads", { p_days: TRENDING_DAYS, p_limit: 10 }),
    s.rpc("trending_shops", { p_days: TRENDING_DAYS, p_limit: 10 }),
  ]);
  if (adRank.error) console.error("trending_ads failed:", adRank.error.message);
  if (shopRank.error) console.error("trending_shops failed:", shopRank.error.message);
  const adRows = (adRank.data || []) as { ad_id: string; people: number }[];
  const shopRows = (shopRank.data || []) as { shop_id: string; people: number }[];

  const [adsRes, shopsRes] = await Promise.all([
    adRows.length
      ? s.from("ads").select("*, shops!inner(id,name,slug,city,country,is_verified,status)").in("id", adRows.map((r) => r.ad_id))
      : Promise.resolve({ data: [] as unknown[] }),
    shopRows.length
      ? s.from("shops").select("id,name,slug,city,country,logo_url,is_verified").in("id", shopRows.map((r) => r.shop_id))
      : Promise.resolve({ data: [] as unknown[] }),
  ]);
  const adMap = new Map(((adsRes.data || []) as unknown as Ad[]).map((a) => [a.id, a]));
  const shopMap = new Map(((shopsRes.data || []) as any[]).map((x) => [x.id, x]));

  const ads = adRows
    .map((r) => ({ ad: adMap.get(r.ad_id), people: Number(r.people) }))
    .filter((x): x is { ad: Ad; people: number } => Boolean(x.ad) && !blocked.has(x.ad!.shop_id))
    .slice(0, limit);
  const shops = shopRows
    .map((r) => (shopMap.has(r.shop_id) ? { ...shopMap.get(r.shop_id), people: Number(r.people) } : null))
    .filter((x): x is TrendingShop => Boolean(x) && !blocked.has(x!.id))
    .slice(0, limit);
  return { ads, shops };
}

export function peopleLabel(n: number, verb: string) {
  return `${n.toLocaleString()} ${n === 1 ? "person" : "people"} ${verb}`;
}
