// Copied from the Amcolink website repo, lib/conditions.ts at commit dde47f3b (only import paths and env names adapted). The website is the source of truth: update both together.
export const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "used", label: "Used" },
  { value: "refurbished", label: "Refurbished" },
] as const;

export function conditionLabel(value?: string | null): string | null {
  return CONDITIONS.find((c) => c.value === value)?.label ?? null;
}
