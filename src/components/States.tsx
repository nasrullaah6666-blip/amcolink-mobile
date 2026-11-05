import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppText, Button } from '@/components/ui';
import { colors, radius, space } from '@/theme/tokens';

/** Loading, empty and error states: the same look on every screen. */
export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.box} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator color={colors.green} />
      <AppText variant="bodySmall" tone="secondary">{label}</AppText>
    </View>
  );
}

export function Empty({ title, hint, action }: { title: string; hint?: string; action?: { title: string; onPress: () => void } }) {
  return (
    <View style={[styles.box, styles.card]}>
      <AppText variant="heading" style={styles.center}>{title}</AppText>
      {hint ? <AppText variant="bodySmall" tone="secondary" style={styles.center}>{hint}</AppText> : null}
      {action ? <Button title={action.title} variant="outline" onPress={action.onPress} /> : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={[styles.box, styles.card]} accessibilityRole="alert">
      <AppText variant="heading" style={styles.center}>Something went wrong</AppText>
      <AppText variant="bodySmall" tone="secondary" style={styles.center}>{message}</AppText>
      {onRetry ? <Button title="Try again" variant="outline" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center', gap: space.md, padding: space.xl },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginVertical: space.sm },
  center: { textAlign: 'center' },
});
