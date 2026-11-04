// Copied from the Amcolink website repo, lib/rentals.ts at commit dde47f3b (only import paths and env names adapted). The website is the source of truth: update both together.
/** Houses & Rentals: details that only rental listings have. */
export const RENTAL = "Houses & Rentals";
export const isRental = (category?: string | null) => category === RENTAL;

/** One property system: every Houses & Rentals listing is either for rent or for sale (column ads.transaction_type). */
export type Deal = "rent" | "sale";
export const DEALS = [
  { value: "rent", label: "For rent" },
  { value: "sale", label: "For sale" },
] as const;
export const isDeal = (v: unknown): v is Deal => v === "rent" || v === "sale";
/** Old listings have no deal type until the database update; a rental always has a rent period. */
export const dealOf = (ad?: { transaction_type?: string | null; rental?: { period?: string } | null } | null): Deal | null =>
  ad?.transaction_type === "sale" ? "sale" : ad?.transaction_type === "rent" || ad?.rental?.period ? "rent" : null;

/** Property types for sale (land and commercial are for sale only; room, guest house and shop/office are rent only). */
export const SALE_TYPES = [
  { value: "house", label: "House / villa" },
  { value: "apartment", label: "Apartment / flat" },
  { value: "studio", label: "Studio / bedsitter" },
  { value: "land", label: "Land / plot" },
  { value: "commercial", label: "Commercial building" },
] as const;

export const PROPERTY_TYPES = [
  { value: "house", label: "House / villa" },
  { value: "apartment", label: "Apartment / flat" },
  { value: "room", label: "Single room" },
  { value: "studio", label: "Studio / bedsitter" },
  { value: "shop", label: "Shop / office" },
  { value: "guesthouse", label: "Guest house" },
] as const;
export const PERIODS = [
  { value: "month", label: "per month", short: "/ month" },
  { value: "night", label: "per night", short: "/ night" },
  { value: "year", label: "per year", short: "/ year" },
] as const;
export const FURNISHED = [
  { value: "no", label: "Unfurnished" },
  { value: "partly", label: "Partly furnished" },
  { value: "yes", label: "Furnished" },
] as const;
export const INCLUDES = [
  { value: "water", label: "Water" },
  { value: "electricity", label: "Electricity" },
  { value: "parking", label: "Parking" },
  { value: "security", label: "Security / guard" },
  { value: "wifi", label: "Wi-Fi" },
] as const;

/** Agents only: what the agent charges the tenant (shown openly, so no surprise fees). */
export const AGENT_FEES = [
  { value: "none", label: "No fee" },
  { value: "half", label: "½ month" },
  { value: "one", label: "1 month" },
] as const;

export type Rental = {
  type: string; bathrooms?: number;
  /** Rent only. */
  period?: string;
  /** Not for land (and optional for commercial). */
  bedrooms?: number; furnished?: string;
  /** Sale only: plot or floor size in square metres. */
  size_sqm?: number;
  /** Area / estate where this house is (e.g. Kilimani, Bole). Searched on the Rentals page. */
  area?: string;
  /** true = area was copied from the account's town for older listings; the landlord should add the real one. */
  area_auto?: boolean;
  agent_fee?: "none" | "half" | "one";
  deposit_months?: number; includes?: string[]; available_from?: string;
  /** Owner or agent: copied by the database from the Property account (never typed by the poster). */
  lister?: "owner" | "agent";
};

