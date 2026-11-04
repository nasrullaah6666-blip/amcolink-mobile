// Copied from the Amcolink website repo, lib/deletePhotos.ts at commit dde47f3b (only import paths adapted). The website is the source of truth: update both together.
import type { SupabaseClient } from "@supabase/supabase-js";
import { storagePathFromUrl } from "@/core/utils";
import { thumbPath } from "@/core/images";

/** Removes uploaded photo files (best effort: a failure only leaves an unused file behind). */
export async function deletePhotos(s: SupabaseClient, urls: (string | null | undefined)[], bucket: "ad-photos" | "shop-media") {
  const paths = urls.filter((u): u is string => typeof u === "string" && !!u).map((u) => storagePathFromUrl(u, bucket)).filter(Boolean) as string[];
  const originals = paths.filter((p) => /\.jpg$/i.test(p) && !/_t\.(jpg|webp)$/i.test(p));
  paths.push(...originals.map((p: string) => thumbPath(p, "jpg")), ...originals.map((p: string) => thumbPath(p, "webp"))); // their small copies too
  for (let i = 0; i < paths.length; i += 100) {
    try { await s.storage.from(bucket).remove(paths.slice(i, i + 100)); } catch { /* ignore */ }
  }
}
