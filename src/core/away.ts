// Copied from the website: lib/away.ts (commit 13076bf7). Keep in step with the website.

/** A shop is "away" from away_since until away_until (no end date = until the owner turns it off). */
export function isAway(shop: { away_since?: string | null; away_until?: string | null } | null | undefined): boolean {
  if (!shop?.away_since) return false;
  return !shop.away_until || new Date(shop.away_until).getTime() > Date.now();
}

export function awayUntilLabel(until?: string | null): string {
  if (!until) return "";
  return new Date(until).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** App only (the website uses a date box): checks a typed return date "YYYY-MM-DD" — tomorrow up to one year ahead. */
export function awayDateProblem(date: string, now = new Date()): string | null {
  if (!date) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "Write the date like 2027-03-31.";
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "That date doesn't exist.";
  const day = 86_400_000;
  if (d.getTime() < now.getTime()) return "Choose a day from tomorrow on.";
  if (d.getTime() > now.getTime() + 366 * day) return "Choose a day within one year.";
  return null;
}
