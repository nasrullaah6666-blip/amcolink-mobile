import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { SITE_URL } from '@/lib/site';

/**
 * "Never pay in advance" (website: components/ContactGate.tsx, key amc_safety_ok_v1): before the first Call, WhatsApp
 * or seller link for a listing or profile, the buyer sees this reminder once. After "continue" it is not shown again
 * for that listing/profile on this phone.
 */
const KEY = 'amc_safety_ok_v1';

async function seen(key: string): Promise<boolean> {
  try { return (JSON.parse((await AsyncStorage.getItem(KEY)) || '[]') as string[]).includes(key); } catch { return false; }
}
export async function remember(key: string) {
  try {
    const list = (JSON.parse((await AsyncStorage.getItem(KEY)) || '[]') as string[]).filter((k) => k !== key);
    await AsyncStorage.setItem(KEY, JSON.stringify([key, ...list].slice(0, 500)));
  } catch { /* storage blocked: the reminder simply shows again next time */ }
}

/** Runs `go` straight away if this listing/profile was already confirmed, otherwise after the reminder. */
export async function safetyGate(gateKey: string, action: string, go: () => void) {
  if (await seen(gateKey)) { go(); return; }
  Alert.alert(
    'Never pay in advance',
    'Amcolink does not handle payments. Pay only after you see and check the item, in person.\n\nNever share PINs or codes (M-Pesa, EVC, bank).',
    [
      { text: 'Safety tips', onPress: () => { WebBrowser.openBrowserAsync(`${SITE_URL}/safety`).catch(() => {}); } },
      { text: 'Cancel', style: 'cancel' },
      { text: action, onPress: () => { remember(gateKey); go(); } },
    ],
    { cancelable: true },
  );
}
