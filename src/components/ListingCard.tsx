import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { AppText } from '@/components/ui';
import { Photo } from '@/components/Photo';
import { SaveButton } from '@/components/SaveButton';
import type { Listing } from '@/api/listings';
import { formatPrice } from '@/core/utils';
import { conditionLabel } from '@/core/conditions';
import { bedsLabel, isRental } from '@/core/rentals';
import { colors, radius, space } from '@/theme/tokens';

/** The listing card used in every list (Home, categories, search, properties, shop pages). */
export const ListingCard = memo(function ListingCard({ ad }: { ad: Listing }) {
  const town = ad.shops?.city ?? '';
  const extra = isRental(ad.category)
    ? [bedsLabel(ad.rental?.bedrooms), ad.rental?.area].filter(Boolean).join(' · ')
    : [town, ad.condition ? conditionLabel(ad.condition) : ''].filter(Boolean).join(' · ');
  const reserved = ad.availability === 'reserved';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${ad.title}, ${formatPrice(ad.price, ad.currency, ad.price_from)}`}
      onPress={() => router.push({ pathname: '/ads/[id]', params: { id: ad.id } })}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View>
        <Photo src={ad.photo_urls?.[0]} thumb style={styles.photo} label={ad.title} />
        <SaveButton adId={ad.id} overlay />
      </View>
      <View style={styles.body}>
        <AppText variant="price" tone="green" numberOfLines={1}>{formatPrice(ad.price, ad.currency, ad.price_from)}</AppText>
        <AppText variant="bodySmall" numberOfLines={2}>{ad.title}</AppText>
        {extra ? <AppText variant="caption" tone="secondary" numberOfLines={1}>{extra}</AppText> : null}
        {reserved ? <AppText variant="caption" tone="green">Reserved</AppText> : null}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  photo: { width: '100%', aspectRatio: 4 / 3 },
  body: { paddingHorizontal: space.sm + 2, paddingTop: space.sm, paddingBottom: space.sm + 2, gap: 2 },
});
