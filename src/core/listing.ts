// Copied from the Amcolink website repo, lib/listing.ts at commit dde47f3b (only import paths and env names adapted). The website is the source of truth: update both together.
import { COUNTRY_LIST, FEATURED_COUNTRY_CODES } from "@/core/countries";

// Local currencies of our main markets first, then the big international ones, then the rest A–Z.
const featured = FEATURED_COUNTRY_CODES.map((code) => COUNTRY_LIST.find((c) => c.code === code)?.currency).filter(Boolean) as string[];
const international = ["USD", "EUR", "GBP"];
const all = Array.from(new Set(COUNTRY_LIST.map((c) => c.currency).concat(international))).sort();

export const CURRENCIES: string[] = Array.from(new Set([...featured, ...international, ...all]));

/** Flag for a currency: by world standard its first two letters are the country (KES → Kenya, USD → USA).
 *  EUR uses the EU flag; shared regional currencies (XAF, XOF…) get a globe. */
export function currencyFlag(code: string): string {
  const c = (code || "").toUpperCase();
  if (c === "EUR") return flagOf("EU");
  if (!/^[A-Z]{3}$/.test(c) || c.startsWith("X")) return "🌍";
  return flagOf(c.slice(0, 2));
}
function flagOf(cc: string): string {
  return String.fromCodePoint(...cc.split("").map((ch) => 127397 + ch.charCodeAt(0)));
}
/** What the currency pickers show, e.g. "🇰🇪 KES". */
export function currencyLabel(code: string): string {
  return `${currencyFlag(code)} ${code}`;
}
