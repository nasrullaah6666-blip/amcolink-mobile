// Copied from the Amcolink website repo, lib/types.ts at commit dde47f3b (only import paths and env names adapted). The website is the source of truth: update both together.
export type Shop = {
  id: string; owner_id: string; slug: string; name: string; logo_url: string | null;
  cover_url: string | null; description: string; country: string; city: string; region?: string | null; address: string | null; building?: string | null; floor?: string | null; unit?: string | null; landmark?: string | null;
  opening_hours: string | null; phone: string | null; whatsapp: string | null; telegram: string | null;
  social_links: Record<string,string>; links?: { type: import("@/core/links").LinkType; url: string }[]; status: "pending" | "approved" | "suspended"; is_verified: boolean;
  created_at?: string; lat?: number | null; lng?: number | null; kind?: "shop" | "property";
};
export type Ad = {
  id: string; shop_id: string; owner_id: string; title: string; description: string; price: number | null;
  currency: string; category: string; subcategory?: string | null; condition?: string | null; photo_urls: string[]; availability: "available" | "reserved" | "sold";
  status: "published" | "removed"; created_at: string; shops?: Shop;
  confirmed_at?: string | null; previous_price?: number | null; price_dropped_at?: string | null;
  gift_occasions?: string[] | null; gift_for?: string[] | null; hidden_by_owner?: boolean;
  rental?: import("@/core/rentals").Rental | null; shop_verified?: boolean; feed_boost?: boolean;
  /** Properties only: "rent" or "sale" (null for everything else; older rentals read as rent). */
  transaction_type?: "rent" | "sale" | null;
  expiry_date?: string | null; no_expiry?: boolean; photo_hashes?: string[]; price_from?: boolean;
};
// Main categories (see lib/categories.ts for subcategories and the old names). Houses & Rentals lives in the Property tab.
export const CATEGORIES = ["All","Phones & Tablets","Electronics","Home & Appliances","Houses & Rentals","Fashion","Beauty & Health","Vehicles","Food & Farming","Building & Tools","Services","Other"];