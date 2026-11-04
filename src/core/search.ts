// Copied from the Amcolink website repo, lib/search.ts at commit dde47f3b (only import paths and env names adapted). The website is the source of truth: update both together.
import { normalizeCategory } from "@/core/categories";
import { CONDITIONS, conditionLabel } from "@/core/conditions";
import { sanitizeSearch } from "@/core/utils";
import { sanitizeQuery } from "@/core/searchWords";

export const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
] as const;

export type Search = {
  q: string; city: string; category: string; sub: string; min: string; max: string; condition: string; sort: string; verified: string;
};

function cleanNumber(v?: string | null): string {
  const n = Number(String(v ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 && n < 1e12 ? String(Math.round(n * 100) / 100) : "";
}

/** Reads and cleans search options from the URL (or a saved search). */
export function parseSearch(p: Record<string, string | undefined>): Search {
  const cat = p.category && p.category !== "All" ? normalizeCategory(p.category, p.sub) : null;
  return {
    q: sanitizeQuery(p.q), // keeps apostrophes, dots and slashes ("L'Oréal", "3.5kg"); see lib/searchWords.ts
    city: sanitizeSearch(p.city),
    // Old category names (from saved searches or shared links) are mapped to the new main categories.
    category: cat?.category || "",
    sub: cat?.sub || "",
    min: cleanNumber(p.min),
    max: cleanNumber(p.max),
    condition: CONDITIONS.some((c) => c.value === p.condition) ? String(p.condition) : "",
    sort: SORTS.some((s) => s.value === p.sort) && p.sort !== "newest" ? String(p.sort) : "",
    verified: p.verified === "1" ? "1" : "",
  };
}

export function hasFilters(s: Search) {
  return Boolean(s.q || s.city || s.category || s.sub || s.min || s.max || s.condition || s.verified);
}

/** Only the options that are set, ready for a URL. */
export function searchParamsOf(s: Search): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(s)) if (v) out[k] = v;
  return out;
}

export function searchUrl(s: Search): string {
  const qs = new URLSearchParams(searchParamsOf(s)).toString();
  return qs ? `/?${qs}#listings` : "/#listings";
}

/** Human description, e.g. "sofa · Home · Nairobi · 5,000–30,000 · Used". */
export function describeSearch(s: Search): string {
  const parts: string[] = [];
  if (s.q) parts.push(`“${s.q}”`);
  if (s.category) parts.push(s.sub ? `${s.category} › ${s.sub}` : s.category);
  if (s.city) parts.push(s.city);
  if (s.min || s.max) parts.push(`${s.min ? Number(s.min).toLocaleString() : "0"}–${s.max ? Number(s.max).toLocaleString() : "any"}`);
  const c = conditionLabel(s.condition);
  if (c) parts.push(c);
  if (s.verified) parts.push("Verified sellers");
  return parts.join(" · ").slice(0, 80) || "All listings";
}
