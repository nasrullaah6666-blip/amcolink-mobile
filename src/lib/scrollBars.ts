import { makeMutable, useAnimatedScrollHandler } from 'react-native-reanimated';

/**
 * Website behaviour (components/ScrollChrome.tsx): on phones the bottom bar slides away while you scroll down
 * and comes back as soon as you scroll up, or when you are back at the top. 1 = hidden, 0 = shown.
 */
export const barsHidden = makeMutable(0);

type Ctx = { last?: number; travelled?: number };

/** Same rules as the website: ignore tiny finger shakes (12 px) and never hide in the first 120 px. */
export function barsOnScroll(y: number, ctx: Ctx) {
  'worklet';
  const pos = Math.max(y, 0);
  const delta = pos - (ctx.last ?? 0);
  ctx.last = pos;
  if (pos <= 10) { ctx.travelled = 0; barsHidden.value = 0; return; }
  if (delta === 0) return;
  const t = ctx.travelled ?? 0;
  const travelled = Math.sign(delta) === Math.sign(t) ? t + delta : delta;
  ctx.travelled = travelled;
  if (travelled > 12 && pos > 120) barsHidden.value = 1;
  else if (travelled < -12) barsHidden.value = 0;
}

/** For a tab screen's list: pass the result as onScroll of an Animated.FlatList / Animated.ScrollView. */
export function useBarsScroll() {
  return useAnimatedScrollHandler<Ctx>({ onScroll: (e, ctx) => barsOnScroll(e.contentOffset.y, ctx) });
}
