import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Icon, AppText } from '@/components/ui';
import { telLink, whatsappLink } from '@/core/utils';
import { trackEvent } from '@/api/track';
import { BRAND } from '@/lib/site';
import { safetyGate } from '@/lib/safetyGate';
import { colors, space } from '@/theme/tokens';

type Seller = { id: string; name: string; phone: string | null; whatsapp: string | null };

/** Fixed Call / WhatsApp bar (website: MobileContactBar + ContactButtons, same message text). */
export function ContactBar({ shop, adId, adTitle }: { shop: Seller; adId?: string; adTitle?: string }) {
  const insets = useSafeAreaInsets();
  const tel = telLink(shop.phone);
  const wa = whatsappLink(
    shop.whatsapp,
    adTitle ? `Hello ${shop.name}, I saw "${adTitle}" on ${BRAND}. Is it still available?` : `Hello ${shop.name}, I found your shop on ${BRAND}.`,
  );
  if (!tel && !wa) {
    return (
      <View style={[styles.bar, { paddingBottom: space.md + insets.bottom }]}>
        <AppText variant="bodySmall" tone="secondary">This seller has not added contact details yet.</AppText>
      </View>
    );
  }
  // Same as the website: the "Never pay in advance" reminder first, once per listing (or per profile).
  const open = (url: string, kind: 'call' | 'whatsapp') => {
    safetyGate(adId ? `ad:${adId}` : `shop:${shop.id}`, kind === 'call' ? 'Call seller' : 'Continue to WhatsApp', () => {
      trackEvent(shop.id, adId ?? null, kind);
      Linking.openURL(url).catch(() => {});
    });
  };
  return (
    <View style={[styles.bar, styles.row, { paddingBottom: space.md + insets.bottom }]}>
      {tel ? (
        <Button style={styles.flex} size="lg" variant="outline" title="Call" icon={<Icon name="call" color={colors.text} size={20} strokeWidth={2} />} onPress={() => open(tel, 'call')} accessibilityLabel={`Call ${shop.name}`} />
      ) : null}
      {wa ? (
        <Button style={styles.flex} size="lg" title="WhatsApp" icon={<Icon name="whatsapp" color={colors.onGreen} size={20} strokeWidth={2} />} onPress={() => open(wa, 'whatsapp')} accessibilityLabel={`WhatsApp ${shop.name}`} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { paddingHorizontal: space.lg, paddingTop: space.md, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  row: { flexDirection: 'row', gap: space.sm + 2 },
  flex: { flex: 1 },
});
