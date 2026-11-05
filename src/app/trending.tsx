import React, { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppText } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ChipRow } from '@/components/ChipRow';
import { ListingCard } from '@/components/ListingCard';
import { Photo } from '@/components/Photo';
import { Empty, ErrorState, Loading } from '@/components/States';
import { db } from '@/api/db';
import type { Listing } from '@/api/listings';
import { useBlocked } from '@/auth/mine';
import { getTrending, peopleLabel, TRENDING_DAYS } from '@/core/trending';
import { useCountry } from '@/lib/countryPref';
import { colors, radius, space } from '@/theme/tokens';

/** Trending (website: app/trending): top 10 items by people who viewed them, top 10 shops by people who contacted them. */
export default function TrendingScreen() {
  const { name: country } = useCountry();
  const { blocked } = useBlocked();
  const [tab, setTab] = useState<'items' | 'shops'>('items');
  const q = useQuery({ queryKey: ['trending'], queryFn: () => getTrending(db(), new Set(), 10) });
  // Country choice and blocked shops, as on the website.
  const inCountry = (c?: string | null) => !country || !c || c === country;
  const ads = (q.data?.ads ?? []).filter((x) => !blocked.has(x.ad.shop_id) && inCountry((x.ad as unknown as Listing).shops?.country));
  const shops = (q.data?.shops ?? []).filter((x) => !blocked.has(x.id) && inCountry((x as unknown as { country?: string }).country));

  const header = (
    <View style={styles.head}>
      <AppText variant="bodySmall" tone="secondary">What people on Amcolink looked at and contacted most in the last {TRENDING_DAYS} days. Every person counts once, so the ranking can’t be faked by tapping many times.</AppText>
      <ChipRow options={[{ value: 'items', label: 'Top items' }, { value: 'shops', label: 'Top shops' }]} value={tab} onChange={(v) => setTab(v as 'items' | 'shops')} />
    </View>
  );
  const refresh = <RefreshControl refreshing={q.isRefetching} onRefresh={() => q.refetch()} tintColor={colors.green} colors={[colors.green]} />;
  const empty = q.isPending ? <Loading /> : q.isError ? <ErrorState message={(q.error as Error).message} onRetry={() => q.refetch()} /> : <Empty title={`No trending ${tab} yet this week`} />;

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <ScreenHeader title="Top 10 this week" />
      {tab === 'items' ? (
        <FlatList
          key="items"
          data={ads}
          keyExtractor={(x) => x.ad.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          ListHeaderComponent={header}
          refreshControl={refresh}
          ListEmptyComponent={empty}
          renderItem={({ item, index }) => (
            <View style={styles.flex}>
              <ListingCard ad={item.ad as unknown as Listing} />
              <AppText variant="caption" tone="green" style={styles.rank}>#{index + 1} · {peopleLabel(item.people, 'viewed this week')}</AppText>
            </View>
          )}
        />
      ) : (
        <FlatList
          key="shops"
          data={shops}
          keyExtractor={(x) => x.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={header}
          refreshControl={refresh}
          ListEmptyComponent={empty}
          ListFooterComponent={shops.length ? <AppText variant="caption" tone="secondary">The number shows how many different people contacted the shop on WhatsApp or by phone this week.</AppText> : null}
          renderItem={({ item, index }) => (
            <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/shops/[slug]', params: { slug: item.slug } })} style={styles.shop}>
              <AppText variant="heading" tone="green" style={styles.num}>#{index + 1}</AppText>
              <Photo src={item.logo_url} thumb style={styles.logo} label={item.name} />
              <View style={styles.flex}>
                <AppText variant="label">{item.name}{item.is_verified ? '  ✓ Verified' : ''}</AppText>
                <AppText variant="caption" tone="secondary">{item.city}</AppText>
              </View>
              <AppText variant="label" tone="green">{item.people.toLocaleString()}</AppText>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  head: { gap: space.md, paddingBottom: space.md },
  list: { padding: space.lg, gap: space.sm + 2, paddingBottom: space.xxl },
  row: { gap: space.sm + 2 },
  flex: { flex: 1, gap: 2 },
  rank: { paddingHorizontal: 2 },
  shop: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  num: { width: 36, textAlign: 'center' },
  logo: { width: 48, height: 48, borderRadius: radius.md },
});
