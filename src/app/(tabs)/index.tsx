import React, { useCallback, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import Animated, {
  interpolateColor, runOnJS, useAnimatedReaction, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue,
} from 'react-native-reanimated';
import { barsOnScroll } from '@/lib/scrollBars';
import { useInfiniteQuery } from '@tanstack/react-query';
import { AppText, Icon, type IconName } from '@/components/ui';
import { ListingCard } from '@/components/ListingCard';
import { RecentlyViewed } from '@/components/RecentlyViewed';
import { MenuButton } from '@/components/MenuDrawer';
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

/** The green band with the search box. It stays on top while the list scrolls (website: sticky search band). */
function SearchBand({ onSearch }: { onSearch: (q: string) => void }) {
  const [q, setQ] = useState('');
  return (
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
  );
}

function Header() {
  return (
    <View>
      <View style={styles.grid}>
        {TILES.map((t) => (
          <Pressable key={t.key} accessibilityRole="button" accessibilityLabel={t.label} onPress={t.go} style={styles.tile}>
            {/* All tiles look the same (owner, 5 Nov 2026: no solid green tiles; the website shows Property and Services in solid green). */}
            <View style={[styles.tileIcon, { backgroundColor: colors.greenTint }]}>
              <Icon name={t.icon} color={colors.green} />
            </View>
            <AppText variant="caption" style={styles.tileLabel} numberOfLines={2}>{t.label}</AppText>
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

  // Website on phones: the logo row slides away as you scroll, the green search band stays on top
  // (and the phone's status bar turns green behind it); the bottom bar hides while scrolling down.
  const insets = useSafeAreaInsets();
  const [brandH, setBrandH] = useState(52);
  const [topH, setTopH] = useState(52 + size.input + space.md + space.lg);
  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler<{ last?: number; travelled?: number }>({
    onScroll: (e, ctx) => { y.value = e.contentOffset.y; barsOnScroll(e.contentOffset.y, ctx); },
  });
  const slide = useAnimatedStyle(() => ({ transform: [{ translateY: -Math.min(Math.max(y.value, 0), brandH) }] }));
  const statusBg = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(y.value, [brandH - 12, brandH], [colors.background, colors.green]),
  }));
  // Light status-bar text on green, dark text on the light page.
  const [onGreen, setOnGreen] = useState(false);
  useAnimatedReaction(() => y.value > brandH - 6, (now, before) => { if (now !== before) runOnJS(setOnGreen)(now); }, [brandH]);
  useFocusEffect(useCallback(() => {
    setStatusBarStyle(onGreen ? 'light' : 'dark');
    return () => setStatusBarStyle('dark');
  }, [onGreen]));

  return (
    <View style={styles.page}>
      <Animated.FlatList
        data={items}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(a) => a.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + topH }]}
        renderItem={({ item }) => <ListingCard ad={item} />}
        ListHeaderComponent={<Header />}
        ListEmptyComponent={
          feed.isPending ? <Loading label="Loading the latest finds…" />
            : feed.isError ? <ErrorState message={(feed.error as Error).message} onRetry={() => feed.refetch()} />
            : <Empty title="No listings yet" hint="New listings from sellers will appear here." />
        }
        ListFooterComponent={feed.isFetchingNextPage ? <Loading label="Loading more…" /> : null}
        onEndReached={() => feed.hasNextPage && !feed.isFetchingNextPage && feed.fetchNextPage()}
        onEndReachedThreshold={0.6}
        refreshControl={<RefreshControl refreshing={feed.isRefetching && !feed.isFetchingNextPage} onRefresh={() => feed.refetch()} colors={[colors.green]} tintColor={colors.green} progressViewOffset={insets.top + topH} />}
        removeClippedSubviews
        initialNumToRender={6}
        windowSize={7}
      />
      <View style={styles.top} pointerEvents="box-none">
        <Animated.View style={[{ paddingTop: insets.top }, slide]} onLayout={(e) => setTopH(e.nativeEvent.layout.height - insets.top)}>
          <View style={styles.header} onLayout={(e) => setBrandH(e.nativeEvent.layout.height)}>
            <AppText variant="title" tone="green" style={styles.brand}>Amcolink</AppText>
            <PickerField label="Country" value={countryCode ?? 'ALL'} options={COUNTRY_OPTIONS} onChange={(v) => setCode(v === 'ALL' ? null : v)}
              trigger={(open, current) => (
                <Pressable accessibilityRole="button" accessibilityLabel={`Country: ${current}. Change`} onPress={open} style={styles.countryPill}>
                  <AppText variant="label" numberOfLines={1}>{current}</AppText>
                  <Icon name="chevronDown" size={16} strokeWidth={2} color={colors.textSecondary} />
                </Pressable>
              )} />
            <MenuButton />
          </View>
          <SearchBand onSearch={onSearch} />
        </Animated.View>
        <Animated.View style={[styles.statusCover, { height: insets.top }, statusBg]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  countryPill: { flexDirection: 'row', alignItems: 'center', gap: space.xs, height: size.chip, maxWidth: 180, paddingHorizontal: space.md, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface },
  header: { backgroundColor: colors.background, flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingLeft: space.lg, paddingRight: space.xs, paddingTop: space.sm, paddingBottom: space.sm },
  brand: { flex: 1 },
  band: { backgroundColor: colors.green, paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.lg },
  top: { position: 'absolute', top: 0, left: 0, right: 0 },
  statusCover: { position: 'absolute', top: 0, left: 0, right: 0 },
  search: { flexDirection: 'row', alignItems: 'center', gap: space.sm + 2, height: size.input, paddingHorizontal: space.md + 2, borderRadius: radius.md, backgroundColor: colors.surface },
  searchInput: { flex: 1, ...type.body, fontSize: 15, color: colors.text },
  content: { paddingHorizontal: space.lg, paddingBottom: space.xxl },
  row: { gap: space.sm + 2, marginBottom: space.sm + 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: space.sm + 2, marginTop: space.lg },
  tile: { width: '25%', alignItems: 'center', gap: 6, paddingHorizontal: 2, minHeight: size.touch },
  tileIcon: { width: size.categoryTile, height: size.categoryTile, borderRadius: radius.tile, alignItems: 'center', justifyContent: 'center' },
  tileLabel: { textAlign: 'center' },
  near: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: size.touch, paddingHorizontal: space.xs },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.xl, marginBottom: space.sm + 2 },
});
