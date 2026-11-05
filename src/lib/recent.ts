import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * "Continue where you left off" (website: components/RecordView + RecentlyViewed, key amc_recent_v1):
 * the last listings this phone opened, kept on the phone only (no account needed). Max 12 kept, 10 shown, 30 days.
 */
export type RecentItem = { id: string; title: string; price: string; photo: string | null; city: string; at: number };
export const RECENT_KEY = 'amc_recent_v1';
const MONTH = 30 * 86_400_000;

export async function loadRecent(now = Date.now()): Promise<RecentItem[]> {
  try {
    const list: RecentItem[] = JSON.parse((await AsyncStorage.getItem(RECENT_KEY)) || '[]');
    return list.filter((x) => x && x.id && now - x.at < MONTH).slice(0, 10);
  } catch { return []; }
}

export async function recordView(item: Omit<RecentItem, 'at'>, now = Date.now()) {
  try {
    const list: RecentItem[] = JSON.parse((await AsyncStorage.getItem(RECENT_KEY)) || '[]');
    const next = [{ ...item, at: now }, ...list.filter((x) => x && x.id !== item.id)].slice(0, 12);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch { /* storage blocked: skip */ }
}

export async function clearRecent() {
  try { await AsyncStorage.removeItem(RECENT_KEY); } catch { /* ignore */ }
}
