// Copied from the Amcolink website repo, lib/searchWords.ts at commit dde47f3b (only import paths and env names adapted). The website is the source of truth: update both together.
/**
 * Word-by-word search. A search like "red sofa" is split into words and a listing must contain every word
 * (in its title, description, category or subcategory), in any order. A trailing "s" is ignored ("phones" finds "phone"),
 * and apostrophes split words ("L'Oréal" finds "L’Oréal" and "L'Oreal"-style titles written with either mark).
 * No imports here on purpose, so it can be tested on its own.
 */

/** Cleans what the visitor typed. Keeps letters, numbers, spaces and - ' . / ; drops every other mark. */
export function sanitizeQuery(value?: string | null, max = 60): string {
  if (!value) return "";
  return value
    .replace(/[’‘`´]/g, "'")
    .replace(/[^\p{L}\p{N}\s'./-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/** The words to look for (lowercase, at most 6). */
export function searchWords(q: string): string[] {
  const out: string[] = [];
  for (const raw of q.split(/\s+/)) {
    for (const part of raw.split("'")) {
      let w = part.replace(/^[./-]+|[./-]+$/g, "");
      if (!w) continue;
      if (w.length < 2 && !/\p{N}/u.test(w)) continue; // single letters like the "s" of "men's" add nothing
      if (w.length >= 4 && /s$/i.test(w) && !/ss$/i.test(w)) w = w.slice(0, -1);
      const lw = w.toLowerCase();
      if (!out.includes(lw)) out.push(lw);
    }
  }
  return out.slice(0, 6);
}

/** Several spellings of one word, as a database "or" filter over the listing's own text columns. Spellings only contain safe characters. */
export function variantsFilter(variants: string[]): string {
  return variants.flatMap((v) => ["title", "description", "category", "subcategory"].map((c) => `${c}.ilike.%${v}%`)).join(",");
}

/** "t-shirt" is also written "t shirt" or "tshirt": all three count as the same word. */
export function dashVariants(word: string): string[] {
  if (!word.includes("-")) return [word];
  const parts = word.split("-").filter(Boolean);
  return [...new Set([word, parts.join(" "), parts.join("")])].filter((v) => v.length >= 2);
}

/** One word, as a database "or" filter (hyphen and space spellings included). */
export function wordFilter(word: string): string {
  return variantsFilter(dashVariants(word));
}

/** Lowercase tokens with - _ / . ' treated as spaces and a trailing plural "s" removed ("T-shirts" and "t shirt" look the same). */
function tokens(text: string): string[] {
  return text.toLowerCase().replace(/[-_/.']/g, " ").split(/\s+/).filter(Boolean).map((w) => (w.length >= 4 && /s$/.test(w) && !/ss$/.test(w) ? w.slice(0, -1) : w));
}

/**
 * How well a listing title fits what was typed (higher is better):
 * 100 same words, 80 title starts with them, 60 title contains them together, 40 title has every word, 20 every word inside a longer word, 0 matched only in description or category.
 */
export function titleRelevance(title: string, q: string): number {
  const t = tokens(title), w = tokens(q);
  if (!w.length || !t.length) return 0;
  const tj = ` ${t.join(" ")} `, wj = w.join(" ");
  if (tj.trim() === wj) return 100;
  if (tj.startsWith(` ${wj} `)) return 80;
  if (tj.includes(` ${wj} `)) return 60;
  const key = w.filter((x) => x.length >= 2 || /\p{N}/u.test(x));
  if (key.length && key.every((x) => t.includes(x))) return 40;
  if (key.length && key.every((x) => tj.includes(x))) return 20;
  return 0;
}

/** Best matches first. Equal matches keep the order they came in (verified shops, then newest). */
export function rankByRelevance<T>(rows: T[], q: string, titleOf: (row: T) => string): T[] {
  return rows.map((r, i) => ({ r, i, s: titleRelevance(titleOf(r), q) })).sort((a, b) => b.s - a.s || a.i - b.i).map((x) => x.r);
}

/** Spellings that come back from the database: keep only plain letters and numbers (and the word itself), at most 8. */
export function cleanVariants(list: unknown, word: string): string[] {
  const out = [word];
  if (Array.isArray(list)) {
    for (const v of list) {
      const x = String(v ?? "").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "").slice(0, 40);
      if (x.length >= 2 && !out.includes(x)) out.push(x);
    }
  }
  return out.slice(0, 8);
}
