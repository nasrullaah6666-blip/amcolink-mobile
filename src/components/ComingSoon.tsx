import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui';
import { colors, radius, space } from '@/theme/tokens';

/** Placeholder for tabs that are built in a later step. */
export function ComingSoon({ title, step }: { title: string; step: string }) {
  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <View style={styles.header}><AppText variant="title">{title}</AppText></View>
      <View style={styles.box}><AppText variant="bodySmall" tone="secondary">{step}</AppText></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.sm },
  box: { margin: space.lg, padding: space.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
});