const label = (list: readonly { value: string; label: string }[], v?: string) => list.find((x) => x.value === v)?.label || "";
export const typeLabel = (v?: string) => label(PROPERTY_TYPES, v) || label(SALE_TYPES, v);
export const typesFor = (deal: Deal): readonly { value: string; label: string }[] => (deal === "sale" ? SALE_TYPES : PROPERTY_TYPES);
export const furnishedLabel = (v?: string) => label(FURNISHED, v);
export const includeLabel = (v?: string) => label(INCLUDES, v);
export const periodShort = (r?: Rental | null) => PERIODS.find((p) => p.value === r?.period)?.short || "";
export const agentFeeLabel = (v?: string) => (v === "none" ? "None" : v === "half" ? "½ month rent" : v === "one" ? "1 month rent" : "");
/** Short bedroom count for cards: "Studio", "2 bd". */
export const bedsShort = (n?: number) => (n === undefined || n === null ? "" : n === 0 ? "Studio" : `${n} bd`);
/** Area / estate: letters, numbers, spaces and simple punctuation, 2–60 characters. */
export const cleanArea = (v: unknown) => String(v ?? "").replace(/[<>{}\[\]"`]/g, "").replace(/\s+/g, " ").trim().slice(0, 60);
export const bedsLabel = (n?: number) => (n === undefined || n === null ? "" : n === 0 ? "Studio" : n === 1 ? "1 bedroom" : `${n} bedrooms`);
export const sizeLabel = (n?: number) => (n ? `${n.toLocaleString("en-US")} m²` : "");

/** Reads the property part of the posting form (names prefixed "r_"). `deal` is the explicit Rent / Sale choice. */
export function parseRental(f: FormData, dealIn?: string): { ok: true; rental: Rental; deal: Deal } | { ok: false; error: string } {
  const deal = dealIn ?? String(f.get("deal") || "");
  if (!isDeal(deal)) return { ok: false, error: "Choose For rent or For sale." };
  const type = String(f.get("r_type") || "");
  if (!typesFor(deal).some((x) => x.value === type)) return { ok: false, error: "Choose the type of place." };
  const area = cleanArea(f.get("r_area"));
  if (area.length < 2) return { ok: false, error: "Add the area or estate where the property is (e.g. Kilimani, Bole)." };
  const baths = String(f.get("r_bathrooms") || "");
  if (deal === "sale") {
    const rental: Rental = { type, area };
    if (type !== "land") {
      const beds = String(f.get("r_bedrooms") ?? "");
      if (/^\d{1,2}$/.test(beds)) rental.bedrooms = Number(beds);
      else if (type !== "commercial") return { ok: false, error: "Choose the number of bedrooms." };
      if (/^\d{1,2}$/.test(baths)) rental.bathrooms = Number(baths);
      const furnished = String(f.get("r_furnished") || "");
      if (FURNISHED.some((x) => x.value === furnished)) rental.furnished = furnished;
    }
    const size = String(f.get("r_size_sqm") || "").trim();
    if (size) {
      if (!/^\d{1,8}$/.test(size) || Number(size) < 1) return { ok: false, error: "Size must be a whole number of square metres." };
      rental.size_sqm = Number(size);
    } else if (type === "land") return { ok: false, error: "Add the size of the plot in square metres." };
    return { ok: true, rental, deal };
  }
  const period = String(f.get("r_period") || "");
  const beds = String(f.get("r_bedrooms") ?? "");
  const furnished = String(f.get("r_furnished") || "");
  if (!PERIODS.some((x) => x.value === period)) return { ok: false, error: "Choose how often rent is paid." };
  if (!/^\d{1,2}$/.test(beds)) return { ok: false, error: "Choose the number of bedrooms." };
  if (!FURNISHED.some((x) => x.value === furnished)) return { ok: false, error: "Say whether it is furnished." };
  const rental: Rental = { type, period, bedrooms: Number(beds), furnished, area };
  const fee = String(f.get("r_agent_fee") || "");
  if (AGENT_FEES.some((x) => x.value === fee)) rental.agent_fee = fee as Rental["agent_fee"];
  if (/^\d{1,2}$/.test(baths)) rental.bathrooms = Number(baths);
  const dep = String(f.get("r_deposit_months") || "");
  if (/^\d{1,2}$/.test(dep)) rental.deposit_months = Number(dep);
  const inc = f.getAll("r_includes").map(String).filter((v) => INCLUDES.some((x) => x.value === v));
  if (inc.length) rental.includes = inc;
  const from = String(f.get("r_available_from") || "");
  if (/^\d{4}-\d{2}-\d{2}$/.test(from)) rental.available_from = from;
  return { ok: true, rental, deal };
}

export const RENTAL_SAFETY = "Never pay anything before you have seen the house and met the owner or agent. No booking, viewing or “reservation” fees.";

/** Buying safety. Amcolink never checks ownership or title, so the text says so and tells buyers what to check themselves. */
export const SALE_SAFETY = "Amcolink does not check who owns a property or its title, and does not take part in the sale. Before you pay anything: see the property, ask for the title deed or ownership papers and check them yourself at the official land registry, and use your own lawyer. Never send money in advance or pay by phone.";
/** Wording for the profile badge on property listings: identity and phone only, never ownership. */
export const PROPERTY_VERIFIED_NOTE = "Amcolink checked this profile’s identity and phone number. This is not proof of ownership, title or authority to sell or rent.";
/** What the poster says they are (never checked by Amcolink). */
export const claimedRole = (v?: string | null) => (v === "agent" ? "Says they are the agent" : v === "owner" ? "Says they are the owner" : "");
