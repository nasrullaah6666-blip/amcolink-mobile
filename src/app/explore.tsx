import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppText, Icon, type IconName } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors, radius, size, space } from '@/theme/tokens';

// Website /explore tiles, same order: Deals, Trending, Gifts, Free stuff, Brand new, Used, Wanted, Post a need.
const TILES: { kind: string; label: string; icon: IconName; route?: '/wanted' | '/wanted/new' | '/trending' | '/gifts' }[] = [
  { kind: 'deals', label: 'Deals', icon: 'tag' },
  { kind: 'trending', label: 'Trending', icon: 'trend', route: '/trending' },
  { kind: 'gifts', label: 'Gifts', icon: 'gift', route: '/gifts' },
  { kind: 'free', label: 'Free stuff', icon: 'heart' },
  { kind: 'new', label: 'Brand new', icon: 'sparkle' },
  { kind: 'used', label: 'Used', icon: 'recycle' },
  { kind: 'wanted', label: 'Wanted', icon: 'bell', route: '/wanted' },
  { kind: 'post-need', label: 'Post a need', icon: 'plus', route: '/wanted/new' },
];

export default function ExploreScreen() {
  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <ScreenHeader title="Explore" />
      <View style={styles.body}>
        <AppText variant="bodySmall" tone="secondary">Other ways to find something.</AppText>
        <View style={styles.grid}>
          {TILES.map((t) => (
            <Pressable key={t.kind} accessibilityRole="button" accessibilityLabel={t.label}
              onPress={() => (t.route ? router.push(t.route) : router.push({ pathname: '/collection/[kind]', params: { kind: t.kind } }))} style={styles.tile}>
              <View style={styles.icon}><Icon name={t.icon} color={colors.green} /></View>
              <AppText variant="caption" style={styles.center}>{t.label}</AppText>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  body: { paddingHorizontal: space.lg, gap: space.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: space.lg },
  tile: { width: '25%', alignItems: 'center', gap: 6, minHeight: size.touch },
  icon: { width: size.categoryTile, height: size.categoryTile, borderRadius: radius.tile, backgroundColor: colors.greenTint, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
});
