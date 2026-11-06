import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppText, Button, Chip } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ChipRow } from '@/components/ChipRow';
import { AwayMode } from '@/components/AwayMode';
import { Photo } from '@/components/Photo';
import { Empty, ErrorState, Loading } from '@/components/States';
import { useAuth } from '@/auth/session';
import { confirmAll, deleteAd, fetchMyAds, fetchMyShops, fetchMyStats, setAvailability, updateAd, type MyAd, type Stat } from '@/api/seller';
import { agoLabel, daysSince, freshDaysFor, nudgeDaysFor } from '@/core/freshness';
import { formatPrice } from '@/core/utils';
import { colors, radius, space } from '@/theme/tokens';

type Totals = { views: number; whatsapp: number; calls: number; shares: number };
const EMPTY: Totals = { views: 0, whatsapp: 0, calls: 0, shares: 0 };
const add = (a: Totals, b: Partial<Totals>): Totals => ({
  views: a.views + Number(b.views || 0), whatsapp: a.whatsapp + Number(b.whatsapp || 0), calls: a.calls + Number(b.calls || 0), shares: a.shares + Number(b.shares || 0),
});

type Filter = 'all' | 'live' | 'reserved' | 'sold' | 'hidden';
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' }, { value: 'live', label: 'Live' }, { value: 'reserved', label: 'Reserved' }, { value: 'sold', label: 'Sold' }, { value: 'hidden', label: 'Hidden' },
];
// Same filter rules as the website dashboard.
function matches(ad: MyAd, f: Filter): boolean {
  if (f === 'live') return ad.status === 'published' && ad.availability === 'available' && !ad.hidden_by_owner;
  if (f === 'reserved') return ad.status !== 'removed' && ad.availability === 'reserved';
  if (f === 'sold') return ad.availability === 'sold';
  if (f === 'hidden') return Boolean(ad.hidden_by_owner);
  return true;
}

function statusLine(ad: MyAd): string {
  if (ad.status === 'removed') return ad.review_reason?.startsWith('Houses & Rentals now need') ? 'hidden: houses and rooms now need a Property account' : 'removed by admin';
  if (ad.status === 'review') return ad.review_reason?.startsWith('Same photo') ? '⏳ waiting for a check: please use your own real photos' : '⏳ waiting for safety check';
  return ad.availability;
}

