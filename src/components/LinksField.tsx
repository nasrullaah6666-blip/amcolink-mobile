import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, Button, Icon, TextField } from '@/components/ui';
import { detectLink, linkDisplay, LINK_INFO, MAX_LINKS, type ShopLink } from '@/core/links';
import { colors, radius, space } from '@/theme/tokens';

/** All of a profile's links in one place (website: components/LinksField.tsx): paste a link, the type is found from it. */
export function LinksField({ value, onChange }: { value: ShopLink[]; onChange: (l: ShopLink[]) => void }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const full = value.length >= MAX_LINKS;
  const add = () => {
    setError('');
    const r = detectLink(text);
    if (!r.ok) { setError(r.error); return; }
    if (value.some((l) => l.type === r.link.type)) { setError(`You already added a ${LINK_INFO[r.link.type].label} link. Remove it first to change it.`); return; }
    onChange([...value, r.link]); setText('');
  };
  const move = (i: number, d: -1 | 1) => { const n = [...value]; [n[i], n[i + d]] = [n[i + d], n[i]]; onChange(n); };
  return (
    <View style={styles.box}>
      <AppText variant="label">Links (optional, up to {MAX_LINKS})</AppText>
      <AppText variant="caption" tone="secondary">Facebook, Instagram, TikTok, YouTube, Telegram, X, LinkedIn or your website. Paste the link and we’ll find the right type.</AppText>
      {value.map((l, i) => (
        <View key={l.type} style={styles.row}>
          <View style={styles.flex}>
            <AppText variant="label">{LINK_INFO[l.type].label}</AppText>
            <AppText variant="caption" tone="secondary" numberOfLines={1}>{linkDisplay(l.url)}</AppText>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={`Move ${LINK_INFO[l.type].label} up`} disabled={i === 0} onPress={() => move(i, -1)} style={[styles.icon, styles.up, i === 0 && styles.off]}>
            <Icon name="chevronDown" size={20} color={colors.textSecondary} strokeWidth={2} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${LINK_INFO[l.type].label}`} onPress={() => onChange(value.filter((_, j) => j !== i))} style={styles.icon}>
            <AppText variant="label" tone="secondary">✕</AppText>
          </Pressable>
        </View>
      ))}
      {full ? <AppText variant="caption" tone="secondary">You’ve added {MAX_LINKS} links, the most allowed.</AppText> : (
        <View style={styles.addRow}>
          <View style={styles.flex}>
            <TextField label="Paste a link" value={text} onChangeText={(t) => { setText(t); setError(''); }} placeholder="e.g. facebook.com/yourshop"
              autoCapitalize="none" autoCorrect={false} keyboardType="url" maxLength={300} onSubmitEditing={add} error={error || null} />
          </View>
          <Button title="Add" variant="outline" onPress={add} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: space.sm, padding: space.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.xs, minHeight: 48, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: space.xs },
  icon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  up: { transform: [{ rotate: '180deg' }] },
  off: { opacity: 0.3 },
  addRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm },
  flex: { flex: 1 },
});
