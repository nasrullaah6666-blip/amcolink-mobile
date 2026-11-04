import React, { useMemo, useState } from 'react';
import { StyleSheet, View, type ImageStyle, type StyleProp } from 'react-native';
import { Image } from 'expo-image';
import { photoCandidates } from '@/core/images';
import { colors } from '@/theme/tokens';
import { AppText } from '@/components/ui';

/**
 * A listing or shop photo. Like the website's SmartImg: the small thumbnail first (WebP, then JPEG, then the full photo),
 * through the photo CDN when it is set, and the next address automatically when one fails.
 */
export function Photo({ src, thumb = false, style, label }: { src?: string | null; thumb?: boolean; style?: StyleProp<ImageStyle>; label?: string }) {
  const list = useMemo(() => (src ? photoCandidates(src, thumb) : []), [src, thumb]);
  const [i, setI] = useState(0);
  if (!list.length || i >= list.length) {
    return (
      <View style={[styles.empty, style as object]} accessibilityLabel={label ?? 'No photo'}>
        <AppText variant="caption" tone="secondary">No photo</AppText>
      </View>
    );
  }
  return (
    <Image
      source={{ uri: list[i] }}
      style={[styles.img, style]}
      contentFit="cover"
      transition={120}
      cachePolicy="disk"
      recyclingKey={list[i]}
      accessibilityLabel={label}
      onError={() => setI((n) => n + 1)}
    />
  );
}

const styles = StyleSheet.create({
  img: { backgroundColor: colors.placeholder },
  empty: { backgroundColor: colors.placeholder, alignItems: 'center', justifyContent: 'center' },
});
