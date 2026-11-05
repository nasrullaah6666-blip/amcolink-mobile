import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui';
import type { Trust } from '@/core/trust';
import { colors, radius, space } from '@/theme/tokens';

/** Trust score card (website: components/TrustBadge.tsx TrustCard): score bar and what it is made of. Green only. */
export function TrustCard({ trust }: { trust?: Trust | null }) {
  if (!trust) return null;
  const facts = [
    trust.verified ? 'Verified by Amcolink' : 'Not verified yet',
    trust.reviews ? `${Number(trust.rating).toFixed(1)}★ from ${trust.reviews} ${trust.reviews === 1 ? 'review' : 'reviews'}` : 'No reviews yet',
    trust.months >= 1 ? `On Amcolink ${trust.months} ${trust.months === 1 ? 'month' : 'months'}` : 'New this month',
    trust.buyers ? `${trust.buyers} ${trust.buyers === 1 ? 'buyer' : 'buyers'} contacted them (90 days)` : null,
    `${trust.live_ads} ${trust.live_ads === 1 ? 'item' : 'items'} confirmed available`,
  ].filter(Boolean) as string[];
  return (
    <View style={styles.box} accessible accessibilityLabel={`Trust score ${trust.score} out of 100, ${trust.level}. ${facts.join('. ')}`}>
      <View style={styles.top}>
        <AppText variant="label" tone="green">🛡 Trust score</AppText>
        <AppText variant="label" tone="green">{trust.score}/100 · {trust.level}</AppText>
      </View>
      <View style={styles.track}><View style={[styles.bar, { width: `${Math.max(4, trust.score)}%` }]} /></View>
      {facts.map((f) => <AppText key={f} variant="caption">• {f}</AppText>)}
      <AppText variant="caption" tone="secondary">Based on verification, reviews, time on Amcolink, buyer contacts and reports. A high score lowers risk but is not a guarantee.</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: space.xs, padding: space.md, borderRadius: radius.lg, backgroundColor: colors.greenTint },
  top: { flexDirection: 'row', justifyContent: 'space-between', gap: space.md },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.surface, overflow: 'hidden', marginVertical: space.xs },
  bar: { height: 8, borderRadius: 4, backgroundColor: colors.green },
});
