// Copied from the Amcolink website repo, lib/geo.ts at commit dde47f3b (only import paths and env names adapted). The website is the source of truth: update both together.
import { COUNTRY_LIST, FEATURED_COUNTRY_CODES, type Country } from "@/core/countries";

export type { Country };

const byName = new Map(COUNTRY_LIST.map((c) => [c.name.toLowerCase(), c]));
const byCode = new Map(COUNTRY_LIST.map((c) => [c.code, c]));

export function countryByName(name?: string | null): Country | undefined {
  return name ? byName.get(name.trim().toLowerCase()) : undefined;
}
export function countryByCode(code?: string | null): Country | undefined {
  return code ? byCode.get(code.toUpperCase()) : undefined;
}

/** East African countries first (where most sellers are), then everyone else A–Z. */
export const FEATURED_COUNTRIES: Country[] = FEATURED_COUNTRY_CODES.map((c) => byCode.get(c)).filter((c): c is Country => !!c);
export const OTHER_COUNTRIES: Country[] = COUNTRY_LIST.filter((c) => !FEATURED_COUNTRY_CODES.includes(c.code));

/** Currency for a country (falls back to USD). */
export function currencyForCountry(name?: string | null): string {
  return countryByName(name)?.currency || "USD";
}
