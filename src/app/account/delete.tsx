import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { AppText, Button, TextField } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuth } from '@/auth/session';
import { deleteMyAccount } from '@/api/account';
import { colors, radius, size, space } from '@/theme/tokens';

const REMOVED = [
  'Your account and login',
  'Your shops and all their listings',
  'All photos you uploaded',
  'Saved items, saved searches and blocked shops',
  'Reviews you wrote and Wanted requests you posted',
  'Your notifications',
];

/** Permanently deletes the signed-in account (website: components/DeleteAccount; required by Google Play). */
export default function DeleteAccount() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [understood, setUnderstood] = useState(false);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const ready = understood && typed.trim().toUpperCase() === 'DELETE';
  const isAdmin = user?.app_metadata?.role === 'admin';

  async function run() {
    if (!ready || !user) return;
    setBusy(true);
    try {
      await deleteMyAccount(user.id, setMsg);
      qc.clear();
      router.replace('/');
    } catch (e) {
      setMsg((e as Error).message || 'Could not delete the account. Please try again.');
      setBusy(false);
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.page}>
      <ScreenHeader title="Delete your account" />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {user ? <AppText variant="bodySmall" tone="secondary">Signed in as {user.email}</AppText> : null}
        {!user ? <AppText variant="body">Please sign in first.</AppText> : isAdmin ? (
          <View style={styles.soft}><AppText variant="bodySmall">Admin accounts cannot be deleted here.</AppText></View>
        ) : (
          <>
            <View style={styles.warn}>
              <AppText variant="label" tone="error">This cannot be undone</AppText>
              <AppText variant="bodySmall">Deleting your account permanently removes:</AppText>
              {REMOVED.map((r) => <AppText key={r} variant="bodySmall">• {r}</AppText>)}
            </View>
            <View style={styles.soft}>
              <AppText variant="label">Just need a break?</AppText>
              <AppText variant="bodySmall">You can sign out instead, or mark your items as sold in My ads. Everything will be here when you come back.</AppText>
            </View>
            <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: understood }} disabled={busy} onPress={() => setUnderstood((v) => !v)} style={styles.tick}>
              <View style={[styles.box, understood && styles.boxOn]}>{understood ? <AppText variant="label" tone="onGreen">✓</AppText> : null}</View>
              <AppText variant="bodySmall" style={styles.flex}>I understand my account and everything above will be deleted forever.</AppText>
            </Pressable>
            <TextField label="Type DELETE to confirm" value={typed} onChangeText={setTyped} autoCapitalize="characters" autoComplete="off" autoCorrect={false} placeholder="DELETE" editable={!busy} />
            <Button title="Cancel, keep my account" variant="outline" size="lg" onPress={() => router.back()} disabled={busy} />
            <Button title={busy ? 'Deleting…' : 'Permanently delete account'} size="lg" variant="ghost" disabled={!ready} loading={busy} onPress={run} />
            {msg ? <AppText variant="bodySmall" tone="error" accessibilityLiveRegion="polite">{msg}</AppText> : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  body: { padding: space.lg, gap: space.lg, paddingBottom: space.xxl * 2 },
  warn: { gap: space.xs, padding: space.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.error, backgroundColor: colors.surface },
  soft: { gap: space.xs, padding: space.lg, borderRadius: radius.lg, backgroundColor: colors.greenTint },
  tick: { flexDirection: 'row', gap: space.sm + 2, alignItems: 'flex-start', minHeight: size.touch },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  boxOn: { backgroundColor: colors.error, borderColor: colors.error },
  flex: { flex: 1 },
});
