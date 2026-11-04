import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { AppText, Icon } from '@/components/ui';
import { radius, size, space } from '@/theme/tokens';

/** Back button + title, the same on every inner screen. */
export function ScreenHeader({ title, right }: { title?: string; right?: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        style={styles.back}
      >
        <Icon name="chevronLeft" strokeWidth={2} />
      </Pressable>
      {title ? <AppText variant="title" style={styles.title} numberOfLines={1} accessibilityRole="header">{title}</AppText> : <View style={styles.title} />}
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.sm, paddingTop: space.sm, paddingBottom: space.xs },
  back: { width: size.touch, height: size.touch, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 20 },
});
