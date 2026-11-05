import React, { useState } from 'react';
import { Alert, FlatList, Linking, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { AppText, Button, Icon } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ChipRow } from '@/components/ChipRow';
import { SearchField } from '@/components/SearchField';
import { PickerField } from '@/components/PickerField';
import { ReportAndBlock } from '@/components/ReportAndBlock';
import { Empty, ErrorState, Loading } from '@/components/States';
import { useAuth } from '@/auth/session';
import { fetchWanted, wantedAction, WANTED_PAGE, type WantedPost } from '@/api/wanted';
import { agoLabel } from '@/core/freshness';
import { CATEGORIES } from '@/core/types';
import { formatPrice, whatsappLink } from '@/core/utils';
import { BRAND } from '@/lib/site';
import { useCountry } from '@/lib/countryPref';
import { colors, radius, space } from '@/theme/tokens';

const CATEGORY_OPTIONS = [{ value: '', label: 'All categories' }, ...CATEGORIES.filter((c) => c !== 'All').map((c) => ({ value: c, label: c }))];

function Card({ w, userId, onChanged }: { w: WantedPost; userId?: string; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const isOwner = !!userId && w.user_id === userId;
  const reply = w.whatsapp && !isOwner ? whatsappLink(w.whatsapp, `Hello ${w.poster_name}, I saw your request "${w.title}" on ${BRAND}. I have it: `) : null;
  const run = async (a: 'found' | 'reopen' | 'delete') => {
    setBusy(true);
    try { await wantedAction(w.id, a); onChanged(); } catch (e) { Alert.alert('Wanted', (e as Error).message || 'Could not update.'); } finally { setBusy(false); }
  };
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.flex}>
          <AppText variant="caption" tone="green">{w.category.toUpperCase()}{w.status !== 'open' ? `  ·  ${w.status === 'found' ? 'Found' : w.status === 'review' ? 'Waiting for safety check' : w.status}` : ''}</AppText>
          <AppText variant="heading">{w.title}</AppText>
        </View>
        <AppText variant="label" tone="green" style={styles.right}>{w.budget != null ? `up to\n${formatPrice(w.budget, w.currency)}` : 'Any price'}</AppText>
      </View>
      {w.details ? <AppText variant="bodySmall">{w.details}</AppText> : null}
      <AppText variant="caption" tone="secondary">{w.city}, {w.country} · {w.poster_name} · {agoLabel(w.created_at)}</AppText>
      {isOwner ? (
        <View style={styles.row}>
          {w.status === 'open' ? <Button title="✓ I found it" variant="outline" loading={busy} onPress={() => run('found')} /> : null}
          {w.status === 'found' ? <Button title="Still looking" variant="outline" loading={busy} onPress={() => run('reopen')} /> : null}
          <Button title="Delete" variant="ghost" onPress={() => Alert.alert('Delete this request?', '', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => run('delete') }])} />
        </View>
      ) : reply ? (
        <Button title="I have it — WhatsApp" variant="outline" icon={<Icon name="whatsapp" color={colors.text} size={18} strokeWidth={2} />} onPress={() => Linking.openURL(reply).catch(() => {})} />
      ) : (
        <Button title="Log in to reply" variant="outline" onPress={() => router.push('/sign-in')} />
      )}
      {!isOwner ? <ReportAndBlock wantedId={w.id} /> : null}
    </View>
  );
}

/** Wanted: what buyers are looking for (website: app/wanted). */
export default function WantedScreen() {
  const { name: country } = useCountry();
  const { user } = useAuth();
  const [mine, setMine] = useState(false);
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const q = useInfiniteQuery({
    queryKey: ['wanted', !!user, mine ? user?.id : '', city, category, mine ? '' : country ?? 'ALL'],
    queryFn: ({ pageParam }) => fetchWanted({ signedIn: !!user, mineUserId: mine ? user?.id : undefined, city: mine ? '' : city, category: mine ? '' : category, country: mine ? undefined : country ?? undefined, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (last, all) => (last.length === WANTED_PAGE ? all.length : undefined),
  });
  const posts = q.data?.pages.flat() ?? [];

  const header = (
    <View style={styles.head}>
      <AppText variant="bodySmall" tone="secondary">Can’t find something? Post it and let sellers come to you. Sellers: if you have it, message the buyer on WhatsApp.</AppText>
      <Button title="Post what you need" onPress={() => router.push(user ? '/wanted/new' : '/sign-in')} />
      {user ? <ChipRow options={[{ value: 'all', label: 'All requests' }, { value: 'mine', label: 'My requests' }]} value={mine ? 'mine' : 'all'} onChange={(v) => setMine(v === 'mine')} /> : null}
      {!mine ? (
        <>
          <SearchField placeholder="City or town" label="Filter by city or town" onSubmit={setCity} />
          <PickerField label="Category" value={category} options={CATEGORY_OPTIONS} onChange={setCategory} />
        </>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.page}>
      <ScreenHeader title="Wanted" />
      <FlatList
        data={posts}
        keyExtractor={(w) => w.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        renderItem={({ item }) => <Card w={item} userId={user?.id} onChanged={() => q.refetch()} />}
        onEndReachedThreshold={0.6}
        onEndReached={() => q.hasNextPage && !q.isFetchingNextPage && q.fetchNextPage()}
        refreshControl={<RefreshControl refreshing={q.isRefetching && !q.isFetchingNextPage} onRefresh={() => q.refetch()} tintColor={colors.green} colors={[colors.green]} />}
        ListEmptyComponent={q.isPending ? <Loading /> : q.isError ? <ErrorState message={(q.error as Error).message} onRetry={() => q.refetch()} /> :
          <Empty title={mine ? 'You haven’t posted any requests' : 'No requests here yet'} hint="Tell sellers what you need, and they’ll message you." />}
        ListFooterComponent={<AppText variant="caption" tone="secondary" style={styles.foot}>Requests close after 30 days. Never pay before you see the item.</AppText>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  list: { padding: space.lg, gap: space.md, paddingBottom: space.xxl },
  head: { gap: space.md },
  card: { gap: space.sm, padding: space.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  top: { flexDirection: 'row', gap: space.md },
  flex: { flex: 1, gap: 2 },
  right: { textAlign: 'right' },
  row: { flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' },
  foot: { marginTop: space.md },
});
