// Copied from the Amcolink website repo, lib/phone.ts at commit dde47f3b (only import paths and env names adapted). The website is the source of truth: update both together.
// Sellers usually type numbers in local format ("0712 345 678", "07911 123456").
// WhatsApp links and callers abroad need "+<country code><number>", so we convert
// using the shop's country: its calling code and its trunk prefix (the leading "0"
// most countries drop internationally; some countries, like Italy, keep it).
import { countryByName } from "@/core/geo";

/**
 * Returns "+<country code><number>" or null if it can't be a real number.
 * Accepts "+254 712 345 678", "00254712345678", "254712345678", "0712345678", "712345678".
 */
export function normalizePhone(raw: string | null | undefined, countryName: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  let digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;

  const country = countryByName(countryName);

  if (trimmed.startsWith("+")) {
    // already international
  } else if (digits.startsWith("00")) {
    digits = digits.slice(2);
  } else if (country) {
    const { dial, trunk } = country;
    let local: string;
    if (digits.startsWith(dial) && digits.length >= dial.length + 8) {
      local = digits.slice(dial.length); // typed with the country code but without "+"
    } else if (trunk && digits.startsWith(trunk)) {
      local = digits.slice(trunk.length);
    } else {
      local = digits;
    }
    if (local.length < 6) return null; // too short to be a real subscriber number
    digits = dial + local;
  }
  // Unknown country and no "+": keep the digits as typed and let the length check decide.

  if (digits.length < 8 || digits.length > 15) return null;
  return `+${digits}`;
}
