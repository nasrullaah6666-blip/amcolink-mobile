import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { AppText, Button } from '@/components/ui';
import { ChipRow } from '@/components/ChipRow';
import { DEFAULT_RADIUS, formatKm, RADII } from '@/core/distance';
import { useNearPoint } from '@/lib/useNearPoint';
import { PickerField } from '@/components/PickerField';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchField } from '@/components/SearchField';
import { Photo } from '@/components/Photo';
import { Empty, ErrorState, Loading } from '@/components/States';
import { fetchProfilePlaces, fetchProfiles, fetchProfilesNear, PROFILES_PAGE } from '@/api/profiles';
import { useBlocked } from '@/auth/mine';
import { useCountry } from '@/lib/countryPref';
import { colors, radius, space } from '@/theme/tokens';

/** Browse profiles: shops or service providers (website: /shops and /services). */
export default function ProfilesScreen() {
  const { kind: k } = useLocalSearchParams<{ kind?: string }>();
  const kind = k === 'service' ? 'service' : 'shop';
  const { name: country } = useCountry();
  const { blocked } = useBlocked();
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const { where, locate, clear } = useNearPoint();
  const [radius, setRadius] = useState<number>(DEFAULT_RADIUS);
  const point = where.state === 'ok' ? where.point : null;
  const nearQ = useQuery({ queryKey: ['profiles-near', kind, point, radius], queryFn: () => fetchProfilesNear(kind, point!, radius), enabled: !!point });
  const places = useQuery({ queryKey: ['profile-places', kind, country ?? 'ALL'], queryFn: () => fetchProfilePlaces(kind, country ?? undefined) });
  const townOptions = [{ value: '', label: 'All towns' }, ...(places.data ?? []).map((p) => ({ value: p.name, label: `${p.name} (${p.count})`, hint: p.hint || undefined }))];
  const list = useInfiniteQuery({
    queryKey: ['profiles', kind, q, city, country ?? 'ALL'],
    queryFn: ({ pageParam }) => fetchProfiles(kind, { q, city, exactCity: true, country: country ?? undefined, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (last, all) => (last.length === PROFILES_PAGE ? all.length : undefined),
  });
  type Row = NonNullable<typeof list.data>['pages'][number][number] & { km?: number | null };
  const rows: Row[] = ((point ? nearQ.data?.rows : list.data?.pages.flat()) ?? []).filter((r) => !blocked.has(r.id));
  const busy = point ? nearQ.isPending : list.isPending;
  const failed = point ? nearQ.isError : list.isError;
  const title = kind === 'service' ? 'Find a service' : 'Explore shops';

  const header = (
    <View style={styles.head}>
      <SearchField placeholder={kind === 'service' ? 'Provider name' : 'Shop name'} onSubmit={setQ} label="Search by name" />
      <PickerField label="Town" value={city} options={townOptions} onChange={setCity} placeholder="All towns" />
      {point ? (
        <>
          <ChipRow options={RADII.map((r) => ({ value: String(r), label: `${r} km` }))} value={String(radius)} onChange={(v) => setRadius(Number(v))} />
          <Button title="Show all, not by distance" variant="ghost" onPress={clear} />
          {nearQ.data?.city ? <AppText variant="caption" tone="secondary">Closest first, plus profiles in {nearQ.data.city} without a map pin.</AppText> : null}
        </>
      ) : (
        <Button title={where.state === 'asking' ? 'Finding where you are…' : '📍 Near me'} variant="outline" loading={where.state === 'asking'} onPress={locate} />
      )}
      {where.state === 'denied' || where.state === 'failed' ? <AppText variant="caption" tone="error">{where.message}</AppText> : null}
      {city && !point ? <AppText variant="caption" tone="secondary">{kind === 'service' ? 'Providers' : 'Shops'} in {city}, A–Z</AppText> : null}
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <ScreenHeader title={title} />
      <FlatList
        data={rows}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={header}
        renderItem={({ item: r }) => (
          <Pressable accessibilityRole="button" accessibilityLabel={`${r.name}${r.is_verified ? ', verified' : ''}${r.city ? `, ${r.city}` : ''}`}
            onPress={() => router.push({ pathname: '/shops/[slug]', params: { slug: r.slug } })}
            style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.greenTint }]}>
            <Photo src={r.logo_url ?? r.cover_url} thumb style={styles.logo} label={`${r.name} logo`} />
            <View style={styles.flex}>
              <AppText variant="label" numberOfLines={1}>{r.name}{r.is_verified ? '  ✓ Verified' : ''}</AppText>
              <AppText variant="caption" tone="secondary" numberOfLines={1}>{r.km != null && Number.isFinite(r.km) ? formatKm(r.km) : [r.city, r.country].filter(Boolean).join(', ')}</AppText>
              {r.trust ? <AppText variant="caption" tone="green">🛡 {r.trust.score} · {r.trust.level}</AppText> : null}
              {r.description ? <AppText variant="caption" tone="secondary" numberOfLines={1}>{r.description}</AppText> : null}
            </View>
          </Pressable>
        )}
        ListEmptyComponent={busy ? <Loading /> : failed ? <ErrorState message={((point ? nearQ.error : list.error) as Error)?.message ?? 'Could not load.'} onRetry={() => (point ? nearQ.refetch() : list.refetch())} /> :
          <Empty title={point ? `Nothing within ${radius} km yet` : q || city ? 'Nothing matches' : 'No profiles yet'} hint={q || city ? 'Try another name or town.' : undefined} />}
        ListFooterComponent={list.isFetchingNextPage ? <Loading /> : null}
        onEndReached={() => !point && list.hasNextPage && !list.isFetchingNextPage && list.fetchNextPage()}
        onEndReachedThreshold={0.6}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.sm },
  head: { gap: space.md, paddingBottom: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  logo: { width: 56, height: 56, borderRadius: 28 },
  flex: { flex: 1, gap: 2 },
});
