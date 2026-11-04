import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { AppText, Button, Chip, TextField } from '@/components/ui';
import { useAuth } from '@/auth/session';
import { useBlocked } from '@/auth/mine';
import { reportText, sendReport } from '@/api/me';
import { REPORT_REASONS_AD, REPORT_REASONS_SHOP } from '@/core/reportReasons';
import { colors, radius, space } from '@/theme/tokens';

/**
 * Report (listing or shop) and Block shop — website: ReportButton + BlockButton.
 * Same reasons, same text rule, same "already reported" answer. Signed out: asks to sign in.
 */
export function ReportAndBlock({ adId, shopId, shopName }: { adId?: string; shopId: string; shopName: string }) {
  const { user } = useAuth();
  const { blocked, change } = useBlocked();
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const reasons = adId ? REPORT_REASONS_AD : REPORT_REASONS_SHOP;
  const isBlocked = blocked.has(shopId);

  const needSignIn = () => router.push('/sign-in');

  async function send() {
    if (!user) return needSignIn();
    if (!choice) { setMessage('Choose a reason.'); return; }
    const reason = reportText(choice, note);
    if (!reason) { setMessage('Add a short note about the problem.'); return; }
    setBusy(true);
    try {
      const r = await sendReport(user.id, adId ? { adId } : { shopId }, reason);
      setMessage(r === 'already' ? 'You have already reported this. Thank you.' : 'Report submitted for review. Thank you.');
      setChoice(''); setNote(''); setOpen(false);
    } catch (e) {
      setMessage((e as Error).message || 'Could not submit report.');
    } finally { setBusy(false); }
  }

  const toggleBlock = () => {
    if (!user) return needSignIn();
    const go = () => change.mutate({ shopId, block: !isBlocked }, {
      onSuccess: () => setMessage(isBlocked ? 'Unblocked.' : 'Blocked. You won’t see this shop any more.'),
      onError: (e) => setMessage((e as Error).message || 'Could not update.'),
    });
    if (isBlocked) return go();
    Alert.alert(`Block ${shopName}?`, 'You won’t see its listings or get alerts about it. You can unblock it later in My account.', [
      { text: 'Cancel', style: 'cancel' }, { text: 'Block', style: 'destructive', onPress: go },
    ]);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Button title="Report" variant="ghost" onPress={() => (user ? setOpen((o) => !o) : needSignIn())} />
        <Button title={isBlocked ? 'Unblock shop' : 'Block shop'} variant="ghost" loading={change.isPending} onPress={toggleBlock} />
      </View>
      {open ? (
        <View style={styles.panel}>
          <AppText variant="label">What is wrong?</AppText>
          <View style={styles.chips}>
            {reasons.map((r) => <Chip key={r} label={r} selected={choice === r} onPress={() => { setChoice(r); setMessage(''); }} />)}
          </View>
          <TextField label={choice === 'Other' ? 'What is the problem?' : 'Add a note (optional)'} value={note} onChangeText={setNote} maxLength={400} />
          <Button title={busy ? 'Sending…' : 'Send report'} loading={busy} onPress={send} />
        </View>
      ) : null}
      {message ? <AppText variant="bodySmall" tone="secondary" accessibilityLiveRegion="polite">{message}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  row: { flexDirection: 'row', gap: space.sm },
  panel: { gap: space.md, padding: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});
