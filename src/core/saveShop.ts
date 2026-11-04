// Copied from the Amcolink website repo, lib/saveShop.ts (saveShop only) at commit dde47f3b. The website is the source of truth: update both together.
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Saves a shop. If the database hasn't been updated yet for a newer field (its SQL step not run),
 * the save is retried without that field instead of failing. Fields in `keep` are never dropped
 * (e.g. "kind": a Property account must never be saved as a shop by mistake).
 */
export async function saveShop(s: SupabaseClient, row: Record<string, unknown>, shopId?: string, keep: string[] = []) {
  let data = { ...row };
  for (let i = 0; i < 8; i++) {
    const { error } = shopId ? await s.from("shops").update(data).eq("id", shopId) : await s.from("shops").insert(data);
    const missing = error && /'([a-z_]+)' column/i.exec(error.message)?.[1];
    if (error?.code === "23505") return new Error("This name is already taken on Amcolink. Please choose another name.");
    if (!missing || !(missing in data) || keep.includes(missing)) return error;
    const { [missing]: _drop, ...rest } = data;
    data = rest;
  }
  return null;
}
