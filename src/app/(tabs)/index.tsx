import React from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText, Button, Icon, type IconName } from '@/components/ui';
import { MAIN_CATEGORIES } from '@/core/categories';
import { colors, fonts, radius, size, space, type } from '@/theme/tokens';

const ICONS: Record<string, IconName> = {
  phones: 'phone', electronics: 'tv', 'home-appliances': 'sofa', fashion: 'shirt', beauty: 'bottle', vehicles: 'car',
  'food-farming': 'leaf', 'building-tools': 'hammer', services: 'tools', other: 'grid',
};

type Tile = { key: string; label: string; icon: IconName; strong?: boolean };

// Same order as the website's Home grid: Property and Services first, then the shopping categories, then Explore.
const TILES: Tile[] = [
  { key: 'property', label: 'Property', icon: 'house', strong: true },
  { key: 'services', label: 'Services', icon: 'tools', strong: true },
  ...MAIN_CATEGORIES.filter((c) => c.slug !== 'services').map((c) => ({ key: c.slug, label: c.label, icon: ICONS[c.slug] ?? 'grid' })),
  { key: 'explore', label: 'Explore', icon: 'compass' },
];

export default function HomeScreen() {
  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <View style={styles.header}>
        <AppText variant="title" tone="green">Amcolink</AppText>
        <Pressable accessibilityRole="button" accessibilityLabel="Notifications" style={styles.iconButton}>
          <Icon name="bell" />
        </Pressable>
      </View>

      <View style={styles.band}>
        <Pressable accessibilityRole="button" style={styles.countryPill}>
          <AppText variant="label" tone="onGreen">All countries</AppText>
          <Icon name="chevronDown" color={colors.onGreen} size={14} strokeWidth={2} />
        </Pressable>
        <View style={styles.search}>
          <Icon name="search" color={colors.textSecondary} size={20} strokeWidth={2} />
          <TextInput
            accessibilityLabel="Search"
            placeholder="I'm looking for…"
            placeholderTextColor={colors.textSecondary}
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {TILES.map((t) => (
            <Pressable key={t.key} accessibilityRole="button" style={styles.tile}>
              <View style={[styles.tileIcon, { backgroundColor: t.strong ? colors.green : colors.greenTint }]}>
                <Icon name={t.icon} color={t.strong ? colors.onGreen : colors.green} />
              </View>
              <AppText variant="caption" style={[styles.tileLabel, t.strong && { fontFamily: fonts.semibold }]} numberOfLines={2}>{t.label}</AppText>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionRow}>
          <AppText variant="heading">The latest finds</AppText>
          <Button title="Filters" variant="outline" icon={<Icon name="filters" color={colors.green} size={16} strokeWidth={2} />} />
        </View>
        <View style={styles.emptyBox}>
          <AppText variant="bodySmall" tone="secondary">Listings from staging appear here in the next step (browsing).</AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: space.sm },
  iconButton: { width: size.touch, height: size.touch, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  band: { backgroundColor: colors.green, paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.lg, gap: space.sm + 2 },
  countryPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, height: 32, paddingHorizontal: space.md, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.onGreenMuted },
  search: { flexDirection: 'row', alignItems: 'center', gap: space.sm + 2, height: size.input, paddingHorizontal: space.md + 2, borderRadius: radius.md, backgroundColor: colors.surface },
  searchInput: { flex: 1, ...type.body, fontSize: 16, color: colors.text },
  content: { padding: space.lg, paddingBottom: space.xxl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: space.sm + 2 },
  tile: { width: '25%', alignItems: 'center', gap: 6, paddingHorizontal: 2 },
  tileIcon: { width: size.categoryTile, height: size.categoryTile, borderRadius: radius.tile, alignItems: 'center', justifyContent: 'center' },
  tileLabel: { textAlign: 'center' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.xl, marginBottom: space.sm + 2 },
  emptyBox: { padding: space.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
});
