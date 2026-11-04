import React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ListingCard } from '@/components/ListingCard';
import { Empty, ErrorState, Loading } from '@/components/States';
import { PAGE_SIZE, type Listing } from '@/api/listings';
import { colors, space } from '@/theme/tokens';

/**
 * Two-column grid of listings with infinite scroll and pull to refresh.
 * Every list screen (category, search, property, Explore collections) uses this, so they look and behave the same.
 */
export function ListingGrid({ queryKey, load, header, emptyTitle, emptyHint }: {
  queryKey: readonly unknown[];
  load: (page: number) => Promise<Listing[]>;
  header?: React.ReactElement | null;
  emptyTitle: string;
  emptyHint?: string;
}) {
  const q = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => load(pageParam),
    initialPageParam: 0,
    getNextPageParam: (last, all) => (last.length === PAGE_SIZE ? all.length : undefined),
  });
  const ads = q.data?.pages.flat() ?? [];
  const seen = new Set<string>();
  const unique = ads.filter((a) => (seen.has(a.id) ? false : (seen.add(a.id), true)));

  return (
    <FlatList
      data={unique}
      keyExtractor={(a) => a.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
      ListHeaderComponent={header}
      renderItem={({ item }) => <ListingCard ad={item} />}
      onEndReachedThreshold={0.6}
      onEndReached={() => q.hasNextPage && !q.isFetchingNextPage && q.fetchNextPage()}
      refreshControl={<RefreshControl refreshing={q.isRefetching && !q.isFetchingNextPage} onRefresh={() => q.refetch()} tintColor={colors.green} colors={[colors.green]} />}
      ListEmptyComponent={
        q.isPending ? <Loading /> :
        q.isError ? <ErrorState message={(q.error as Error).message} onRetry={() => q.refetch()} /> :
        <Empty title={emptyTitle} hint={emptyHint} />
      }
      ListFooterComponent={q.isFetchingNextPage ? <View style={styles.footer}><Loading label="Loading more…" /></View> : null}
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.sm + 2 },
  row: { gap: space.sm + 2 },
  footer: { paddingVertical: space.md },
});
