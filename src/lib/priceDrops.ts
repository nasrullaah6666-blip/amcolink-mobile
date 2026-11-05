import { useCallback, useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { db } from '@/api/db';
import { useAuth } from '@/auth/session';
import { DEAL_DAYS, dealPercent } from '@/core/freshness';

/**
 * Price drops on saved items (website: lib/priceDrops.ts + components/DropDot.tsx, key soko-drops-seen):
 * items saved BEFORE their price dropped in the last 7 days. A dot on the Saved tab until Saved is opened.
 */
export async function getPriceDrops(c: SupabaseClient, userId: string): Promise<{ ids: Set<string>; latest: string | null }> {
  try {
    const { data } = await c.from('favorites')
      .select('created_at, ads!inner(id,price,previous_price,price_dropped_at,availability,status)')
      .eq('user_id', userId).not('ad_id', 'is', null).not('ads.previous_price', 'is', null)
      .gte('ads.price_dropped_at', new Date(Date.now() - DEAL_DAYS * 86_400_000).toISOString());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const drops = (data || []).map((f: any) => ({ savedAt: f.created_at as string, ad: Array.isArray(f.ads) ? f.ads[0] : f.ads }))
      .filter((x) => x.ad && x.ad.status === 'published' && x.ad.availability !== 'sold' && dealPercent(x.ad) && x.ad.price_dropped_at > x.savedAt)
      .map((x) => ({ adId: x.ad.id as string, at: x.ad.price_dropped_at as string }));
    const latest = drops.reduce<string | null>((m, d) => (!m || d.at > m ? d.at : m), null);
    return { ids: new Set(drops.map((d) => d.adId)), latest };
  } catch {
    return { ids: new Set<string>(), latest: null };
  }
}

const KEY = 'soko-drops-seen';
const EVENT = 'soko-drops-seen';

export function usePriceDrops() {
  const { user } = useAuth();
  return useQuery({ queryKey: ['price-drops', user?.id], queryFn: () => getPriceDrops(db(), user!.id), enabled: !!user, staleTime: 5 * 60_000 });
}

/** True when a saved item got cheaper since Saved was last opened. */
export function useDropDot(): boolean {
  const drops = usePriceDrops().data;
  const [seen, setSeen] = useState<string | null>(null);
  const load = useCallback(() => { AsyncStorage.getItem(KEY).then((v) => setSeen(v ?? '')).catch(() => setSeen('')); }, []);
  useEffect(() => {
    load();
    const sub = DeviceEventEmitter.addListener(EVENT, load);
    return () => sub.remove();
  }, [load]);
  return !!drops?.latest && seen !== null && drops.latest > seen;
}

/** Saved page: marks all current price drops as seen. */
export async function markDropsSeen(latest: string | null) {
  if (!latest) return;
  try { await AsyncStorage.setItem(KEY, latest); } catch { /* ignore */ }
  DeviceEventEmitter.emit(EVENT);
}
