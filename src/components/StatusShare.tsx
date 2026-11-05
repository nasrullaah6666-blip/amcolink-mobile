import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Button, Icon } from '@/components/ui';
import { photoCandidates } from '@/core/images';
import { BRAND, SITE_URL } from '@/lib/site';
import { colors, fonts, radius, space } from '@/theme/tokens';

/** The picture is drawn at 360×640 (the 9:16 shape of a WhatsApp Status) and saved at 1080×1920. */
const W = 360;
const H = 640;
const SITE = SITE_URL.replace(/^https?:\/\//, '');
const LOGO = require('../../assets/images/icon.png');

export type StatusAd = { title: string; price: string; place: string; photo?: string | null; condition?: string | null };

/** Waits until the photo has loaded (or failed / timed out) so the picture never goes out with a blank photo. */
function waitFor(check: () => boolean, ms: number) {
  return new Promise<void>((resolve) => {
    const start = Date.now();
    const tick = () => (check() || Date.now() - start > ms ? resolve() : setTimeout(tick, 100));
    tick();
  });
}

/** "Share to WhatsApp Status": makes a tall picture of the ad and opens the phone's share screen (pick WhatsApp → My status). */
export function StatusShareButton({ ad, onShared }: { ad: StatusAd; onShared?: () => void }) {
  const card = useRef<View>(null);
  const [drawing, setDrawing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const photos = useMemo(() => (ad.photo ? photoCandidates(ad.photo, false) : []), [ad.photo]);
  const [pi, setPi] = useState(0);
  const loaded = useRef(false);

  const share = async () => {
    setError('');
    setBusy(true);
    loaded.current = !photos.length;
    setDrawing(true);
    try {
      if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available on this phone.');
      await waitFor(() => loaded.current && !!card.current, 8000);
      await new Promise((r) => setTimeout(r, 150));
      const uri = await captureRef(card, { format: 'jpg', quality: 0.9, width: 1080, height: 1920, result: 'tmpfile' });
      onShared?.();
      await Sharing.shareAsync(uri, { mimeType: 'image/jpeg', dialogTitle: 'Share to WhatsApp Status' });
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : 'Could not make the picture. Try again.');
    } finally {
      setBusy(false);
      setDrawing(false);
    }
  };

  return (
    <View>
      <Button
        title="Share to WhatsApp Status"
        size="lg"
        loading={busy}
        onPress={share}
        icon={<Icon name="whatsapp" color={colors.onGreen} size={20} strokeWidth={2} />}
      />
      {error ? <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text> : null}
      {drawing ? (
        <View style={styles.offscreen} pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <View ref={card} collapsable={false} style={styles.card}>
            <View style={styles.brandRow}>
              <View style={styles.logoBox}><Image source={LOGO} style={styles.logo} contentFit="contain" /></View>
              <Text style={styles.brand}>{BRAND}</Text>
            </View>
            <View style={styles.photoBox}>
              {photos[pi] ? (
                <Image
                  source={{ uri: photos[pi] }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  cachePolicy="disk"
                  onLoad={() => { loaded.current = true; }}
                  onError={() => (pi + 1 < photos.length ? setPi(pi + 1) : (loaded.current = true))}
                />
              ) : null}
            </View>
            <View style={styles.info}>
              <Text style={styles.price} numberOfLines={1}>{ad.price}</Text>
              <Text style={styles.title} numberOfLines={2}>{ad.title}</Text>
              {ad.place || ad.condition ? <Text style={styles.place} numberOfLines={1}>{[ad.condition, ad.place].filter(Boolean).join(' · ')}</Text> : null}
              <Text style={styles.site} numberOfLines={1}>See it and chat with the seller · {SITE}</Text>
            </View>
            {/* Left empty on purpose: WhatsApp puts its own buttons and the reply bar over the bottom of a Status. */}
            <View style={styles.whatsappSpace} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.error, fontFamily: fonts.regular, fontSize: 13, marginTop: space.xs },
  offscreen: { position: 'absolute', left: -W * 3, top: 0, width: W, height: H },
  card: { width: W, height: H, backgroundColor: colors.green, padding: space.xl, gap: space.lg },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  logoBox: { width: 32, height: 32, borderRadius: radius.sm, backgroundColor: colors.surface, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  logo: { width: 32, height: 32 },
  brand: { color: colors.onGreen, fontFamily: fonts.bold, fontSize: 19 },
  photoBox: { flex: 1, borderRadius: 18, overflow: 'hidden', backgroundColor: colors.placeholder },
  info: { backgroundColor: colors.surface, borderRadius: radius.tile, padding: space.lg, gap: space.xs },
  price: { color: colors.green, fontFamily: fonts.bold, fontSize: 28, lineHeight: 34 },
  title: { color: colors.text, fontFamily: fonts.semibold, fontSize: 18, lineHeight: 23 },
  place: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 14, lineHeight: 19 },
  site: { color: colors.green, fontFamily: fonts.semibold, fontSize: 14, lineHeight: 19, marginTop: space.xs },
  whatsappSpace: { height: H * 0.15 - space.lg },
});
