import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { AppText, Button, Icon, type IconName } from '@/components/ui';
import { Loading } from '@/components/States';
import { useAuth } from '@/auth/session';
import { useBlocked } from '@/auth/mine';
import { useQuery } from '@tanstack/react-query';
import { fetchBlockedShops } from '@/api/me';
import { db } from '@/api/db';
import { config } from '@/lib/config';
import { CONTACT_EMAIL, SITE_URL } from '@/lib/site';
import { colors, radius, size, space } from '@/theme/tokens';

type Row = { label: string; hint: string; icon: IconName; open: () => void };
const web = (path: string) => () => WebBrowser.openBrowserAsync(`${SITE_URL}${path}`).catch(() => {});

// Same Help rows as the website's account page. These pages open the website.
const HELP_ROWS: Row[] = [
  { label: 'About Amcolink', hint: 'How it works', icon: 'compass', open: web('/about') },
  { label: 'Safety tips', hint: 'Stay safe when you buy and sell', icon: 'flag', open: web('/safety') },
  { label: 'Contact us', hint: CONTACT_EMAIL, icon: 'call', open: () => Linking.openURL(`mailto:${CONTACT_EMAIL}`).catch(() => {}) },
  { label: 'Terms of Service', hint: 'The rules of using Amcolink', icon: 'grid', open: web('/terms') },
  { label: 'Privacy', hint: 'How we handle your data', icon: 'user', open: web('/privacy') },
];

function RowList({ rows }: { rows: Row[] }) {
  return (
    <View style={styles.panel}>
      {rows.map((r, i) => (
        <Pressable key={r.label} accessibilityRole="button" accessibilityLabel={`${r.label}. ${r.hint}`} onPress={r.open}
          style={({ pressed }) => [styles.row, i > 0 && styles.rowLine, pressed && { backgroundColor: colors.greenTint }]}>
          <Icon name={r.icon} color={colors.green} size={20} strokeWidth={2} />
          <View style={styles.flex}>
            <AppText variant="label">{r.label}</AppText>
            <AppText variant="caption" tone="secondary">{r.hint}</AppText>
          </View>
          <Icon name="chevronRight" color={colors.borderStrong} size={18} strokeWidth={2} />
        </Pressable>
      ))}
    </View>
  );
}

function BlockedShops({ userId }: { userId: string }) {
  const q = useQuery({ queryKey: ['blocked-shops', userId], queryFn: () => fetchBlockedShops(userId) });
  const { change } = useBlocked();
  const shops = q.data ?? [];
  return (
    <View style={[styles.panel, styles.blocked]}>
      {q.isPending ? <Loading /> : shops.length === 0 ? (
        <AppText variant="bodySmall" tone="secondary">You have not blocked any shops.</AppText>
      ) : shops.map((s) => (
        <View key={s.id} style={styles.blockedRow}>
          <AppText variant="label" style={styles.flex} numberOfLines={1}>{s.name}</AppText>
          <Button title="Unblock" variant="ghost" onPress={() => change.mutate({ shopId: s.id, block: false })} />
        </View>
      ))}
    </View>
  );
}

export default function AccountScreen() {
  const { ready, user } = useAuth();
  const [busy, setBusy] = useState(false);
  const fullName = typeof user?.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : '';

  const signOut = async () => {
    setBusy(true);
    try { await db().auth.signOut(); } finally { setBusy(false); }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <ScrollView contentContainerStyle={styles.body}>
        <AppText variant="title" accessibilityRole="header">{user ? 'My account' : 'Account'}</AppText>
        {!ready ? <Loading /> : user ? (
          <View style={[styles.panel, styles.me]}>
            <View style={styles.avatar}><Icon name="user" color={colors.green} size={26} strokeWidth={2} /></View>
            <View style={styles.flex}>
              <AppText variant="heading">{fullName || 'Welcome to Amcolink'}</AppText>
              <AppText variant="bodySmall" tone="secondary" numberOfLines={1}>{user.email}</AppText>
            </View>
          </View>
        ) : (
          <View style={[styles.panel, styles.signedOut]}>
            <AppText variant="body">Sign in to save listings, post ads and manage your shop.</AppText>
            <Button title="Sign in" size="lg" onPress={() => router.push('/sign-in')} />
            <Button title="Create account" variant="outline" size="lg" onPress={() => router.push('/sign-up')} />
          </View>
        )}

        <AppText variant="caption" tone="secondary" style={styles.section}>HELP</AppText>
        <RowList rows={HELP_ROWS} />

        {user ? (
          <>
            <AppText variant="caption" tone="secondary" style={styles.section}>BLOCKED SHOPS</AppText>
            <BlockedShops userId={user.id} />
          </>
        ) : null}

        {user ? <Button title="Sign out" variant="outline" loading={busy} onPress={signOut} style={styles.signOut} /> : null}

        <AppText variant="caption" tone="secondary" style={styles.env}>
          {config.isStaging ? 'Test build · connected to STAGING' : 'Production build'}
        </AppText>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  body: { padding: space.lg, gap: space.md, paddingBottom: space.xxl },
  panel: { borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' },
  me: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.greenTint, alignItems: 'center', justifyContent: 'center' },
  signedOut: { padding: space.lg, gap: space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md, minHeight: size.touch + 12 },
  rowLine: { borderTopWidth: 1, borderTopColor: colors.border },
  flex: { flex: 1, gap: 2 },
  section: { marginTop: space.md, letterSpacing: 0.5 },
  signOut: { marginTop: space.md },
  blocked: { padding: space.lg, gap: space.sm },
  blockedRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  env: { textAlign: 'center', marginTop: space.lg },
});
