import React from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppText, Button } from '@/components/ui';
import { Photo } from '@/components/Photo';
import { Empty, ErrorState, Loading } from '@/components/States';
import { useAuth } from '@/auth/session';
import { fetchSavedItems, type SavedItem } from '@/api/me';
import { dealPercent } from '@/core/freshness';
import { formatPrice } from '@/core/utils';
import { colors, radius, space } from '@/theme/tokens';

/** Saved shops and listings (website: app/favorites). Saved searches come with the search-alerts task. */
export default function SavedScreen() {
  const { ready, user } = useAuth();
  const q = useQuery({ queryKey: ['saved-items', user?.id], queryFn: () => fetchSavedItems(user!.id), enabled: !!user });

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
        <FlatList
          data={q.data ?? []}
          keyExtractor={(f) => f.id}
          contentContainerStyle={styles.list}
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
  head: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.sm, gap: 2 },
  pad: { padding: space.lg },
  list: { padding: space.lg, gap: space.sm + 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  thumb: { width: 56, height: 56, borderRadius: radius.md },
  flex: { flex: 1, gap: 2 },
});
