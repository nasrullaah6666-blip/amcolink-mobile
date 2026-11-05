import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppText, Button, Chip, TextField } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PickerField } from '@/components/PickerField';
import { PhotoEditor } from '@/components/PhotoEditor';
import { Empty, ErrorState, Loading } from '@/components/States';
import { useAuth } from '@/auth/session';
import { buildAdEdit, fetchEditableAd, saveAdEdit, type PriceMode } from '@/api/postAd';
import { needsCondition, needsExpiry, subsOf } from '@/core/categories';
import { CONDITIONS } from '@/core/conditions';
import { CURRENCIES, currencyLabel } from '@/core/listing';
import { categoriesInGroup } from '@/core/property';
import { isRental } from '@/core/rentals';
import { CATEGORIES } from '@/core/types';
import { SITE_URL } from '@/lib/site';
import { colors, radius, size, space } from '@/theme/tokens';

const CATEGORY_OPTIONS = [...categoriesInGroup('shop', CATEGORIES), 'Services'].map((c) => ({ value: c, label: c }));
const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({ value: c, label: currencyLabel(c) }));
const PRICE_MODES: { value: PriceMode; label: string }[] = [{ value: 'from', label: 'From' }, { value: 'fixed', label: 'Fixed price' }, { value: 'ask', label: 'Ask me' }];

function Tick({ on, onPress, children }: { on: boolean; onPress: () => void; children: React.ReactNode }) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={onPress} style={styles.tick}>
      <View style={[styles.box, on && styles.boxOn]}>{on ? <AppText variant="label" tone="onGreen">✓</AppText> : null}</View>
      <View style={styles.flex}>{children}</View>
    </Pressable>
  );
}

