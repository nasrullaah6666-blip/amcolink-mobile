// Copied from the Amcolink website repo, lib/address.ts at commit dde47f3b (only import paths and env names adapted). The website is the source of truth: update both together.
/** Shop address made of simple parts that work where streets have no names: building, floor, shop no., area and directions. */
export const FLOORS = [
  "Basement 2", "Basement", "Ground floor", "Mezzanine",
  "1st floor", "2nd floor", "3rd floor", "4th floor", "5th floor", "6th floor", "7th floor", "8th floor", "9th floor", "10th floor",
  "11th floor", "12th floor", "13th floor", "14th floor", "15th floor", "Top floor", "Rooftop",
];

export type AddressParts = {
  building?: string | null; floor?: string | null; unit?: string | null; address?: string | null; landmark?: string | null;
  city?: string | null; region?: string | null; country?: string | null;
};

const clean = (v?: string | null) => (v || "").trim();

/** "Jijiga Main Market · 1st floor · Shop B14" (empty if none of these are set). */
export function placeLine(a: AddressParts): string {
  const unit = clean(a.unit);
  return [clean(a.building), clean(a.floor), unit ? (/^(shop|stall|office|room|unit|no\.?)\b/i.test(unit) ? unit : `Shop ${unit}`) : ""].filter(Boolean).join(" · ");
}

/** "Taiwan area, Jijiga, Somali, Ethiopia" */
export function areaLine(a: AddressParts): string {
  const region = clean(a.region) && clean(a.region) !== clean(a.city) ? clean(a.region) : "";
  return [clean(a.address), clean(a.city), region, clean(a.country)].filter(Boolean).join(", ");
}

/** Everything in one text, for copying and sharing. */
export function fullAddress(a: AddressParts): string {
  return [placeLine(a), areaLine(a), clean(a.landmark) ? `Directions: ${clean(a.landmark).replace(/\s*\n\s*/g, ", ")}` : ""].filter(Boolean).join("\n");
}

/**
 * Google Maps search for the shop by name of the building/area and town. We never send the seller's
 * map point (it is rounded for privacy), so the search uses the place names the seller typed.
 */
export function mapsUrl(a: AddressParts & { name?: string }): string {
  const q = [clean(a.building), clean(a.address), clean(a.city), clean(a.region) !== clean(a.city) ? clean(a.region) : "", clean(a.country)].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q || clean(a.name))}`;
}
