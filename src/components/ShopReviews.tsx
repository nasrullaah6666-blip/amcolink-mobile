import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppText, Button, TextField } from '@/components/ui';
import { Loading } from '@/components/States';
import { useAuth } from '@/auth/session';
import { fetchReviews, saveReply, saveReview, type Review } from '@/api/reviews';
import { colors, radius, size, space } from '@/theme/tokens';

// Same wording as the website's ReviewForm.
const MESSAGES: Record<string, string> = {
  signin: 'Sign in to leave a review.',
  contact_first: 'To keep reviews honest, contact this seller by WhatsApp or phone while signed in. You can review after that.',
  banned: 'Your account cannot post reviews.',
};

function Stars({ n }: { n: number }) {
  return <AppText variant="label" tone="green" accessibilityLabel={`${n} out of 5 stars`}>{'★'.repeat(n)}<AppText variant="label" style={styles.off}>{'★'.repeat(5 - n)}</AppText></AppText>;
}

function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <View style={styles.starRow} accessibilityRole="radiogroup" accessibilityLabel="Rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <Pressable key={i} accessibilityRole="radio" accessibilityState={{ selected: value === i }} accessibilityLabel={`${i} star${i > 1 ? 's' : ''}`} onPress={() => onChange(i)} style={styles.starBtn}>
          <AppText variant="title" style={i <= value ? styles.on : styles.off}>★</AppText>
        </Pressable>
      ))}
    </View>
  );
}

function ReviewForm({ shopId, existing, onSaved }: { shopId: string; existing?: Review | null; onSaved: () => void }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const submit = async () => {
    if (rating < 1) { setMessage('Tap the stars to choose a rating.'); return; }
    setBusy(true); setMessage('');
    try { await saveReview(user!.id, shopId, rating, comment, existing?.id); onSaved(); }
    catch (e) { setMessage((e as Error).message || 'Could not save your review.'); } finally { setBusy(false); }
  };
  return (
    <View style={styles.card}>
      <AppText variant="label">{existing ? 'Edit your review' : 'Rate this seller'}</AppText>
      <StarInput value={rating} onChange={setRating} />
      <TextField label="Comment (optional)" value={comment} onChangeText={setComment} maxLength={500} multiline style={styles.multi}
        placeholder="How was your experience? Was the item as described?" />
      {message ? <AppText variant="bodySmall" tone="error">{message}</AppText> : null}
      <Button title={busy ? 'Saving…' : existing ? 'Save review' : 'Post review'} loading={busy} onPress={submit} />
    </View>
  );
}

function ReplyForm({ review, onSaved }: { review: Review; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(review.seller_reply ?? '');
  const [busy, setBusy] = useState(false);
  if (!open) return <Button title={review.seller_reply ? 'Edit reply' : 'Reply'} variant="ghost" onPress={() => setOpen(true)} />;
  return (
    <View style={styles.gap}>
      <TextField label="Your reply" value={text} onChangeText={setText} maxLength={500} multiline style={styles.multi} placeholder="Thank the buyer or respond politely…" />
      <Button title={busy ? 'Saving…' : 'Save reply'} loading={busy} onPress={async () => { setBusy(true); try { await saveReply(review.id, text); setOpen(false); onSaved(); } finally { setBusy(false); } }} />
    </View>
  );
}

/** Reviews on a shop page (website: components/ShopReviews.tsx). */
export function ShopReviews({ shopId, ownerId, shopName }: { shopId: string; ownerId: string; shopName: string }) {
  const { user } = useAuth();
  const q = useQuery({ queryKey: ['reviews', shopId, user?.id ?? ''], queryFn: () => fetchReviews(shopId) });
  const [editing, setEditing] = useState(false);
  const list = q.data?.list ?? [];
  const status = q.data?.status ?? 'signin';
  const isOwner = user?.id === ownerId;
  const mine = user ? list.find((r) => r.reviewer_id === user.id) ?? null : null;
  const saved = () => { setEditing(false); q.refetch(); };

  let form: React.ReactNode = null;
  if (!isOwner) {
    if (status === 'reviewed' && mine && !editing) {
      form = (
        <View style={[styles.card, styles.thanks]}>
          <AppText variant="bodySmall">Thanks — you reviewed this shop.</AppText>
          <Button title="Edit your review" variant="ghost" onPress={() => setEditing(true)} />
        </View>
      );
    } else if (status === 'ok' || editing) {
      form = <ReviewForm shopId={shopId} existing={mine} onSaved={saved} />;
    } else if (MESSAGES[status]) {
      form = (
        <View style={styles.card}>
          <AppText variant="bodySmall" tone="secondary">{MESSAGES[status]}</AppText>
          {status === 'signin' ? <Button title="Sign in" variant="outline" onPress={() => router.push('/sign-in')} /> : null}
        </View>
      );
    }
  }

  return (
    <View style={styles.wrap}>
      <AppText variant="heading">Reviews</AppText>
      <AppText variant="caption" tone="secondary">From buyers who contacted {shopName}.</AppText>
      {form}
      {q.isPending ? <Loading /> : list.length === 0 ? <AppText variant="bodySmall" tone="secondary">No reviews yet.</AppText> : list.map((r) => (
        <View key={r.id} style={styles.card}>
          <View style={styles.rowBetween}>
            <AppText variant="label">{r.reviewer_name}</AppText>
            <AppText variant="caption" tone="secondary">{new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</AppText>
          </View>
          <Stars n={r.rating} />
          {r.comment ? <AppText variant="bodySmall">{r.comment}</AppText> : null}
          {r.seller_reply ? (
            <View style={styles.reply}>
              <AppText variant="caption" tone="green">Reply from {shopName}</AppText>
              <AppText variant="bodySmall">{r.seller_reply}</AppText>
            </View>
          ) : null}
          {isOwner ? <ReplyForm review={r} onSaved={() => q.refetch()} /> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm, marginTop: space.xl },
  card: { gap: space.sm, padding: space.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  thanks: { backgroundColor: colors.greenTint, borderColor: colors.greenTint },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', gap: space.sm },
  reply: { gap: 2, padding: space.sm + 2, borderRadius: radius.md, backgroundColor: colors.background },
  starRow: { flexDirection: 'row', gap: space.xs },
  starBtn: { minWidth: size.touch, minHeight: size.touch, alignItems: 'center', justifyContent: 'center' },
  on: { color: colors.green },
  off: { color: colors.borderStrong },
  multi: { height: 90, textAlignVertical: 'top', paddingTop: space.sm },
  gap: { gap: space.sm },
});
