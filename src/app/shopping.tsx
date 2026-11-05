import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppText, Button, Icon, type IconName } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { MAIN_CATEGORIES } from '@/core/categories';
import { colors, radius, size, space } from '@/theme/tokens';

// Same icons as the Home tiles.
const ICONS: Record<string, IconName> = {
  phones: 'phone', electronics: 'tv', 'home-appliances': 'sofa', fashion: 'shirt', beauty: 'bottle', vehicles: 'car',
  'food-farming': 'leaf', 'building-tools': 'hammer', other: 'grid',
};

/** Shopping (website: /shopping): every shopping category as a tile, plus "Browse shops". */
export default function ShoppingScreen() {
  const cats = MAIN_CATEGORIES.filter((c) => c.name !== 'Services');
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.page}>
      <ScreenHeader title="Shopping" />
      <ScrollView contentContainerStyle={styles.body}>
        <AppText variant="bodySmall" tone="secondary">Pick a category to see what local sellers have.</AppText>
        <View style={styles.grid}>
          {cats.map((c) => (
            <Pressable key={c.slug} accessibilityRole="button" accessibilityLabel={c.label} style={styles.tile}
              onPress={() => router.push({ pathname: '/category/[slug]', params: { slug: c.slug } })}>
              <View style={styles.icon}><Icon name={ICONS[c.slug] ?? 'grid'} color={colors.green} /></View>
              <AppText variant="caption" style={styles.center} numberOfLines={2}>{c.short}</AppText>
            </Pressable>
          ))}
        </View>
        <Button title="Browse shops" variant="outline" icon={<Icon name="store" color={colors.green} size={18} strokeWidth={2} />} onPress={() => router.push('/profiles')} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  body: { padding: space.lg, gap: space.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: space.lg },
  tile: { width: '33.33%', alignItems: 'center', gap: 6, minHeight: size.touch },
  icon: { width: size.categoryTile, height: size.categoryTile, borderRadius: radius.tile, backgroundColor: colors.greenTint, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
});
