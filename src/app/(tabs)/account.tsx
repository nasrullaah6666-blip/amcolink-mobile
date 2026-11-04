import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText, Button } from '@/components/ui';
import { config } from '@/lib/config';
import { colors, radius, space } from '@/theme/tokens';

export default function AccountScreen() {
  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <View style={styles.header}><AppText variant="title">Account</AppText></View>
      <View style={styles.box}>
        <AppText variant="body">Sign in and sign up come in step 3, with the security check that passed the test.</AppText>
        <Button title="Sign in" disabled />
        <Button title="Create account" variant="outline" disabled />
      </View>
      <AppText variant="caption" tone="secondary" style={styles.env}>
        {config.isStaging ? 'Test build · connected to STAGING' : 'Production build'}
      </AppText>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.sm },
  box: { margin: space.lg, padding: space.lg, gap: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  env: { textAlign: 'center' },
});