/** Edit a listing (website: app/ads/[id]/edit, components/AdEditForm.tsx). Shopping and Services in the app; property on the website. */
export default function EditAd() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['edit-ad', id], queryFn: () => fetchEditableAd(String(id)), enabled: !!id && !!user });
  const ad = q.data;

  const [ready, setReady] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('');
  const [category, setCategory] = useState('');
  const [sub, setSub] = useState('');
  const [condition, setCondition] = useState('');
  const [free, setFree] = useState(false);
  const [priceMode, setPriceMode] = useState<PriceMode>('from');
  const [expiry, setExpiry] = useState('');
  const [noExpiry, setNoExpiry] = useState(false);
  const [availability, setAvailability] = useState<'available' | 'reserved' | 'sold'>('available');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!ad || ready) return;
    setPhotos(ad.photo_urls ?? []); setTitle(ad.title); setDescription(ad.description ?? '');
    setFree(ad.price !== null && Number(ad.price) === 0);
    setPrice(ad.price !== null && Number(ad.price) !== 0 ? String(ad.price) : '');
    setCurrency(ad.currency); setCategory(ad.category); setSub(ad.subcategory ?? ''); setCondition(ad.condition ?? '');
    setPriceMode(ad.price === null ? 'ask' : ad.price_from ? 'from' : 'fixed');
    setExpiry(ad.expiry_date ?? ''); setNoExpiry(Boolean(ad.no_expiry)); setAvailability(ad.availability);
    setReady(true);
  }, [ad, ready]);

  const header = <ScreenHeader title="Edit listing" />;
  if (!user) return <SafeAreaView style={styles.page}>{header}<View style={styles.body}><Empty title="Sign in to edit" action={{ title: 'Sign in', onPress: () => router.replace('/sign-in') }} /></View></SafeAreaView>;
  if (q.isPending || (ad && !ready)) return <SafeAreaView style={styles.page}>{header}<Loading /></SafeAreaView>;
  if (q.isError) return <SafeAreaView style={styles.page}>{header}<View style={styles.body}><ErrorState message={(q.error as Error).message} onRetry={() => q.refetch()} /></View></SafeAreaView>;
  if (!ad || ad.owner_id !== user.id) return <SafeAreaView style={styles.page}>{header}<View style={styles.body}><Empty title="You can only edit your own listings" /></View></SafeAreaView>;
  if (isRental(ad.category)) {
    return (
      <SafeAreaView style={styles.page}>{header}<View style={styles.body}>
        <Empty title="Edit property on the website" hint="Editing houses, rooms and land in the app comes in a later update."
          action={{ title: 'Open the website', onPress: () => WebBrowser.openBrowserAsync(`${SITE_URL}/ads/${ad.id}/edit`) }} />
      </View></SafeAreaView>
    );
  }

  const service = category === 'Services';
  const subs = subsOf(category);

  async function save() {
    setMessage('');
    const built = buildAdEdit({ title, description, price, currency, category, subcategory: sub, condition, free, priceMode, expiryDate: expiry, noExpiry, availability, photos }, ad!);
    if (!built.ok) { setMessage(built.error); return; }
    setBusy(true);
    try {
      await saveAdEdit(ad!.id, built.values, built.removedPhotos);
      qc.invalidateQueries({ queryKey: ['my-ads'] });
      qc.invalidateQueries({ queryKey: ['listing', ad!.id] });
      router.back();
    } catch (e) { setMessage((e as Error).message || 'Update failed.'); } finally { setBusy(false); }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.page}>
      {header}
      <KeyboardAvoidingView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <TextField label="Title *" value={title} onChangeText={setTitle} maxLength={140} />
          <TextField label="Description *" value={description} onChangeText={setDescription} maxLength={5000} multiline style={styles.multi} />
          {service ? (
            <View style={styles.section}><AppText variant="label">Price</AppText>
              <View style={styles.chips}>{PRICE_MODES.map((m) => <Chip key={m.value} label={m.label} selected={priceMode === m.value} onPress={() => setPriceMode(m.value)} />)}</View>
            </View>
          ) : null}
          {!(service && priceMode === 'ask') ? (
            free && !service ? <View style={styles.note}><AppText variant="heading" tone="green">FREE</AppText></View>
              : <TextField label={service ? 'Amount *' : 'Price (optional)'} value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder={service ? 'e.g. 1500' : 'Empty = Price on request'} />
          ) : null}
          <PickerField label="Currency" value={currency} options={CURRENCY_OPTIONS} onChange={setCurrency} />
          <PickerField label="Category *" value={category} options={CATEGORY_OPTIONS.some((o) => o.value === ad.category) ? CATEGORY_OPTIONS : [{ value: ad.category, label: ad.category }, ...CATEGORY_OPTIONS]}
            onChange={(v) => { setCategory(v); setSub(''); }} />
          {subs.length ? (
            <View style={styles.section}><AppText variant="label">What kind? *</AppText>
              <View style={styles.chips}>{subs.map((s) => <Chip key={s} label={s} selected={sub === s} onPress={() => setSub(s)} />)}</View>
            </View>
          ) : null}
          {!service ? (
            <Tick on={free} onPress={() => setFree((f) => !f)}>
              <AppText variant="label">I’m giving this away for free</AppText>
              <AppText variant="caption" tone="secondary">It will show as FREE and appear in the Free section.</AppText>
            </Tick>
          ) : null}
          {needsCondition(category, sub) ? (
            <View style={styles.section}><AppText variant="label">Condition *</AppText>
              <View style={styles.chips}>{CONDITIONS.map((c) => <Chip key={c.value} label={c.label} selected={condition === c.value} onPress={() => setCondition(c.value)} />)}</View>
            </View>
          ) : null}
          {needsExpiry(category, sub) ? (
            <View style={styles.section}>
              <AppText variant="label">{`Expiry date${noExpiry ? '' : ' *'}`}</AppText>
              {!noExpiry ? <TextField label="Year-month-day" value={expiry} onChangeText={setExpiry} placeholder="e.g. 2027-03-31" maxLength={10} /> : null}
              <Tick on={noExpiry} onPress={() => setNoExpiry((v) => !v)}><AppText variant="bodySmall">No expiry date (fresh or unpackaged)</AppText></Tick>
            </View>
          ) : null}
          <View style={styles.section}><AppText variant="label">Availability</AppText>
            <View style={styles.chips}>
              {([['available', 'Available'], ['reserved', 'Reserved'], ['sold', 'Sold / unavailable']] as const).map(([v, l]) => (
                <Chip key={v} label={l} selected={availability === v} onPress={() => setAvailability(v)} />
              ))}
            </View>
          </View>
          <View style={styles.section}>
            <AppText variant="label">Photos * (at least 1, up to 6)</AppText>
            <PhotoEditor userId={user.id} photos={photos} onChange={setPhotos} onError={setMessage} />
          </View>
          {message ? <AppText variant="bodySmall" tone="error" accessibilityRole="alert">{message}</AppText> : null}
          <Button title={busy ? 'Saving…' : 'Save changes'} size="lg" loading={busy} onPress={save} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  body: { padding: space.lg, gap: space.lg, paddingBottom: space.xxl * 2 },
  section: { gap: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  multi: { height: 120, textAlignVertical: 'top', paddingTop: space.sm },
  note: { padding: space.md, borderRadius: radius.md, backgroundColor: colors.greenTint },
  tick: { flexDirection: 'row', gap: space.sm + 2, alignItems: 'flex-start', minHeight: size.touch, paddingVertical: space.xs },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  boxOn: { backgroundColor: colors.green, borderColor: colors.green },
});
