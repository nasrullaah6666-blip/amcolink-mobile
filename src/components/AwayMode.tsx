import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, Button, TextField } from '@/components/ui';
import { updateShop } from '@/api/seller';
import { awayDateProblem, awayUntilLabel, isAway } from '@/core/away';
import { colors, radius, space } from '@/theme/tokens';

/** "Away mode" for a whole profile (website: components/AwayMode.tsx): listings are hidden until the return date or until turned off. */
export function AwayMode({ shopId, awaySince, awayUntil, onChanged }: { shopId: string; awaySince: string | null; awayUntil: string | null; onChanged: () => void }) {
  const away = isAway({ away_since: awaySince, away_until: awayUntil });
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const save = async (on: boolean) => {
    const problem = on ? awayDateProblem(date.trim()) : null;
    if (problem) { setMsg(problem); return; }
    setBusy(true); setMsg('');
    try {
      // Return date: the start of that day in the seller's own time zone (same as the website).
      const until = on && date.trim() ? new Date(`${date.trim()}T00:00:00`).toISOString() : null;
      await updateShop(shopId, on ? { away_since: new Date().toISOString(), away_until: until } : { away_since: null, away_until: null });
      setOpen(false); setDate(''); onChanged();
    } catch (e) { setMsg((e as Error).message || 'Could not save. Please try again.'); }
    finally { setBusy(false); }
  };

  if (away) {
    return (
      <View style={styles.box}>
        <AppText variant="label">🌙 Away mode is on</AppText>
        <AppText variant="bodySmall">
          Your listings are hidden from buyers {awayUntil ? `until ${awayUntilLabel(awayUntil)}; they come back automatically.` : 'until you turn this off.'} Your profile page shows an “Away” notice.
        </AppText>
        <Button title="I’m back: show my listings" loading={busy} onPress={() => save(false)} />
        {msg ? <AppText variant="caption" tone="error">{msg}</AppText> : null}
      </View>
    );
  }
  if (!open) return <Button title="🌙 Going away? Turn on Away mode" variant="ghost" onPress={() => setOpen(true)} />;
  return (
    <View style={styles.box}>
      <AppText variant="label">Away mode</AppText>
      <AppText variant="bodySmall" tone="secondary">Hides all listings of this profile from buyers (for travel, Eid, Ramadan…). Nothing is deleted. Your profile page stays visible with an “Away” notice.</AppText>
      <TextField label="Back on (optional)" value={date} onChangeText={setDate} placeholder="e.g. 2027-03-31" keyboardType="numbers-and-punctuation" maxLength={10} />
      <AppText variant="caption" tone="secondary">{date.trim() ? 'Your listings come back automatically on that day.' : 'No date: listings stay hidden until you turn Away mode off.'}</AppText>
      <View style={styles.row}>
        <Button style={styles.flex} title="Turn on Away mode" loading={busy} onPress={() => save(true)} />
        <Button style={styles.flex} title="Cancel" variant="outline" disabled={busy} onPress={() => { setOpen(false); setMsg(''); }} />
      </View>
      {msg ? <AppText variant="caption" tone="error">{msg}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: space.sm, padding: space.md, borderRadius: radius.md, backgroundColor: colors.greenTint },
  row: { flexDirection: 'row', gap: space.sm },
  flex: { flex: 1 },
});
