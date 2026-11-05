// Copied from the Amcolink website repo, lib/categories.ts at commit d3ef747d (only import paths and env names adapted). The website is the source of truth: update both together.
/**
 * Categories: 10 main categories, Services included (plus Houses & Rentals, which lives in the Property tab), each with
 * subcategories. One page per main category (/category/<slug>), subcategories as ?sub=<name> on that page.
 * Older names and addresses (before October 2026) still work: they are mapped to the new ones.
 * The database keeps the same lists (supabase/migrations/035_subcategories.sql): change both together.
 */
export type CategoryInfo = { name: string; slug: string; label: string; short: string; blurb: string; subs: string[] };

export const MAIN_CATEGORIES: CategoryInfo[] = [
  { name: "Phones & Tablets", slug: "phones", label: "Phones & Tablets", short: "Phones", blurb: "Phones, tablets, chargers, cases, earphones and smart watches from local sellers.", subs: ["Phones", "Tablets", "Accessories", "Smart watches"] },
  { name: "Electronics", slug: "electronics", label: "Electronics", short: "Electronics", blurb: "Laptops, TVs, speakers, cameras and gaming.", subs: ["Laptops & computers", "TVs", "Audio", "Cameras", "Gaming", "Other electronics"] },
  { name: "Home & Appliances", slug: "home-appliances", label: "Home & Appliances", short: "Home", blurb: "Furniture, kitchen things, fridges, washing machines and decoration for your home.", subs: ["Furniture", "Kitchen", "Appliances", "Decor", "Bedding"] },
  { name: "Fashion", slug: "fashion", label: "Fashion", short: "Fashion", blurb: "Clothes, shoes and bags for men, women and kids.", subs: ["Men", "Women", "Kids", "Shoes", "Bags"] },
  { name: "Beauty & Health", slug: "beauty", label: "Beauty & Health", short: "Beauty", blurb: "Skin care, hair, perfume, make-up, henna and health products.", subs: ["Skin care", "Hair", "Perfume", "Make-up", "Health"] },
  { name: "Vehicles", slug: "vehicles", label: "Vehicles", short: "Vehicles", blurb: "Cars, motorbikes, bajaj, trucks, spare parts and car services.", subs: ["Parts", "Cars", "Motorbikes & tuk-tuks", "Trucks & buses", "Other vehicles"] },
  { name: "Food & Farming", slug: "food-farming", label: "Food & Farming", short: "Farming", blurb: "Food, livestock, seeds and farm tools from local sellers and farmers.", subs: ["Food", "Livestock", "Seeds & plants", "Farm tools"] },
  { name: "Building & Tools", slug: "building-tools", label: "Building & Tools", short: "Building", blurb: "Cement, iron sheets, tiles, solar panels, generators and tools.", subs: ["Materials", "Solar & generators", "Tools"] },
  { name: "Services", slug: "services", label: "Services", short: "Services", blurb: "Plumbers, cleaners, tutors, drivers, printing, catering and car help from local people. Call or WhatsApp them directly.", subs: ["Home repairs", "Cleaning", "Transport & moving", "Beauty & hair", "Tutors & lessons", "Events", "Repairs & technicians", "Printing & branding", "Catering & food", "Car services", "Other services"] },
  { name: "Other", slug: "other", label: "Other", short: "Other", blurb: "Everything else people are selling near you.", subs: [] },
];

export const RENTAL_CATEGORY = "Houses & Rentals";

/** Every main category name, Houses & Rentals included (for checks). */
export const ALL_CATEGORY_NAMES = [...MAIN_CATEGORIES.map((c) => c.name), RENTAL_CATEGORY];

/** Old category names → new main category (and subcategory). */
const OLD_NAMES: Record<string, { category: string; sub?: string }> = {
  "Phones & Accessories": { category: "Phones & Tablets" },
  "Home & Living": { category: "Home & Appliances" },
  "Men's Clothing": { category: "Fashion", sub: "Men" },
  "Women's Clothing": { category: "Fashion", sub: "Women" },
  "Kids": { category: "Fashion", sub: "Kids" },
  "Shoes": { category: "Fashion", sub: "Shoes" },
  "Bags & Luggage": { category: "Fashion", sub: "Bags" },
  "Food": { category: "Food & Farming", sub: "Food" },
  "Beauty": { category: "Beauty & Health" },
};

/** Old page addresses → new ones, so links people shared keep working. */
const OLD_SLUGS: Record<string, { slug: string; sub?: string }> = {
  "home-living": { slug: "home-appliances" },
  "mens-clothing": { slug: "fashion", sub: "Men" },
  "womens-clothing": { slug: "fashion", sub: "Women" },
  "kids": { slug: "fashion", sub: "Kids" },
  "shoes": { slug: "fashion", sub: "Shoes" },
  "bags-luggage": { slug: "fashion", sub: "Bags" },
  "food": { slug: "food-farming", sub: "Food" },
};

/** Any category name (new or old) → the current main category and subcategory, or null if unknown. */
export function normalizeCategory(name?: string | null, sub?: string | null): { category: string; sub: string } | null {
  if (!name) return null;
  const old = OLD_NAMES[name];
  const category = old ? old.category : name;
  if (category !== RENTAL_CATEGORY && !MAIN_CATEGORIES.some((c) => c.name === category)) return null;
  const s = sub && subsOf(category).includes(sub) ? sub : old?.sub || "";
  return { category, sub: s };
}

export const categoryByName = (name?: string | null) => MAIN_CATEGORIES.find((c) => c.name === name);
export const categoryBySlug = (slug?: string) => MAIN_CATEGORIES.find((c) => c.slug === slug);
export const oldSlug = (slug?: string) => (slug ? OLD_SLUGS[slug] : undefined);
export const subsOf = (name?: string | null) => categoryByName(name)?.subs || [];
export const categoryLabel = (name?: string | null) => categoryByName(normalizeCategory(name)?.category)?.label || name || "";

/** Food, livestock, seeds and services aren't "new" or "used": no condition for them. */
export function needsCondition(category?: string | null, sub?: string | null): boolean {
  if (category === RENTAL_CATEGORY || category === "Services") return false;
  if (category === "Food & Farming" && sub && sub !== "Farm tools") return false;
  return true;
}

/** Packaged food and cosmetics need an expiry date (or the "No expiry date" tick). Health devices and the rest don't. */
export function needsExpiry(category?: string | null, sub?: string | null): boolean {
  if (category === "Beauty & Health") return sub !== "Health";
  if (category === "Food & Farming") return sub === "Food";
  return false;
}

/** Kept for older imports: every main shopping category, in the site's order. */
export const CATEGORY_PAGES = MAIN_CATEGORIES;

/** The page for a category (and subcategory). Houses & Rentals → /rentals. Unknown names go to the home listings. */
export function categoryHref(name?: string | null, sub?: string | null): string {
  if (name === RENTAL_CATEGORY) return "/rentals";
  const n = normalizeCategory(name, sub);
  const c = categoryByName(n?.category);
  if (!c) return "/#listings";
  const s = n?.sub || "";
  return `/category/${c.slug}${s ? `?sub=${encodeURIComponent(s)}` : ""}`;
}

/**
 * A subcategory that lives in one category but is also shown on another category's page, so buyers find it
 * where they look. The listing is saved once (in `category`/`sub`); the extra tile just links there.
 */
export const SHARED_SUBS: Record<string, { label: string; category: string; sub: string }[]> = {
  Vehicles: [{ label: "Car services", category: "Services", sub: "Car services" }],
  "Phones & Tablets": [{ label: "Repairs & technicians", category: "Services", sub: "Repairs & technicians" }],
};
