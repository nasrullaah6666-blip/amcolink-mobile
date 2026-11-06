import React, { useEffect } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { useBarsScroll } from '@/lib/scrollBars';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppText, Icon } from '@/components/ui';
import { Photo } from '@/components/Photo';
import { Empty, ErrorState, Loading } from '@/components/States';
import { useAuth } from '@/auth/session';
import { deleteSavedSearch, fetchSavedItems, fetchSavedSearches, setSearchAlerts, type SavedItem, type SavedSearch } from '@/api/me';
import { categoryByName } from '@/core/categories';
import { parseSearch } from '@/core/search';
import { dealPercent } from '@/core/freshness';
import { formatPrice } from '@/core/utils';
import { markDropsSeen, usePriceDrops } from '@/lib/priceDrops';
import { colors, radius, space } from '@/theme/tokens';

/** Opens a saved search on the screen that shows it (website: rentalsUrl / searchUrl). */
function openSearch(x: SavedSearch) {
  const q = x.query ?? {};
  if (q.page === 'rentals') {
    // Property search opens with its filters (keys as saved by the website's and the app's Alert me).
    const keep = ['deal', 'area', 'type', 'period', 'furnished', 'beds', 'min', 'max', 'by'];
    router.push({ pathname: '/properties', params: Object.fromEntries(keep.filter((k) => q[k]).map((k) => [k, String(q[k])])) });
    return;
  }
  const s = parseSearch(q);
  const cat = categoryByName(s.category);
  // Filters go along so the search opens exactly as it was saved.
  const extra = Object.fromEntries(Object.entries({ city: s.city, min: s.min, max: s.max, condition: s.condition, verified: s.verified }).filter(([, v]) => v));
  if (cat) router.push({ pathname: '/category/[slug]', params: { slug: cat.slug, ...(s.sub ? { sub: s.sub } : {}), ...(s.q ? { q: s.q } : {}), ...extra } });
  else router.push({ pathname: '/search', params: { q: s.q, ...extra } });
}

function SavedSearches({ userId }: { userId: string }) {
  const q = useQuery({ queryKey: ['saved-searches', userId], queryFn: () => fetchSavedSearches(userId) });
  const items = q.data ?? [];
  const run = async (fn: () => Promise<void>) => { try { await fn(); } finally { q.refetch(); } };
  return (
    <View style={styles.searches}>
      <AppText variant="heading">Saved searches</AppText>
      {q.isPending ? <Loading /> : items.length === 0 ? (
        <AppText variant="bodySmall" tone="secondary">No saved searches yet. Search for something, then tap Save search.</AppText>
      ) : items.map((x) => (
        <View key={x.id} style={styles.searchRow}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Open saved search ${x.label}`} onPress={() => openSearch(x)} style={styles.flex}>
            <AppText variant="label" numberOfLines={2}>{x.label}</AppText>
            <AppText variant="caption" tone="secondary">{x.alerts_enabled === false ? 'Alerts off' : 'Alerts on'}</AppText>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={x.alerts_enabled === false ? `Turn on alerts for ${x.label}` : `Turn off alerts for ${x.label}`}
            onPress={() => run(() => setSearchAlerts(x.id, x.alerts_enabled === false))} style={styles.iconBtn}>
            <Icon name="bell" size={20} strokeWidth={2} color={x.alerts_enabled === false ? colors.borderStrong : colors.green} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={`Delete saved search ${x.label}`} onPress={() => run(() => deleteSavedSearch(x.id))} style={styles.iconBtn}>
            <AppText variant="label" tone="secondary">✕</AppText>
          </Pressable>
        </View>
      ))}
      {items.length ? <AppText variant="caption" tone="secondary">When a new listing matches a saved search, you get a notification. Tap the bell to turn alerts on or off.</AppText> : null}
      <AppText variant="heading" style={styles.second}>Favourite shops &amp; listings</AppText>
    </View>
  );
}

/** Saved searches, shops and listings (website: app/favorites). */
export default function SavedScreen() {
  const { ready, user } = useAuth();
  const q = useQuery({ queryKey: ['saved-items', user?.id], queryFn: () => fetchSavedItems(user!.id), enabled: !!user });
  const drops = usePriceDrops().data;
  const onScroll = useBarsScroll();
  useEffect(() => { if (drops?.latest) markDropsSeen(drops.latest); }, [drops?.latest]);

  const open = (f: SavedItem) =>
    f.shop ? router.push({ pathname: '/shops/[slug]', params: { slug: f.shop.slug } }) : router.push({ pathname: '/ads/[id]', params: { id: f.ad!.id } });

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <View style={styles.head}>
        <AppText variant="title" accessibilityRole="header">Saved</AppText>
        {user ? <AppText variant="bodySmall" tone="secondary">Shops and listings you have saved.</AppText> : null}
      </View>
      {!ready ? <Loading /> : !user ? (
        <View style={styles.pad}>
          <Empty title="Save what you like" hint="Sign in, then tap the heart on any listing or Follow on a shop." action={{ title: 'Sign in', onPress: () => router.push('/sign-in') }} />
        </View>
      ) : (
        <Animated.FlatList
          data={q.data ?? []}
          onScroll={onScroll}
          scrollEventThrottle={16}
          keyExtractor={(f) => f.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={<>
            {drops && drops.ids.size > 0 ? (
              <View style={styles.drops}><AppText variant="label">🔔 {drops.ids.size} saved {drops.ids.size === 1 ? 'item is' : 'items are'} cheaper now. Message the seller before someone else does!</AppText></View>
            ) : null}
            <SavedSearches userId={user.id} />
          </>}
          refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => q.refetch()} tintColor={colors.green} colors={[colors.green]} />}
          ListEmptyComponent={q.isPending ? <Loading /> : q.isError ? <ErrorState message={(q.error as Error).message} onRetry={() => q.refetch()} /> :
            <Empty title="Nothing saved yet" hint="Tap the heart on a listing to keep it here." />}
          renderItem={({ item: f }) => {
            const pct = f.ad ? dealPercent(f.ad) : null;
            return (
              <Pressable accessibilityRole="button" onPress={() => open(f)} style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.greenTint }]}>
                <Photo src={f.shop ? f.shop.logo_url : f.ad?.photo_urls?.[0]} thumb style={styles.thumb} label={f.shop ? f.shop.name : f.ad!.title} />
                <View style={styles.flex}>
                  <AppText variant="label" numberOfLines={2}>{f.shop ? f.shop.name : f.ad!.title}</AppText>
                  {f.shop ? <AppText variant="caption" tone="secondary">Shop · {f.shop.city}</AppText> : (
                    <AppText variant="bodySmall" tone="green">
                      {formatPrice(f.ad!.price, f.ad!.currency ?? "")}{pct ? `  ·  −${pct}%` : ''}
                    </AppText>
                  )}
                  {f.ad?.availability === 'sold' ? <AppText variant="caption" tone="secondary">Sold</AppText> : null}
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  drops: { padding: space.md, borderRadius: radius.md, backgroundColor: colors.greenTint, marginBottom: space.md },
  head: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.sm, gap: 2 },
  pad: { padding: space.lg },
  list: { padding: space.lg, gap: space.sm + 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  searches: { gap: space.sm, marginBottom: space.sm },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  second: { marginTop: space.md },
  thumb: { width: 56, height: 56, borderRadius: radius.md },
  flex: { flex: 1, gap: 2 },
});
