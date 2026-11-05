// Copied from the Amcolink website repo, lib/gifts.ts at commit 13076bf7 (only import paths adapted). The website is the source of truth: update both together.
/** Gift tags sellers can add to a listing. Keep in sync with check_gift_tags() in migration 010. */
export const GIFT_OCCASIONS = [
  { value: "eid", label: "Eid", emoji: "🌙" },
  { value: "wedding", label: "Wedding", emoji: "💍" },
  { value: "birthday", label: "Birthday", emoji: "🎂" },
  { value: "new_baby", label: "New baby", emoji: "👶" },
  { value: "graduation", label: "Graduation", emoji: "🎓" },
  { value: "anniversary", label: "Anniversary", emoji: "💝" },
] as const;

export const GIFT_FOR = [
  { value: "her", label: "For her" },
  { value: "him", label: "For him" },
  { value: "kids", label: "For kids" },
  { value: "baby", label: "For baby" },
  { value: "parents", label: "For parents" },
  { value: "home", label: "For the home" },
  { value: "anyone", label: "For anyone" },
] as const;

export const occasionValues: string[] = GIFT_OCCASIONS.map((o) => o.value);
export const giftForValues: string[] = GIFT_FOR.map((o) => o.value);

export function isGift(ad: { gift_occasions?: string[] | null; gift_for?: string[] | null }): boolean {
  return Boolean(ad.gift_occasions?.length || ad.gift_for?.length);
}

export function isFree(ad: { price: number | null }): boolean {
  return ad.price !== null && ad.price !== undefined && Number(ad.price) === 0;
}