function AdRow({ ad, stat, onChanged }: { ad: MyAd; stat: Totals; onChanged: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const run = async (key: string, fn: () => Promise<unknown>) => {
    setBusy(key); setMsg('');
    try { await fn(); onChanged(); } catch (e) { setMsg((e as Error).message || 'Could not update. Please try again.'); } finally { setBusy(null); }
  };
  const age = daysSince(ad.confirmed_at);
  const published = ad.status === 'published';
  const askDelete = () => Alert.alert('Delete this listing permanently?', 'Its photos and statistics are removed too. This can’t be undone. To take it down for a while, use Hide instead.', [
    { text: 'Cancel', style: 'cancel' }, { text: 'Yes, delete', style: 'destructive', onPress: () => run('delete', () => deleteAd(ad.id, ad.photo_urls ?? [])) },
  ]);
  return (
    <View style={styles.adCard}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Open ${ad.title}`} onPress={() => router.push({ pathname: '/ads/[id]', params: { id: ad.id } })} style={styles.adTop}>
        <Photo src={ad.photo_urls?.[0]} thumb style={[styles.thumb, ad.hidden_by_owner ? styles.faded : null]} label={ad.title} />
        <View style={styles.flex}>
          <AppText variant="label" numberOfLines={1}>{ad.title}</AppText>
          <AppText variant="caption" tone="secondary" numberOfLines={2}>
            {ad.price === null ? 'Price on request' : Number(ad.price) === 0 ? 'Free' : formatPrice(ad.price, ad.currency)} · {ad.category} · {statusLine(ad)}
          </AppText>
          {ad.hidden_by_owner ? <AppText variant="caption">🙈 Hidden: only you can see it</AppText> : null}
          {ad.pinned_at && !ad.hidden_by_owner ? <AppText variant="caption" tone="green">📌 Pinned to the top of your profile</AppText> : null}
          <AppText variant="caption" tone="secondary">👁 {stat.views} · WhatsApp {stat.whatsapp} · Calls {stat.calls}</AppText>
          {published && ad.availability !== 'sold' ? (
            age !== null && age < nudgeDaysFor(ad.category)
              ? <AppText variant="caption" tone="secondary">Confirmed {agoLabel(ad.confirmed_at)}</AppText>
              : <Pressable accessibilityRole="button" onPress={() => run('confirm', () => setAvailability(ad.id, ad.availability))}>
                  <AppText variant="caption" tone="error">{busy === 'confirm' ? 'Saving…' : `Not confirmed for ${age ?? freshDaysFor(ad.category)} days. Tap to confirm ✓`}</AppText>
                </Pressable>
          ) : null}
        </View>
      </Pressable>
      {published ? (
        <View style={styles.chips}>
          {(['available', 'reserved', 'sold'] as const).map((v) => (
            <Chip key={v} label={busy === v ? 'Saving…' : v === 'available' ? 'Still available' : v === 'reserved' ? 'Reserved' : 'Sold'}
              selected={ad.availability === v} onPress={() => run(v, () => setAvailability(ad.id, v))} />
          ))}
        </View>
      ) : null}
      <View style={styles.actions}>
        {ad.status !== 'removed' ? <Button style={styles.flex} title="Edit" variant="outline" onPress={() => router.push({ pathname: '/edit-ad/[id]', params: { id: ad.id } })} /> : null}
        {published && !ad.hidden_by_owner ? <Button style={styles.flex} title={ad.pinned_at ? 'Unpin' : 'Pin'} variant="outline" loading={busy === 'pin'}
          accessibilityLabel={ad.pinned_at ? 'Unpin from the top of my profile' : 'Pin to the top of my profile (up to 4)'}
          onPress={() => run('pin', () => updateAd(ad.id, { pinned_at: ad.pinned_at ? null : new Date().toISOString() }))} /> : null}
        {ad.status !== 'removed' ? <Button style={styles.flex} title={ad.hidden_by_owner ? 'Show' : 'Hide'} variant="outline" loading={busy === 'hide'} onPress={() => run('hide', () => updateAd(ad.id, { hidden_by_owner: !ad.hidden_by_owner }))} /> : null}
        {/* Compact sizes: Delete fits as a small text button at the end of the row. */}
        <Button title="Delete" variant="ghost" loading={busy === 'delete'} onPress={askDelete} accessibilityLabel={`Delete ${ad.title} permanently`} style={styles.delete} />
      </View>
      {msg ? <AppText variant="caption" tone="error">{msg}</AppText> : null}
    </View>
  );
}

/** My ads (website: app/dashboard). Editing an ad and the profile open in later tasks. */
export default function Dashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const shopsQ = useQuery({ queryKey: ['my-shops', user?.id], queryFn: () => fetchMyShops(user!.id), enabled: !!user });
  const shops = useMemo(() => shopsQ.data ?? [], [shopsQ.data]);
  const [picked, setPicked] = useState<string | null>(null);
  const current = shops.find((s) => s.id === picked) ?? shops[0];
  const ids = shops.map((s) => s.id);
  const adsQ = useQuery({ queryKey: ['my-ads', user?.id, ids.join(',')], queryFn: () => fetchMyAds(ids), enabled: ids.length > 0 });
  const statsQ = useQuery({ queryKey: ['my-stats', user?.id], queryFn: () => fetchMyStats(), enabled: ids.length > 0 });
  const [filter, setFilter] = useState<Filter>('all');
  const [note, setNote] = useState('');

  const refresh = () => { qc.invalidateQueries({ queryKey: ['my-ads', user?.id] }); qc.invalidateQueries({ queryKey: ['my-stats', user?.id] }); };

  if (!user) {
    return <SafeAreaView style={styles.page}><ScreenHeader title="My ads" /><View style={styles.pad}><Empty title="Sign in to sell" action={{ title: 'Sign in', onPress: () => router.replace('/sign-in') }} /></View></SafeAreaView>;
  }
  if (shopsQ.isPending) return <SafeAreaView style={styles.page}><ScreenHeader title="My ads" /><Loading /></SafeAreaView>;
  if (shopsQ.isError) return <SafeAreaView style={styles.page}><ScreenHeader title="My ads" /><View style={styles.pad}><ErrorState message={(shopsQ.error as Error).message} onRetry={() => shopsQ.refetch()} /></View></SafeAreaView>;
  if (!current) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.page}>
        <ScreenHeader title="Start selling" />
        <View style={styles.pad}>
          <Empty title="You don't sell on Amcolink yet" hint="One profile is all you need. You choose what to post each time." action={{ title: 'Create your seller profile', onPress: () => router.push('/shops/new') }} />
        </View>
      </SafeAreaView>
    );
  }

  const byAd = new Map<string, Totals>(); const byShop = new Map<string, Totals>();
  for (const r of (statsQ.data ?? []) as Stat[]) {
    byShop.set(r.shop_id, add(byShop.get(r.shop_id) ?? EMPTY, r));
    if (r.ad_id) byAd.set(r.ad_id, add(byAd.get(r.ad_id) ?? EMPTY, r));
  }
  const allAds = adsQ.data ?? [];
  const myAds = allAds.filter((a) => a.shop_id === current.id);
  const liveAds = allAds.filter((a) => a.status === 'published' && a.availability !== 'sold');
  // Property waits 30 days, everything else 14 (website lib/freshness.ts); the nudge starts a week before an ad drops out.
  const needConfirm = liveAds.filter((a) => (daysSince(a.confirmed_at) ?? freshDaysFor(a.category)) >= nudgeDaysFor(a.category));
  const hiddenFromSearch = liveAds.filter((a) => (daysSince(a.confirmed_at) ?? freshDaysFor(a.category)) >= freshDaysFor(a.category));
  const shown = myAds.filter((a) => matches(a, filter));
  const cur = byShop.get(current.id) ?? EMPTY;

  const header = (
    <View style={styles.headGap}>
      {shops.length > 1 ? <ChipRow options={shops.map((s) => ({ value: s.id, label: s.name }))} value={current.id} onChange={setPicked} /> : <AppText variant="heading">{current.name}</AppText>}
      <View style={styles.row}>
        <Button style={styles.flex} title="View my page" variant="outline" onPress={() => router.push({ pathname: '/shops/[slug]', params: { slug: current.slug } })} />
        <Button style={styles.flex} title="Edit profile" variant="outline" onPress={() => router.push({ pathname: '/edit-profile/[id]', params: { id: current.id } })} />
      </View>
      {current.status !== 'approved' ? (
        <View style={styles.alert}><AppText variant="bodySmall">
          This account is {current.status}. {current.status === 'pending' ? 'Hidden for now while we check it; only you can see it. You can still add listings.' : 'It cannot post or edit listings.'}
          {current.status === 'pending' && (current as { review_reason?: string | null }).review_reason ? ` Safety check: ${(current as { review_reason?: string | null }).review_reason}` : ''}
        </AppText></View>
      ) : null}
      {current.status === 'approved' ? (
        <AwayMode shopId={current.id} awaySince={(current as { away_since?: string | null }).away_since ?? null}
          awayUntil={(current as { away_until?: string | null }).away_until ?? null}
          onChanged={() => qc.invalidateQueries({ queryKey: ['my-shops', user.id] })} />
      ) : null}
      {needConfirm.length > 0 ? (
        <View style={styles.alert}>
          <AppText variant="bodySmall">⚠ {needConfirm.length} {needConfirm.length === 1 ? 'item' : 'items'} not confirmed lately{hiddenFromSearch.length ? ` (${hiddenFromSearch.length} hidden from search)` : ''}.</AppText>
          <Button title="Confirm all are still available" variant="outline" onPress={async () => {
            try { await confirmAll(user.id); setNote('Done — all your items show as available today.'); refresh(); } catch (e) { setNote((e as Error).message); }
          }} />
          {note ? <AppText variant="caption">{note}</AppText> : null}
        </View>
      ) : null}
      <AppText variant="label">Last 30 days</AppText>
      <View style={styles.stats}>
        {[['Views', cur.views], ['WhatsApp', cur.whatsapp], ['Calls', cur.calls], ['Shares', cur.shares]].map(([l, v]) => (
          <View key={String(l)} style={styles.stat}><AppText variant="heading">{Number(v).toLocaleString()}</AppText><AppText variant="caption" tone="secondary">{l}</AppText></View>
        ))}
      </View>
      <AppText variant="heading">Your ads ({myAds.length})</AppText>
      {myAds.length >= 7 ? <ChipRow options={FILTERS.map((f) => ({ value: f.value, label: `${f.label} ${myAds.filter((a) => matches(a, f.value)).length}` }))} value={filter} onChange={(v) => setFilter(v as Filter)} /> : null}
    </View>
  );

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.page}>
      <ScreenHeader title="My ads" />
      <FlatList
        data={shown}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        refreshControl={<RefreshControl refreshing={adsQ.isRefetching} onRefresh={refresh} tintColor={colors.green} colors={[colors.green]} />}
        renderItem={({ item }) => <AdRow ad={item} stat={byAd.get(item.id) ?? EMPTY} onChanged={refresh} />}
        ListEmptyComponent={adsQ.isPending ? <Loading /> : adsQ.isError ? <ErrorState message={(adsQ.error as Error).message} onRetry={() => adsQ.refetch()} /> :
          <AppText variant="bodySmall" tone="secondary">{myAds.length ? 'No items in this filter.' : 'Nothing posted yet. Tap Post Ad to add your first one.'}</AppText>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  pad: { padding: space.lg },
  list: { padding: space.lg, gap: space.sm + 2, paddingBottom: space.xxl },
  headGap: { gap: space.md, marginBottom: space.sm },
  row: { flexDirection: 'row', gap: space.sm },
  flex: { flex: 1, gap: 2 },
  alert: { gap: space.sm, padding: space.md, borderRadius: radius.md, backgroundColor: colors.greenTint },
  stats: { flexDirection: 'row', paddingVertical: space.sm + 2, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  stat: { flex: 1, alignItems: 'center' },
  adCard: { gap: space.sm + 2, padding: space.sm + 2, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  adTop: { flexDirection: 'row', gap: space.md },
  thumb: { width: 60, height: 60, borderRadius: radius.md },
  faded: { opacity: 0.5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  actions: { flexDirection: 'row', gap: space.sm },
  delete: { paddingHorizontal: space.sm },
});
