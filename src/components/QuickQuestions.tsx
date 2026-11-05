import React from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { AppText, Icon } from '@/components/ui';
import { whatsappLink } from '@/core/utils';
import { trackEvent } from '@/api/track';
import { BRAND } from '@/lib/site';
import { safetyGate } from '@/lib/safetyGate';
import { colors, radius, size, space } from '@/theme/tokens';

/** One-tap questions (website: components/QuickQuestions.tsx): each opens WhatsApp with the message already written. */
export function QuickQuestions({ shopId, adId, shopName, whatsapp, adTitle, hasPrice }: {
  shopId: string; adId: string; shopName: string; whatsapp: string | null; adTitle: string; hasPrice: boolean;
}) {
  const intro = `Hello ${shopName}, about "${adTitle}" on ${BRAND}:`;
  const questions = [
    { label: 'Is it still available?', text: `${intro} is it still available?` },
    hasPrice ? { label: 'What’s your last price?', text: `${intro} what is your last price?` } : { label: 'How much is it?', text: `${intro} how much is it?` },
    { label: 'Where can I see it?', text: `${intro} where and when can I come to see it?` },
    { label: 'Can you send more photos?', text: `${intro} can you send me more photos?` },
  ];
  const links = questions.map((q) => ({ ...q, href: whatsappLink(whatsapp, q.text) })).filter((q) => q.href);
  if (!links.length) return null;
  return (
    <View style={styles.wrap}>
      <AppText variant="caption" tone="secondary" style={styles.title}>ASK THE SELLER ON WHATSAPP</AppText>
      <View style={styles.chips}>
        {links.map((q) => (
          <Pressable key={q.label} accessibilityRole="button" accessibilityLabel={`Ask on WhatsApp: ${q.label}`} hitSlop={6}
            onPress={() => safetyGate(`ad:${adId}`, 'Continue to WhatsApp', () => { trackEvent(shopId, adId, 'whatsapp'); Linking.openURL(q.href!).catch(() => {}); })}
            style={({ pressed }) => [styles.chip, pressed && { backgroundColor: colors.greenTint }]}>
            <Icon name="whatsapp" color={colors.green} size={15} strokeWidth={2} />
            <AppText variant="label">{q.label}</AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  title: { letterSpacing: 0.5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: size.chip + 2, paddingHorizontal: space.md, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface },
});
