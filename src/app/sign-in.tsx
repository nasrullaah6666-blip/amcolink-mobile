import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AuthForm } from '@/components/AuthForm';
import { colors } from '@/theme/tokens';

export default function SignIn() {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.page}>
      <ScreenHeader />
      <AuthForm mode="signin" />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: colors.background } });
