import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { AppText, Button, Icon, type IconName } from '@/components/ui';
import { useAuth } from '@/auth/session';
import { colors, radius, size, space } from '@/theme/tokens';

const LOGO = require('../../assets/images/icon.png');

// Website: components/MenuDrawer.tsx — the four ways in. Account, My ads and Help are on the Account tab.
// The website's admin rows are left out on purpose (owner: "go without admin"; no admin in the app).
const ROWS: { label: string; icon: IconName; go: () => void }[] = [
  { label: 'Shopping', icon: 'bag', go: () => router.push('/shopping') },
  { label: 'Services', icon: 'tools', go: () => router.push({ pathname: '/category/[slug]', params: { slug: 'services' } }) },
  { label: 'Properties', icon: 'house', go: () => router.push('/properties') },
  { label: 'Explore', icon: 'compass', go: () => router.push('/explore') },
];

/** The ☰ menu on Home, opening from the right like the website's. */
export function MenuButton() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const go = (fn: () => void) => { setOpen(false); fn(); };
  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel="Menu" onPress={() => setOpen(true)} style={styles.burger} hitSlop={4}>
        <Icon name="menu" size={26} strokeWidth={2} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)} statusBarTranslucent>
        <View style={styles.root}>
          <Pressable style={styles.backdrop} accessibilityRole="button" accessibilityLabel="Close menu" onPress={() => setOpen(false)} />
          <SafeAreaView style={styles.panel} accessibilityViewIsModal>
            <View style={styles.head}>
              <View style={styles.brand}>
                <Image source={LOGO} style={styles.logo} contentFit="contain" />
                <AppText variant="heading">Amcolink</AppText>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Close menu" onPress={() => setOpen(false)} style={styles.close} hitSlop={6}>
                <Icon name="close" size={24} strokeWidth={2} color={colors.textSecondary} />
              </Pressable>
            </View>
            {!user ? <View style={styles.login}><Button title="Log in or create account" onPress={() => go(() => router.push('/sign-in'))} /></View> : null}
            {ROWS.map((r) => (
              <Pressable key={r.label} accessibilityRole="button" accessibilityLabel={r.label} onPress={() => go(r.go)}
                style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.greenTint }]}>
                <Icon name={r.icon} size={22} strokeWidth={1.9} color={colors.textSecondary} />
                <AppText variant="body" style={styles.label}>{r.label}</AppText>
                <Icon name="chevronRight" size={18} strokeWidth={2} color={colors.borderStrong} />
              </Pressable>
            ))}
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  burger: { width: size.touch, height: size.touch, alignItems: 'center', justifyContent: 'center' },
  root: { flex: 1, flexDirection: 'row' },
  backdrop: { flex: 1, backgroundColor: colors.backdrop },
  panel: { width: '82%', maxWidth: 360, backgroundColor: colors.surface },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingVertical: space.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  logo: { width: 34, height: 34, borderRadius: radius.sm },
  close: { width: size.touch, height: size.touch, alignItems: 'center', justifyContent: 'center' },
  login: { padding: space.lg, paddingBottom: space.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 52, paddingHorizontal: space.lg },
  label: { flex: 1, fontSize: 15 },
});
