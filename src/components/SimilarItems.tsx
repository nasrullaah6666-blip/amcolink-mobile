import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppText } from '@/components/ui';
import { ListingCard } from '@/components/ListingCard';
import { db } from '@/api/db';
import type { Listing } from '@/api/listings';
import { useBlocked } from '@/auth/mine';
import { categoryByName, RENTAL_CATEGORY } from '@/core/categories';
import { getSimilarAds } from '@/core/similar';
import { space } from '@/theme/tokens';

/** Listing page: "Similar items (in <town>)" — same category, same town first, closest price (website: SimilarItems). */
export function SimilarItems({ ad, city }: { ad: Listing; city: string }) {
  const { blocked } = useBlocked();
  const q = useQuery({
    queryKey: ['similar', ad.id, [...blocked].sort().join(',')],
    queryFn: () => getSimilarAds(db(), ad, city, blocked),
  });
  const found = q.data;
  if (!found?.ads.length) return null;
  const cat = categoryByName(ad.category);
  const more = () => {
    if (ad.category === RENTAL_CATEGORY) router.push('/properties');
    else if (cat) router.push({ pathname: '/category/[slug]', params: { slug: cat.slug } });
  };
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <AppText variant="heading" accessibilityRole="header" style={styles.flex}>{found.local ? `Similar items in ${city}` : 'Similar items'}</AppText>
        {cat || ad.category === RENTAL_CATEGORY ? (
          <Pressable accessibilityRole="link" onPress={more} hitSlop={8}><AppText variant="label" tone="green">See more →</AppText></Pressable>
        ) : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {(found.ads as Listing[]).map((x) => <View key={x.id} style={styles.card}><ListingCard ad={x} /></View>)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md, marginHorizontal: -space.lg },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg },
  flex: { flex: 1 },
  row: { paddingHorizontal: space.lg, gap: space.sm + 2 },
  // Row so ListingCard's flex fills the width (not the height) inside the sideways list.
  card: { width: 168, flexDirection: 'row' },
});
