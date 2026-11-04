// Copied from the Amcolink website repo, lib/property.ts at commit dde47f3b (only import paths and env names adapted). The website is the source of truth: update both together.
/**
 * One seller profile can post in all three groups: Shopping, Services and Properties (Houses & Rentals).
 * Older "Property accounts" keep working and may post in every group too (migration 042).
 * The three public lists (/shops, /services, /properties) are built from what each profile has posted.
 */
import { RENTAL } from "@/core/rentals";

export type AccountKind = "shop" | "property";

export const kindOf = (s?: { kind?: string | null } | null): AccountKind => (s?.kind === "property" ? "property" : "shop");
export const isPropertyAccount = (s?: { kind?: string | null } | null) => kindOf(s) === "property";

/** The categories a profile may post in: all of them (every profile can post in every group). */
export function categoriesFor(_kind: AccountKind, all: string[]): string[] {
  return all.filter((c) => c !== "All");
}

/** The three groups people choose from when they post, and the three public lists. */
export type Group = "shop" | "service" | "property";
export const GROUPS: { id: Group; label: string; hint: string }[] = [
  { id: "shop", label: "Shopping", hint: "Products, shops and businesses" },
  { id: "service", label: "Services", hint: "Professionals and service businesses" },
  { id: "property", label: "Properties", hint: "Houses, land, rentals and sales" },
];
export const groupOfCategory = (c?: string | null): Group => (c === RENTAL ? "property" : c === "Services" ? "service" : "shop");
export const categoriesInGroup = (g: Group, all: string[]): string[] =>
  all.filter((c) => c !== "All" && groupOfCategory(c) === g);

export const ACCOUNT = {
  shop: { name: "Shop", plural: "Shops", list: "/shops", create: "/shops/new" },
  service: { name: "Services", plural: "Services", list: "/services", create: "/shops/new" },
  property: { name: "Property", plural: "Properties", list: "/properties", create: "/shops/new" },
} as const;

/** Which profiles belong in a public list. Uses the marks kept by the database (migration 042): a profile is listed where it has live ads. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function groupFilter(q: any, g: Group): any {
  return q.eq(g === "service" ? "sells_services" : g === "property" ? "sells_property" : "sells_shopping", true);
}

/** Owner (landlord) or agent: every Property account says which, and every house or room listing shows it. */
export type PropertyRole = "owner" | "agent";
export const ROLES = [
  { value: "owner", label: "Owner / landlord", short: "Owner", help: "I own the places I rent out." },
  { value: "agent", label: "Agent / broker", short: "Agent", help: "I rent out places for their owners." },
] as const;
export const roleLabel = (v?: string | null) => ROLES.find((r) => r.value === v)?.label || "";
export const roleShort = (v?: string | null) => ROLES.find((r) => r.value === v)?.short || "";
export const isRole = (v: unknown): v is PropertyRole => v === "owner" || v === "agent";
