import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { AppText, Button, TextField } from '@/components/ui';
import { db } from '@/api/db';
import { deletePhotos } from '@/core/deletePhotos';
import { colors, radius, space } from '@/theme/tokens';

/**
 * Permanently deletes a seller profile with all its listings and photos (website: components/DeleteShop.tsx).
 * The owner must type the profile name. The account itself stays.
 */
export function DeleteProfile({ shopId, shopName, logoUrl, coverUrl }: { shopId: string; shopName: string; logoUrl?: string | null; coverUrl?: string | null }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const ready = typed.trim().toLowerCase() === shopName.trim().toLowerCase();

  const run = async () => {
    if (!ready) return;
    setBusy(true); setMsg('Deleting…');
    const s = db();
    const { data: ads } = await s.from('ads').select('photo_urls').eq('shop_id', shopId);
    const { error } = await s.from('shops').delete().eq('id', shopId);
    if (error) { setBusy(false); setMsg(error.message); return; }
    await deletePhotos(s, (ads || []).flatMap((a: { photo_urls: string[] | null }) => a.photo_urls || []), 'ad-photos');
    await deletePhotos(s, [logoUrl, coverUrl], 'shop-media');
    qc.invalidateQueries();
    router.replace('/dashboard');
  };

  if (!open) {
    return (
      <View style={styles.closed}>
        <AppText variant="bodySmall" tone="secondary" style={styles.center}>Just taking a break? Use Away mode in My ads instead.</AppText>
        <Button title="Delete this profile" variant="ghost" onPress={() => setOpen(true)} />
      </View>
    );
  }
  return (
    <View style={styles.box}>
      <AppText variant="label">Delete “{shopName}” permanently?</AppText>
      <AppText variant="bodySmall">This removes the profile, all its listings and photos, its reviews and statistics. It can’t be undone. Your account stays.</AppText>
      <TextField label="Type the profile name to confirm" value={typed} onChangeText={setTyped} placeholder={shopName} autoCapitalize="none" autoCorrect={false} editable={!busy} />
      <Button title="Cancel, keep my profile" variant="outline" disabled={busy} onPress={() => { setOpen(false); setTyped(''); setMsg(''); }} />
      <Button title={busy ? 'Deleting…' : 'Delete profile permanently'} variant="ghost" disabled={!ready || busy} onPress={run} />
      {msg ? <AppText variant="bodySmall" tone="error" accessibilityLiveRegion="polite">{msg}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  closed: { marginTop: space.xxl, paddingTop: space.lg, borderTopWidth: 1, borderTopColor: colors.border, alignItems: 'center', gap: space.xs },
  center: { textAlign: 'center' },
  box: { marginTop: space.xxl, gap: space.sm + 2, padding: space.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface },
});
