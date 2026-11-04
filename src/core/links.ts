// Copied from the Amcolink website repo, lib/links.ts at commit dde47f3b (only import paths and env names adapted). The website is the source of truth: update both together.
/** One "Links" list for a shop: paste any link and we recognise the platform from its address. */
export type LinkType = "facebook" | "instagram" | "tiktok" | "youtube" | "telegram" | "x" | "linkedin" | "website";
export type ShopLink = { type: LinkType; url: string };

export const MAX_LINKS = 6;

export const LINK_INFO: Record<LinkType, { label: string; hosts: string[] }> = {
  facebook: { label: "Facebook", hosts: ["facebook.com", "fb.com", "fb.me"] },
  instagram: { label: "Instagram", hosts: ["instagram.com", "instagr.am"] },
  tiktok: { label: "TikTok", hosts: ["tiktok.com"] },
  youtube: { label: "YouTube", hosts: ["youtube.com", "youtu.be"] },
  telegram: { label: "Telegram", hosts: ["t.me", "telegram.me"] },
  x: { label: "X (Twitter)", hosts: ["x.com", "twitter.com"] },
  linkedin: { label: "LinkedIn", hosts: ["linkedin.com"] },
  website: { label: "Website", hosts: [] },
};
export const LINK_TYPES = Object.keys(LINK_INFO) as LinkType[];

const onHost = (host: string, base: string) => host === base || host.endsWith("." + base);

/** Turns what the seller pasted into a clean link, or explains what is wrong. */
export function detectLink(raw: string): { ok: true; link: ShopLink } | { ok: false; error: string } {
  let t = String(raw || "").trim();
  if (!t) return { ok: false, error: "Paste a link first." };
  if (t.length > 300) return { ok: false, error: "That link is too long." };
  if (t.startsWith("@")) return { ok: false, error: "Paste the full link to your page, e.g. https://www.tiktok.com/@yourshop" };
  if (!/^[a-z][a-z0-9+.-]*:/i.test(t)) t = "https://" + t; // "facebook.com/myshop" is fine
  let u: URL;
  try { u = new URL(t); } catch { return { ok: false, error: "That doesn’t look like a link. Example: https://facebook.com/yourshop" }; }
  if (u.protocol !== "https:" && u.protocol !== "http:") return { ok: false, error: "Only web links (https://…) can be added." };
  if (u.username || u.password) return { ok: false, error: "That link can’t be used." };
  const host = u.hostname.toLowerCase().replace(/^(www|m|mobile)\./, "");
  if (!host.includes(".") || /^[\d.]+$/.test(host) || host === "localhost") return { ok: false, error: "That doesn’t look like a real website address." };
  if (onHost(host, "wa.me") || onHost(host, "whatsapp.com")) return { ok: false, error: "Add WhatsApp in the WhatsApp number box instead." };
  if (onHost(host, "amcolink.com")) return { ok: false, error: "Add links to your other pages, not to Amcolink." };
  const type = (LINK_TYPES.find((k) => LINK_INFO[k].hosts.some((h) => onHost(host, h))) || "website") as LinkType;
  if (type !== "website") u.protocol = "https:";
  u.hash = "";
  const url = u.toString();
  if (url.length > 300 || /[\s<>"']/.test(url)) return { ok: false, error: "That link can’t be used." };
  return { ok: true, link: { type, url } };
}

/** Checks a whole list (from the form): clean links, at most 6, one per platform. */
export function cleanLinks(list: unknown): { ok: true; links: ShopLink[] } | { ok: false; error: string } {
  if (!Array.isArray(list)) return { ok: true, links: [] };
  const out: ShopLink[] = [];
  for (const item of list.slice(0, 20)) {
    const r = detectLink(typeof item === "string" ? item : (item as ShopLink)?.url);
    if (!r.ok) return r;
    if (out.some((l) => l.type === r.link.type)) return { ok: false, error: `Only one ${LINK_INFO[r.link.type].label} link, please.` };
    out.push(r.link);
  }
  if (out.length > MAX_LINKS) return { ok: false, error: `You can add up to ${MAX_LINKS} links.` };
  return { ok: true, links: out };
}

/** Links to show for a shop: the new list, or (for shops saved before the list existed) the old separate fields. */
export function shopLinks(shop: { links?: unknown; social_links?: Record<string, string> | null; telegram?: string | null }): ShopLink[] {
  if (Array.isArray(shop.links) && shop.links.length) return cleanList(shop.links);
  const s = shop.social_links || {};
  const tg = shop.telegram?.trim();
  const tgUrl = tg ? (/^https?:\/\//i.test(tg) ? tg : `https://t.me/${tg.replace(/^@/, "").replace(/[^A-Za-z0-9_]/g, "")}`) : "";
  return cleanList([s.facebook, s.instagram, tgUrl, s.website].filter(Boolean));
}
function cleanList(list: unknown[]): ShopLink[] {
  const out: ShopLink[] = [];
  for (const item of list) {
    const r = detectLink(typeof item === "string" ? item : (item as ShopLink)?.url);
    if (r.ok && !out.some((l) => l.type === r.link.type) && out.length < MAX_LINKS) out.push(r.link);
  }
  return out;
}

/** Copies the list into the old fields too, so older pages keep working. */
export function legacyFields(links: ShopLink[]) {
  const social_links: Record<string, string> = {};
  for (const k of ["facebook", "instagram", "website"] as const) { const l = links.find((x) => x.type === k); if (l) social_links[k] = l.url; }
  const tg = links.find((x) => x.type === "telegram")?.url || null;
  return { social_links, telegram: tg && tg.length <= 100 ? tg : null };
}

/** Short text to show under a link, e.g. "facebook.com/amina-fashion". */
export function linkDisplay(url: string): string {
  try { const u = new URL(url); return (u.hostname.replace(/^www\./, "") + u.pathname.replace(/\/$/, "")).slice(0, 60); } catch { return url.slice(0, 60); }
}
