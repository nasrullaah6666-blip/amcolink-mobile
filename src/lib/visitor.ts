import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Anonymous random device key, used only to count views and contact taps without double counting
 * (the website uses a random cookie for the same purpose). It contains no personal data.
 */
const KEY = 'amc_visitor_v1';
let cached: string | null = null;

function randomHex(n: number): string {
  let s = '';
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 16).toString(16);
  return s;
}

export async function visitorKey(): Promise<string> {
  if (cached) return cached;
  try {
    const saved = await AsyncStorage.getItem(KEY);
    if (saved && /^[0-9a-f]{40}$/.test(saved)) return (cached = saved);
    const fresh = randomHex(40);
    await AsyncStorage.setItem(KEY, fresh);
    return (cached = fresh);
  } catch {
    return (cached = randomHex(40));
  }
}
