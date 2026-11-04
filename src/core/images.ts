// Copied from the Amcolink website repo, lib/images.ts at commit dde47f3b (only import paths and env names adapted). The website is the source of truth: update both together.
/**
 * Photos: every upload is saved as the full HD photo plus a small thumbnail (~480 px).
 * New thumbnails are WebP ("_t.webp", ~25–35% smaller); some are JPEG ("_t.jpg"); the oldest photos have none.
 * SmartImg tries them in that order and falls back to the full photo automatically.
 *
 * When NEXT_PUBLIC_IMAGE_CDN is set (e.g. https://img.amcolink.com), photos are loaded through Cloudflare,
 * which keeps copies near the buyer. If that ever fails, SmartImg falls back to Supabase directly.
 */
const STORAGE_JPG = /\/storage\/v1\/object\/public\/(ad-photos|shop-media)\/[^?#]+\/[0-9a-f-]{36}\.jpg$/i;
const STORAGE_BASE = /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\//i;
const CDN = (process.env.EXPO_PUBLIC_IMAGE_CDN || "").trim().replace(/\/+$/, "");

/** The photo server's address (e.g. https://img.amcolink.com), or "" when photos come straight from Supabase. */
export function imageOrigin(): string {
  try { return CDN ? new URL(CDN).origin : ""; } catch { return ""; }
}

export function isStoragePhoto(url: string): boolean {
  return STORAGE_JPG.test(url);
}
/** Same photo, through Cloudflare when switched on. */
export function cdnUrl(url: string): string {
  return CDN && STORAGE_BASE.test(url) ? url.replace(STORAGE_BASE, `${CDN}/`) : url;
}
export function thumbUrl(url: string, kind: "webp" | "jpg" = "jpg"): string {
  return STORAGE_JPG.test(url) ? url.replace(/\.jpg$/i, `_t.${kind}`) : url;
}
export function thumbPath(path: string, kind: "webp" | "jpg" = "jpg"): string {
  return path.replace(/\.jpg$/i, `_t.${kind}`);
}
/** Addresses to try, best first, without repeats. */
export function photoCandidates(src: string, thumb: boolean): string[] {
  const list = thumb && isStoragePhoto(src)
    ? [cdnUrl(thumbUrl(src, "webp")), cdnUrl(thumbUrl(src, "jpg")), cdnUrl(src), src]
    : [cdnUrl(src), src];
  return Array.from(new Set(list));
}
/** Unsplash pictures: ask for the size we actually show. */
export function unsplashSized(url: string, w: number): string {
  return /images\.unsplash\.com/.test(url) ? url.replace(/([?&])w=\d+/, `$1w=${w}`) : url;
}
