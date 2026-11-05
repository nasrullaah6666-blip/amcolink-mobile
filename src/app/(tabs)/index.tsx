import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { AppText, Icon, type IconName } from '@/components/ui';
import { ListingCard } from '@/components/ListingCard';
import { RecentlyViewed } from '@/components/RecentlyViewed';
import { Empty, ErrorState, Loading } from '@/components/States';
import { fetchLatest, PAGE_SIZE, type Listing } from '@/api/listings';
import { MAIN_CATEGORIES } from '@/core/categories';
import { FEATURED_COUNTRIES, OTHER_COUNTRIES } from '@/core/geo';
import { PickerField } from '@/components/PickerField';
import { useBlocked } from '@/auth/mine';
import { useCountry } from '@/lib/countryPref';
import { colors, fonts, radius, size, space, type } from '@/theme/tokens';

const ICONS: Record<string, IconName> = {
  phones: 'phone', electronics: 'tv', 'home-appliances': 'sofa', fashion: 'shirt', beauty: 'bottle', vehicles: 'car',
  'food-farming': 'leaf', 'building-tools': 'hammer', services: 'tools', other: 'grid',
};

type Tile = { key: string; label: string; icon: IconName; strong?: boolean; go: () => void };

// Same list as the website's country sheet: All countries, then East Africa, then the rest.
const COUNTRY_OPTIONS = [{ value: 'ALL', label: 'All countries' }, ...[...FEATURED_COUNTRIES, ...OTHER_COUNTRIES].map((c) => ({ value: c.code, label: c.name }))];

const openCategory = (slug: string) => router.push({ pathname: '/category/[slug]', params: { slug } });

// Same order as the website's Home grid: Property and Services first, then the shopping categories, then Explore.
const TILES: Tile[] = [
  { key: 'property', label: 'Property', icon: 'house', strong: true, go: () => router.push('/properties') },
  { key: 'services', label: 'Services', icon: 'tools', strong: true, go: () => openCategory('services') },
  ...MAIN_CATEGORIES.filter((c) => c.slug !== 'services').map((c) => ({
    key: c.slug, label: c.label, icon: ICONS[c.slug] ?? 'grid', go: () => openCategory(c.slug),
  })),
  { key: 'explore', label: 'Explore', icon: 'compass', go: () => router.push('/explore') },
];

function Header({ onSearch }: { onSearch: (q: string) => void }) {
  const [q, setQ] = useState('');
  return (
    <View>
      <View style={styles.band}>
        <View style={styles.search}>
          <Icon name="search" color={colors.textSecondary} size={20} strokeWidth={2} />
          <TextInput
            accessibilityLabel="Search"
            placeholder="I'm looking for…"
            placeholderTextColor={colors.textSecondary}
            style={styles.searchInput}
            value={q}
            onChangeText={setQ}
            returnKeyType="search"
            onSubmitEditing={() => q.trim() && onSearch(q.trim())}
          />
        </View>
      </View>
      <View style={styles.grid}>
        {TILES.map((t) => (
          <Pressable key={t.key} accessibilityRole="button" accessibilityLabel={t.label} onPress={t.go} style={styles.tile}>
            <View style={[styles.tileIcon, { backgroundColor: t.strong ? colors.green : colors.greenTint }]}>
              <Icon name={t.icon} color={t.strong ? colors.onGreen : colors.green} />
            </View>
            <AppText variant="caption" style={[styles.tileLabel, t.strong && { fontFamily: fonts.semibold }]} numberOfLines={2}>{t.label}</AppText>
          </Pressable>
        ))}
      </View>
      <RecentlyViewed />
      <View style={styles.sectionRow}>
        <AppText variant="heading" accessibilityRole="header">The latest finds</AppText>
        <Pressable accessibilityRole="button" accessibilityLabel="Near me: closest listings first" hitSlop={8} onPress={() => router.push('/near')} style={styles.near}>
          <Icon name="map" color={colors.green} size={16} strokeWidth={2} />
          <AppText variant="label" tone="green">Near me</AppText>
        </Pressable>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { name: country, code: countryCode, setCode } = useCountry();
  const feed = useInfiniteQuery({
    queryKey: ['latest', country ?? 'ALL'],
    queryFn: ({ pageParam }) => fetchLatest({ page: pageParam, country: country ?? undefined }),
    initialPageParam: 0,
    getNextPageParam: (last, all) => (last.length === PAGE_SIZE ? all.length : undefined),
  });
  const { blocked } = useBlocked();
  // Shops the person blocked are hidden (website does the same).
  const items: Listing[] = (feed.data?.pages.flat() ?? []).filter((a) => !blocked.has(a.shop_id));
  const onSearch = useCallback((q: string) => router.push({ pathname: '/search', params: { q } }), []);

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <View style={styles.header}>
        <AppText variant="title" tone="green">Amcolink</AppText>
        <PickerField label="Country" value={countryCode ?? 'ALL'} options={COUNTRY_OPTIONS} onChange={(v) => setCode(v === 'ALL' ? null : v)}
          trigger={(open, current) => (
            <Pressable accessibilityRole="button" accessibilityLabel={`Country: ${current}. Change`} onPress={open} style={styles.countryPill}>
              <AppText variant="label" numberOfLines={1}>{current}</AppText>
              <Icon name="chevronDown" size={16} strokeWidth={2} color={colors.textSecondary} />
            </Pressable>
          )} />
      </View>
      <FlatList
        data={items}
        keyExtractor={(a) => a.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => <ListingCard ad={item} />}
        ListHeaderComponent={<Header onSearch={onSearch} />}
        ListEmptyComponent={
          feed.isPending ? <Loading label="Loading the latest finds…" />
            : feed.isError ? <ErrorState message={(feed.error as Error).message} onRetry={() => feed.refetch()} />
            : <Empty title="No listings yet" hint="New listings from sellers will appear here." />
        }
        ListFooterComponent={feed.isFetchingNextPage ? <Loading label="Loading more…" /> : null}
        onEndReached={() => feed.hasNextPage && !feed.isFetchingNextPage && feed.fetchNextPage()}
        onEndReachedThreshold={0.6}
        refreshControl={<RefreshControl refreshing={feed.isRefetching && !feed.isFetchingNextPage} onRefresh={() => feed.refetch()} colors={[colors.green]} tintColor={colors.green} />}
        removeClippedSubviews
        initialNumToRender={6}
        windowSize={7}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  countryPill: { flexDirection: 'row', alignItems: 'center', gap: space.xs, height: size.chip, maxWidth: 180, paddingHorizontal: space.md, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md, paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: space.sm },
  band: { backgroundColor: colors.green, marginHorizontal: -space.lg, paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.lg },
  search: { flexDirection: 'row', alignItems: 'center', gap: space.sm + 2, height: size.input, paddingHorizontal: space.md + 2, borderRadius: radius.md, backgroundColor: colors.surface },
  searchInput: { flex: 1, ...type.body, fontSize: 16, color: colors.text },
  content: { paddingHorizontal: space.lg, paddingBottom: space.xxl },
  row: { gap: space.sm + 2, marginBottom: space.sm + 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: space.sm + 2, marginTop: space.lg },
  tile: { width: '25%', alignItems: 'center', gap: 6, paddingHorizontal: 2, minHeight: size.touch },
  tileIcon: { width: size.categoryTile, height: size.categoryTile, borderRadius: radius.tile, alignItems: 'center', justifyContent: 'center' },
  tileLabel: { textAlign: 'center' },
  near: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: size.touch, paddingHorizontal: space.xs },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.xl, marginBottom: space.sm + 2 },
});
