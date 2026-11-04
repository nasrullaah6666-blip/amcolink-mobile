// Copied from the Amcolink website repo, lib/hours.ts at commit dde47f3b (only import paths and env names adapted). The website is the source of truth: update both together.
import { countryByName } from "@/core/geo";

/** Opening hours by day: { mon: { open: "08:00", close: "18:00" }, … }. A missing day means closed. Empty = not set. */
export const DAYS = [
  { key: "mon", label: "Monday", short: "Mon" }, { key: "tue", label: "Tuesday", short: "Tue" }, { key: "wed", label: "Wednesday", short: "Wed" },
  { key: "thu", label: "Thursday", short: "Thu" }, { key: "fri", label: "Friday", short: "Fri" }, { key: "sat", label: "Saturday", short: "Sat" },
  { key: "sun", label: "Sunday", short: "Sun" },
] as const;
export type DayKey = (typeof DAYS)[number]["key"];
export type Hours = Partial<Record<DayKey, { open: string; close: string }>>;

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Keeps only valid days and times. */
export function cleanHours(v: unknown): Hours {
  const out: Hours = {};
  if (!v || typeof v !== "object" || Array.isArray(v)) return out;
  for (const d of DAYS) {
    const x = (v as Record<string, any>)[d.key];
    if (x && TIME.test(String(x.open)) && TIME.test(String(x.close)) && x.open !== x.close) out[d.key] = { open: String(x.open), close: String(x.close) };
  }
  return out;
}
export const hasHours = (h: Hours) => Object.keys(h).length > 0;

const ZONES: Record<string, string> = {
  KE: "Africa/Nairobi", ET: "Africa/Addis_Ababa", SO: "Africa/Mogadishu", UG: "Africa/Kampala", TZ: "Africa/Dar_es_Salaam",
  DJ: "Africa/Djibouti", ER: "Africa/Asmara", SS: "Africa/Juba", RW: "Africa/Kigali", BI: "Africa/Bujumbura", CD: "Africa/Lubumbashi",
};
const zoneFor = (country?: string | null) => ZONES[countryByName(country || "")?.code || ""] || "Africa/Nairobi";

/** "8:00 AM" style time. */
export function niceTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ap = h < 12 ? "AM" : "PM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")} ${ap}`;
}

/** Is the shop open right now (in the shop's own country time)? */
export function openStatus(h: Hours, country?: string | null, now = new Date()): { open: boolean; text: string } | null {
  if (!hasHours(h)) return null;
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: zoneFor(country), weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const wd = (parts.find((p) => p.type === "weekday")?.value || "Mon").slice(0, 3).toLowerCase();
  const mins = Number(parts.find((p) => p.type === "hour")?.value) * 60 + Number(parts.find((p) => p.type === "minute")?.value);
  const idx = DAYS.findIndex((d) => d.key === wd);
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
  const today = h[DAYS[idx].key];
  const yesterday = h[DAYS[(idx + 6) % 7].key];
  // Yesterday's hours that run past midnight
  if (yesterday && toMin(yesterday.close) < toMin(yesterday.open) && mins < toMin(yesterday.close)) return { open: true, text: `Open now · closes ${niceTime(yesterday.close)}` };
  if (today) {
    const o = toMin(today.open), c = toMin(today.close);
    const inside = c > o ? mins >= o && mins < c : mins >= o; // overnight: open until midnight today
    if (inside) return { open: true, text: `Open now · closes ${niceTime(today.close)}` };
    if (mins < o) return { open: false, text: `Closed · opens ${niceTime(today.open)}` };
  }
  for (let i = 1; i <= 7; i++) {
    const d = DAYS[(idx + i) % 7];
    const x = h[d.key];
    if (x) return { open: false, text: `Closed · opens ${i === 1 ? "tomorrow" : d.label} ${niceTime(x.open)}` };
  }
  return { open: false, text: "Closed" };
}

/** Rows for the week, joining days with the same hours: "Mon–Fri 8:00 AM – 6:00 PM". */
export function weekRows(h: Hours): { days: string; time: string }[] {
  const rows: { days: string; time: string }[] = [];
  let i = 0;
  while (i < 7) {
    const x = h[DAYS[i].key];
    const sig = x ? `${x.open}-${x.close}` : "closed";
    let j = i;
    while (j + 1 < 7) { const y = h[DAYS[j + 1].key]; if ((y ? `${y.open}-${y.close}` : "closed") !== sig) break; j++; }
    rows.push({ days: i === j ? DAYS[i].short : `${DAYS[i].short}–${DAYS[j].short}`, time: x ? `${niceTime(x.open)} – ${niceTime(x.close)}` : "Closed" });
    i = j + 1;
  }
  return rows;
}

/** schema.org openingHours, e.g. ["Mo 08:00-18:00", …] */
export function schemaHours(h: Hours): string[] {
  const map: Record<DayKey, string> = { mon: "Mo", tue: "Tu", wed: "We", thu: "Th", fri: "Fr", sat: "Sa", sun: "Su" };
  return DAYS.filter((d) => h[d.key]).map((d) => `${map[d.key]} ${h[d.key]!.open}-${h[d.key]!.close}`);
}
