import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { db } from '@/api/db';
import { noticeTarget } from '@/api/account';
import { SITE_URL } from '@/lib/site';

/**
 * Phone alerts. The website's database already writes every alert into `notifications`
 * (price drops on saved ads, saved-search matches, approvals …) and has a `push_tokens` table.
 * The app only: asks permission at a moment that makes sense, saves this phone's token, and opens the right
 * screen when an alert is tapped. A small server sender (Supabase) delivers the alerts — set up separately.
 *
 * Switched off until the build contains Firebase settings (google-services.json → extra.pushReady).
 */
export const pushReady = (): boolean => Platform.OS === 'android' && Constants.expoConfig?.extra?.pushReady === true;

let saved: string | null = null;

async function channel() {
  await Notifications.setNotificationChannelAsync('alerts', {
    name: 'Alerts',
    description: 'Price drops, new ads for your saved searches and news about your ads',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

async function saveToken(userId: string) {
  const { data: token } = await Notifications.getDevicePushTokenAsync();
  if (typeof token !== 'string' || token === saved) return;
  const { error } = await db().from('push_tokens').upsert({ token, user_id: userId, platform: 'android' }, { onConflict: 'token' });
  if (!error) saved = token;
}

/** At start-up: if this phone already allowed alerts, make sure its token is saved. Never asks. */
export async function refreshPush(userId: string) {
  if (!pushReady()) return;
  try {
    const p = await Notifications.getPermissionsAsync();
    if (p.granted) { await channel(); await saveToken(userId); }
  } catch { /* alerts are optional */ }
}

/**
 * Asks once, at a moment that explains itself: saving an ad, saving a search, or opening Notifications.
 * Android shows its own "Allow Amcolink (staging) to send you notifications?" question.
 */
export async function askForPush(userId: string) {
  if (!pushReady()) return;
  try {
    await channel();
    let p = await Notifications.getPermissionsAsync();
    if (!p.granted && p.canAskAgain) p = await Notifications.requestPermissionsAsync();
    if (p.granted) await saveToken(userId);
  } catch { /* alerts are optional */ }
}

/** On sign-out: this phone stops getting that person's alerts (done while still signed in). */
export async function forgetPush() {
  if (!saved) return;
  try { await db().from('push_tokens').delete().eq('token', saved); } catch { /* ignore */ }
  saved = null;
}

/** Tapping an alert opens the same place as tapping it in the Notifications list. */
function open(response: Notifications.NotificationResponse | null) {
  const link = response?.notification.request.content.data?.link;
  const t = noticeTarget(typeof link === 'string' ? link : null);
  if (t?.app) router.push(t.app as never);
  else if (t?.web) WebBrowser.openBrowserAsync(`${SITE_URL}${t.web}`).catch(() => {});
  else router.push('/notifications');
}

/** Listens for taps on alerts (also the one that opened the app). Returns a clean-up function. */
export function listenForTaps(): () => void {
  if (!pushReady()) return () => {};
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
  Notifications.getLastNotificationResponseAsync().then((r) => { if (r) open(r); }).catch(() => {});
  const sub = Notifications.addNotificationResponseReceivedListener(open);
  return () => sub.remove();
}
