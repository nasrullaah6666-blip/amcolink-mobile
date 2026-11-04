// Copied from the Amcolink website repo, lib/shop.ts at commit dde47f3b (only import paths and env names adapted). The website is the source of truth: update both together.
import { nullIfEmpty } from "@/core/utils";
import { normalizePhone } from "@/core/phone";
import { countryByName } from "@/core/geo";
import { cleanLinks, legacyFields, type ShopLink } from "@/core/links";
import { cleanHours, type Hours } from "@/core/hours";

/** The app passes a plain object with get/has (the website passes the browser form). */
export type FormLike = { get(name: string): FormDataEntryValue | null; has(name: string): boolean };
export const formOf = (o: Record<string, string | undefined>): FormLike => ({ get: (n) => (o[n] ?? null), has: (n) => n in o && o[n] !== undefined });

export type ShopValues = {
  name: string; city: string; region: string | null; country: string; address: string | null; building: string | null; floor: string | null; unit: string | null; landmark: string | null; description: string;
  opening_hours: string | null; phone: string | null; whatsapp: string | null; telegram: string | null;
  social_links: Record<string, string>; links: ShopLink[]; hours: Hours; announcement?: string | null; lat: number | null; lng: number | null;
};

const oneLine = (v: FormDataEntryValue | null, max: number) => String(v || "").replace(/\s+/g, " ").trim().slice(0, max) || null;

function coord(v: FormDataEntryValue | null, max: number): number | null {
  const t = typeof v === "string" ? v.trim() : "";
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) && Math.abs(n) <= max ? Math.round(n * 200) / 200 : null; // ~0.5 km grid for privacy
}

/** Validates and normalises the shop form. Empty optional fields become null; bad links are rejected. */
export function parseShopForm(f: FormLike): { ok: true; values: ShopValues } | { ok: false; error: string } {
  const name = String(f.get("name") || "").trim();
  const city = String(f.get("city") || "").trim();
  if (name.length < 2 || name.length > 100) return { ok: false, error: "Name must be 2–100 characters." };
  if (!city) return { ok: false, error: "City is required." };

  const country = countryByName(String(f.get("country") || ""))?.name;
  if (!country) return { ok: false, error: "Please choose a country from the list." };
  if (city.length > 60) return { ok: false, error: "City must be 60 characters or fewer." };

  const phoneRaw = nullIfEmpty(f.get("phone"));
  const whatsappRaw = nullIfEmpty(f.get("whatsapp"));
  const phone = normalizePhone(phoneRaw, country);
  const whatsapp = normalizePhone(whatsappRaw, country);
  if (phoneRaw && !phone) return { ok: false, error: "Phone number looks wrong. Use your local number or include the country code, e.g. +254712345678." };
  if (whatsappRaw && !whatsapp) return { ok: false, error: "WhatsApp number looks wrong. Use your local number or include the country code, e.g. +254712345678." };
  if (!phone && !whatsapp) return { ok: false, error: "Add a phone or WhatsApp number so buyers can reach you." };


  let parsedLinks: unknown = [];
  try { parsedLinks = JSON.parse(String(f.get("links") || "[]")); } catch { return { ok: false, error: "Links could not be read. Please add them again." }; }
  const cl = cleanLinks(parsedLinks);
  if (!cl.ok) return { ok: false, error: cl.error };
  const links = cl.links;
  const { social_links, telegram } = legacyFields(links); // old fields kept in step for older pages

  let hours: Hours = {};
  try { hours = cleanHours(JSON.parse(String(f.get("hours") || "{}"))); } catch { /* ignore */ }
  const announcement = f.has("announcement") ? oneLine(f.get("announcement"), 160) : undefined;
  if (announcement && /(https?:\/\/|www\.)/i.test(announcement)) return { ok: false, error: "The announcement can’t contain links." };

  return {
    ok: true,
    values: {
      name, city,
      region: String(f.get("region") || "").trim().slice(0, 60) || null,
      country,
      address: oneLine(f.get("address"), 200),
      building: oneLine(f.get("building"), 100),
      floor: oneLine(f.get("floor"), 30),
      unit: oneLine(f.get("unit"), 30),
      landmark: String(f.get("landmark") || "").replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{2,}/g, "\n").trim().slice(0, 300) || null,
      description: String(f.get("description") || "").trim().slice(0, 1500),
      opening_hours: nullIfEmpty(f.get("opening_hours")),
      phone, whatsapp, telegram, social_links, links, hours,
      ...(announcement !== undefined ? { announcement } : {}),
      ...(() => {
        const lat = coord(f.get("lat"), 90);
        const lng = coord(f.get("lng"), 180);
        return lat !== null && lng !== null ? { lat, lng } : { lat: null, lng: null };
      })(),
    },
  };
}
