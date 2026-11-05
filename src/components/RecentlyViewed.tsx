import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { AppText } from '@/components/ui';
import { Photo } from '@/components/Photo';
import { clearRecent, loadRecent, type RecentItem } from '@/lib/recent';
import { colors, radius, space } from '@/theme/tokens';

/** Home: "Continue where you left off" — a row of the last listings opened on this phone (website: RecentlyViewed). */
export function RecentlyViewed() {
  const [items, setItems] = useState<RecentItem[]>([]);
  useFocusEffect(useCallback(() => { loadRecent().then(setItems); }, []));
  if (!items.length) return null;
  return (
    <View style={styles.wrap} accessibilityLabel="Recently viewed">
      <View style={styles.head}>
        <AppText variant="heading" accessibilityRole="header">Continue where you left off</AppText>
        <Pressable accessibilityRole="button" accessibilityLabel="Clear recently viewed" hitSlop={10}
          onPress={() => { clearRecent(); setItems([]); }}>
          <AppText variant="label" tone="secondary">Clear</AppText>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.map((it) => (
          <Pressable key={it.id} accessibilityRole="button" accessibilityLabel={`${it.title}, ${it.price}`}
            onPress={() => router.push({ pathname: '/ads/[id]', params: { id: it.id } })} style={styles.card}>
            <Photo src={it.photo} thumb style={styles.photo} label={it.title} />
            <View style={styles.text}>
              <AppText variant="label" numberOfLines={1}>{it.title}</AppText>
              <AppText variant="price" tone="green" numberOfLines={1}>{it.price}</AppText>
              {it.city ? <AppText variant="caption" tone="secondary" numberOfLines={1}>{it.city}</AppText> : null}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Home's list already has side padding; the photo row runs edge to edge so it can scroll sideways.
  wrap: { marginHorizontal: -space.lg, paddingTop: space.xl, gap: space.md },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg },
  row: { paddingHorizontal: space.lg, gap: space.md },
  card: { width: 144, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' },
  photo: { width: 144, height: 144 },
  text: { padding: space.sm + 2, gap: 2 },
});
