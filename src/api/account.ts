/** Notifications and account deletion — website: app/notifications, MarkNotificationsRead, components/DeleteAccount. */
import type { SupabaseClient } from '@supabase/supabase-js';
import { db, must } from './db';

export type Notice = { id: number; kind: string; title: string; body: string; link: string | null; read_at: string | null; created_at: string };

export async function fetchNotifications(userId: string, c: SupabaseClient = db()): Promise<Notice[]> {
  return must(await c.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100)) as Notice[];
}
export async function markAllRead(userId: string, c: SupabaseClient = db()) {
  await c.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', userId).is('read_at', null);
}
export async function clearNotifications(userId: string, c: SupabaseClient = db()) {
  const { error } = await c.from('notifications').delete().eq('user_id', userId);
  if (error) throw new Error(error.message);
}

/** Website rule: only follow links inside our own site. Returns an app route when the app has that screen. */
export function noticeTarget(link: string | null): { app?: { pathname: string; params: Record<string, string> }; web?: string } | null {
  if (!link || !/^\/[A-Za-z0-9/_\-?=&#.%]*$/.test(link) || link.startsWith('//')) return null;
  const ad = /^\/ads\/([0-9a-f-]{36})(?:[/?#]|$)/i.exec(link);
  if (ad) return { app: { pathname: '/ads/[id]', params: { id: ad[1] } } };
  const shop = /^\/shops\/([a-z0-9-]+)(?:[?#]|$)/i.exec(link);
  if (shop && shop[1] !== 'new') return { app: { pathname: '/shops/[slug]', params: { slug: shop[1] } } };
  if (/^\/dashboard(?:[?#]|$)/.test(link)) return { app: { pathname: '/dashboard', params: {} } };
  if (/^\/wanted(?:[?#]|$)/.test(link)) return { app: { pathname: '/wanted', params: {} } };
  return { web: link };
}

/** Deletes the photos first (the database cannot remove storage files), then the account and everything linked to it. */
export async function deleteMyAccount(userId: string, onStep: (msg: string) => void, c: SupabaseClient = db()) {
  onStep('Deleting your photos…');
  for (const bucket of ['ad-photos', 'shop-media']) {
    for (let round = 0; round < 10; round++) {
      const { data: files } = await c.storage.from(bucket).list(userId, { limit: 100 });
      if (!files?.length) break;
      await c.storage.from(bucket).remove(files.map((f) => `${userId}/${f.name}`));
      if (files.length < 100) break;
    }
  }
  onStep('Deleting your account…');
  const { error } = await c.rpc('delete_my_account');
  if (error) throw new Error(error.message);
  await c.auth.signOut().catch(() => undefined);
}
