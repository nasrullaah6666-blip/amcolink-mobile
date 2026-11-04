// Copied from the Amcolink website repo, lib/utils.ts at commit dde47f3b (only import paths and env names adapted). The website is the source of truth: update both together.
// Small shared helpers. Everything user-supplied that ends up in a link or a
// database filter goes through one of these.

/** Returns a normalised http(s) URL, or null for anything else (blocks javascript:, data:, etc.). */
export function safeUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!v) return null;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

export function nullIfEmpty(value: FormDataEntryValue | null | undefined): string | null {
  const v = typeof value === "string" ? value.trim() : "";
  return v || null;
}

/** Keeps letters, numbers, spaces and hyphens so the text is safe inside PostgREST filters. */
export function sanitizeSearch(value?: string | null, max = 60): string {
  if (!value) return "";
  return value.replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export function clampPage(value?: string | null): number {
  const n = parseInt(value || "1", 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 500) : 1;
}

export function digitsOnly(value?: string | null): string {
  return (value || "").replace(/\D/g, "");
}

export function telLink(phone?: string | null): string | null {
  const t = (phone || "").replace(/[^\d+]/g, "");
  return t.length >= 6 ? `tel:${t}` : null;
}

export function whatsappLink(phone?: string | null, text?: string): string | null {
  const d = digitsOnly(phone);
  if (d.length < 6) return null;
  return `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function formatPrice(price: number | null, currency: string, from?: boolean | null): string {
  if (price === null || price === undefined) return "Price on request";
  if (Number(price) === 0) return "Free";
  return `${from ? "From " : ""}${currency} ${Number(price).toLocaleString()}`;
}

/** Extracts the storage object path from a public Supabase Storage URL. */
export function storagePathFromUrl(url: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  try {
    return decodeURIComponent(url.slice(i + marker.length).split("?")[0]);
  } catch {
    return null;
  }
}
