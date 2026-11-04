import { visitorKey } from '@/lib/visitor';
import { db } from './db';

export type EventKind = 'view' | 'whatsapp' | 'call' | 'share';

/**
 * Records a view or contact tap (same database function as the website: track_event).
 * When signed in, the tap is linked to the account; the website only allows a review after a WhatsApp or call tap.
 * Never throws: statistics must never break a screen.
 */
export async function trackEvent(shopId: string, adId: string | null, kind: EventKind): Promise<void> {
  try {
    await db().rpc('track_event', { p_shop: shopId, p_ad: adId, p_kind: kind, p_visitor: await visitorKey() });
  } catch {
    // ignore
  }
}
