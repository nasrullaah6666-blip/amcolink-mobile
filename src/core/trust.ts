// Copied from the Amcolink website repo, lib/trust.ts at commit dde47f3b (only import paths and env names adapted). The website is the source of truth: update both together.
export type Trust = {
  shop_id: string; score: number; level: string; verified: boolean; reviews: number;
  rating: number | null; months: number; buyers: number; live_ads: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Rpc = { rpc: (...args: any[]) => any };

/** Trust scores for up to 100 shops in one call. Missing/unapproved shops are simply absent. */
export async function getTrust(supabase: Rpc, shopIds: string[]): Promise<Map<string, Trust>> {
  const map = new Map<string, Trust>();
  const ids = Array.from(new Set(shopIds)).slice(0, 100);
  if (!ids.length) return map;
  try {
    const { data, error } = await supabase.rpc("shop_trust", { p_shops: ids });
    if (error) throw error;
    for (const t of (data || []) as Trust[]) map.set(t.shop_id, t);
  } catch (e) {
    console.error("shop_trust failed:", e);
  }
  return map;
}
