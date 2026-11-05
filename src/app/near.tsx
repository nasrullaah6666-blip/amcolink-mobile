import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { AppText, Button } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ChipRow } from '@/components/ChipRow';
import { ListingCard } from '@/components/ListingCard';
import { Empty, ErrorState, Loading } from '@/components/States';
import { fetchNear } from '@/api/nearby';
import { useBlocked } from '@/auth/mine';
import { DEFAULT_RADIUS, formatKm, RADII } from '@/core/distance';
import { useNearPoint } from '@/lib/useNearPoint';
import { colors, space } from '@/theme/tokens';

/**
 * Near me (website: NearMeButton + Home ?near=&r=): asks the phone for its location once, rounds it to ~0.5 km
 * (the exact spot is never sent or saved), and shows the closest listings first. Radius 2–50 km.
 */
export default function NearScreen() {
  const { where, locate } = useNearPoint();
  const [radius, setRadius] = useState<number>(DEFAULT_RADIUS);
  const { blocked } = useBlocked();

  useEffect(() => { locate(); }, [locate]);

  const point = where.state === 'ok' ? where.point : null;
  const q = useQuery({ queryKey: ['near', point, radius], queryFn: () => fetchNear(point!, radius), enabled: !!point });
  const rows = (q.data?.rows ?? []).filter((a) => !blocked.has(a.shop_id));

  const header = (
    <View style={styles.head}>
      <AppText variant="bodySmall" tone="secondary">Closest first. Your exact location is never saved or shared.</AppText>
      <ChipRow options={RADII.map((r) => ({ value: String(r), label: `${r} km` }))} value={String(radius)} onChange={(v) => setRadius(Number(v))} />
      {q.data?.city ? <AppText variant="caption" tone="secondary">Also showing sellers in {q.data.city} without a map pin.</AppText> : null}
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <ScreenHeader title="Near me" />
      {where.state === 'asking' || where.state === 'idle' ? <Loading label="Finding where you are…" /> : where.state !== 'ok' ? (
        <View style={styles.pad}><Empty title="Location needed" hint={'message' in where ? where.message : undefined} action={{ title: 'Try again', onPress: locate }} /></View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(a) => a.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.content}
          ListHeaderComponent={header}
          renderItem={({ item }) => <ListingCard ad={item} place={item.km != null && Number.isFinite(item.km) ? formatKm(item.km) : undefined} />}
          ListEmptyComponent={q.isPending ? <Loading /> : q.isError ? <ErrorState message={(q.error as Error).message} onRetry={() => q.refetch()} /> : (
            <View style={styles.gap}>
              <Empty title={`Nothing within ${radius} km yet`} hint="Try a bigger distance." />
              {radius < 50 ? <Button title="Show up to 50 km" variant="outline" onPress={() => setRadius(50)} /> : null}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  pad: { padding: space.lg },
  head: { gap: space.md, paddingBottom: space.md },
  content: { paddingHorizontal: space.lg, paddingBottom: space.xxl },
  row: { gap: space.sm + 2, marginBottom: space.sm + 2 },
  gap: { gap: space.md },
});
