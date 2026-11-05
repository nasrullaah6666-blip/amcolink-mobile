import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppText, Icon, type IconName } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors, radius, space } from '@/theme/tokens';

// Website /explore, same tiles and order: Deals, Trending, Gifts, Free stuff, Brand new, Used, Wanted, Post a need.
// Icons follow the website (giving hand, bag, megaphone, plus in a circle). The one-line help is app-only (owner chose layout A).
const ROWS: { kind: string; label: string; hint: string; icon: IconName; route?: '/wanted' | '/wanted/new' | '/trending' | '/gifts' }[] = [
  { kind: 'deals', label: 'Deals', hint: 'Price drops of 30% or more this week', icon: 'tag' },
  { kind: 'trending', label: 'Trending', hint: 'Most viewed items and shops this week', icon: 'trend', route: '/trending' },
  { kind: 'gifts', label: 'Gifts', hint: 'Ideas by occasion and who it’s for', icon: 'gift', route: '/gifts' },
  { kind: 'free', label: 'Free stuff', hint: 'Things people are giving away', icon: 'handHeart' },
  { kind: 'new', label: 'Brand new', hint: 'Only new items', icon: 'bag' },
  { kind: 'used', label: 'Used', hint: 'Second-hand items at lower prices', icon: 'recycle' },
  { kind: 'wanted', label: 'Wanted', hint: 'What buyers are looking for', icon: 'megaphone', route: '/wanted' },
  { kind: 'post-need', label: 'Post a need', hint: 'Tell sellers what you want', icon: 'plusCircle', route: '/wanted/new' },
];

export default function ExploreScreen() {
  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <ScreenHeader title="Explore" />
      <ScrollView contentContainerStyle={styles.body}>
        <AppText variant="bodySmall" tone="secondary">Other ways to find something.</AppText>
        <View style={styles.list}>
          {ROWS.map((r, i) => (
            <Pressable key={r.kind} accessibilityRole="button" accessibilityLabel={`${r.label}. ${r.hint}`}
              onPress={() => (r.route ? router.push(r.route) : router.push({ pathname: '/collection/[kind]', params: { kind: r.kind } }))}
              style={({ pressed }) => [styles.row, i > 0 && styles.line, pressed && { backgroundColor: colors.greenTint }]}>
              <View style={styles.icon}><Icon name={r.icon} color={colors.green} strokeWidth={2} /></View>
              <View style={styles.text}>
                <AppText variant="label" style={styles.title}>{r.label}</AppText>
                <AppText variant="bodySmall" tone="secondary" numberOfLines={1}>{r.hint}</AppText>
              </View>
              <Icon name="chevronRight" color={colors.borderStrong} size={18} strokeWidth={2} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  body: { paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.md },
  list: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  row: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.md + 2 },
  line: { borderTopWidth: 1, borderTopColor: colors.border },
  icon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.greenTint, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
  title: { fontSize: 16 },
});
