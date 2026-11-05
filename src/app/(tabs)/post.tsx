import React, { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppText, Button, Chip, TextField } from '@/components/ui';
import { Photo } from '@/components/Photo';
import { PickerField } from '@/components/PickerField';
import { Empty, ErrorState, Loading } from '@/components/States';
import { useAuth } from '@/auth/session';
import { fetchMyShops } from '@/api/seller';
import { uploadAdPhoto } from '@/api/photos';
import { buildAd, buildPropertyAd, insertAd, saveProfileRole, type PriceMode, type PropertyDraft } from '@/api/postAd';
import { db } from '@/api/db';
import { needsCondition, needsExpiry, subsOf } from '@/core/categories';
import { CONDITIONS } from '@/core/conditions';
import { currencyForCountry } from '@/core/geo';
import { CURRENCIES, currencyLabel } from '@/core/listing';
import { NOT_ALLOWED_ITEMS, NOT_ALLOWED_RENTALS } from '@/core/notAllowed';
import { PropertyFields } from '@/components/PropertyFields';
import { DEALS, type Deal } from '@/core/rentals';
import { categoriesInGroup } from '@/core/property';
import { CATEGORIES } from '@/core/types';
import { isRole, roleLabel, ROLES } from '@/core/property';
import { colors, radius, size, space } from '@/theme/tokens';

const MAX_PHOTOS = 6;
const SHOP_CATEGORIES = categoriesInGroup('shop', CATEGORIES).map((c) => ({ value: c, label: c }));
const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({ value: c, label: currencyLabel(c) }));
const PRICE_MODES: { value: PriceMode; label: string }[] = [{ value: 'from', label: 'From' }, { value: 'fixed', label: 'Fixed price' }, { value: 'ask', label: 'Ask me' }];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={styles.section}><AppText variant="label">{title}</AppText>{children}</View>;
}

/** Post Ad (website: components/AdForm.tsx) for Shopping and Services. */
export default function PostScreen() {
  const { ready, user } = useAuth();
  const qc = useQueryClient();
  const shopsQ = useQuery({ queryKey: ['my-shops', user?.id], queryFn: () => fetchMyShops(user!.id), enabled: !!user });
  const shops = useMemo(() => shopsQ.data ?? [], [shopsQ.data]);

  const [shopId, setShopId] = useState('');
  const shop = shops.find((s) => s.id === shopId) ?? shops[0];
  const [group, setGroup] = useState<'shop' | 'service' | 'property' | ''>('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(0);
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
  const [rulesOk, setRulesOk] = useState(false);
  const [deal, setDeal] = useState<Deal | ''>('');
  const [prop, setProp] = useState<PropertyDraft>({});
  const [newRole, setNewRole] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { if (shop && !currency) setCurrency(currencyForCountry(shop.country)); }, [shop, currency]);

  if (!ready || (user && shopsQ.isPending)) return <SafeAreaView style={styles.page}><Loading /></SafeAreaView>;
  if (!user) {
    return (
      <SafeAreaView style={styles.page}><View style={styles.pad}>
        <Empty title="Sell on Amcolink" hint="Sign in to post your first ad. It's free." action={{ title: 'Sign in', onPress: () => router.push('/sign-in') }} />
      </View></SafeAreaView>
    );
  }
  if (shopsQ.isError) return <SafeAreaView style={styles.page}><View style={styles.pad}><ErrorState message={(shopsQ.error as Error).message} onRetry={() => shopsQ.refetch()} /></View></SafeAreaView>;
  if (!shop) {
    return (
      <SafeAreaView style={styles.page}><View style={styles.pad}>
        <Empty title="Create your seller profile" hint="One profile for Shopping, Services and Properties. You choose what to post each time." action={{ title: 'Create profile', onPress: () => router.push('/shops/new') }} />
      </View></SafeAreaView>
    );
  }
  if (shop.status === 'suspended') {
    return <SafeAreaView style={styles.page}><View style={styles.pad}><Empty title="This account cannot post" hint="It is suspended. Contact Amcolink if you think this is a mistake." /></View></SafeAreaView>;
  }

  const service = category === 'Services';
  const rental = group === 'property';
  const shopRole = (shop as { property_role?: string | null }).property_role ?? null;
  const subs = subsOf(category);
  const showCondition = needsCondition(category, sub);
  const showExpiry = needsExpiry(category, sub);

  const pickGroup = (g: 'shop' | 'service' | 'property') => {
    setGroup(g); setSub(''); setFree(false); setDeal(''); setProp({});
    setCategory(g === 'service' ? 'Services' : '');
  };

  async function addPhotos(fromCamera: boolean) {
    setMessage('');
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) return;
    const perm = fromCamera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { setMessage(fromCamera ? 'Allow the camera to take a photo.' : 'Allow access to your photos to add one.'); return; }
    const res = fromCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: room, quality: 1 });
    if (res.canceled) return;
    const picked = res.assets.slice(0, room);
    setUploading((n) => n + picked.length);
    for (const a of picked) {
      try {
        const url = await uploadAdPhoto(user!.id, { uri: a.uri, width: a.width, height: a.height });
        setPhotos((p) => [...p, url].slice(0, MAX_PHOTOS));
      } catch (e) {
        setMessage((e as Error).message || 'Upload failed.');
      } finally { setUploading((n) => n - 1); }
    }
  }

  async function removePhoto(url: string) {
    setPhotos((p) => p.filter((x) => x !== url));
    // Website PhotoManager deleteOnRemove: delete the file now (an orphan file is harmless if this fails).
    const m = /\/ad-photos\/(.+)$/.exec(url);
    if (m) { try { await db().storage.from('ad-photos').remove([decodeURIComponent(m[1])]); } catch { /* ignore */ } }
  }

  async function publish() {
    setMessage('');
    let row: Record<string, unknown>;
    let saveRole: string | null = null;
    if (group === 'property') {
      // Rent or sale is chosen by the poster, never defaulted (website rule).
      const built = buildPropertyAd({ shopId: shop.id, title, description, price, currency, availability, rulesOk, photos }, deal, prop, shopRole, newRole, user!.id);
      if (!built.ok) { setMessage(built.error); return; }
      row = built.row; saveRole = built.saveRole;
    } else {
      const built = buildAd({
        shopId: shop.id, group, title, description, price, currency, category, subcategory: sub, condition, free, priceMode,
        expiryDate: expiry, noExpiry, availability, rulesOk, photos,
      }, user!.id);
      if (!built.ok) { setMessage(built.error); return; }
      row = built.row;
    }
    setBusy(true);
    try {
      // First house or room on this profile: save owner or agent once on the profile (website rule).
      if (saveRole) { await saveProfileRole(shop.id, saveRole); qc.invalidateQueries({ queryKey: ['my-shops', user!.id] }); }
      await insertAd(row);
      qc.invalidateQueries({ queryKey: ['my-ads', user!.id] });
      Alert.alert('Published', 'Your listing is saved. You can see it in My ads.');
      setPhotos([]); setTitle(''); setDescription(''); setPrice(''); setCategory(group === 'service' ? 'Services' : ''); setSub(''); setCondition('');
      setFree(false); setExpiry(''); setNoExpiry(false); setAvailability('available'); setRulesOk(false); setDeal(''); setProp({});
      router.push('/dashboard');
    } catch (e) {
      setMessage((e as Error).message || 'Could not publish listing.');
    } finally { setBusy(false); }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <KeyboardAvoidingView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <AppText variant="title" accessibilityRole="header">Post an ad</AppText>
          {shops.length > 1 ? (
            <PickerField label="Post from *" value={shop.id} options={shops.map((s) => ({ value: s.id, label: s.name }))}
              onChange={(v) => { setShopId(v); setCurrency(currencyForCountry(shops.find((s) => s.id === v)?.country)); }} />
          ) : <AppText variant="bodySmall" tone="secondary">Posting as {shop.name}</AppText>}

          <Section title="What are you posting? *">
            <View style={styles.groups}>
              {([['shop', 'Shopping'], ['service', 'Services'], ['property', 'Properties']] as const).map(([g, l]) => (
                <Chip key={g} label={l} selected={group === g} onPress={() => pickGroup(g)} />
              ))}
            </View>
          </Section>

          {group ? (
            <>
              <Section title={`Photos * (at least 1, up to ${MAX_PHOTOS})`}>
                <View style={styles.photos}>
                  {photos.map((u, i) => (
                    <View key={u} style={styles.photoBox}>
                      <Photo src={u} thumb style={styles.photo} label={`Photo ${i + 1}`} />
                      <Pressable accessibilityRole="button" accessibilityLabel={`Remove photo ${i + 1}`} onPress={() => removePhoto(u)} style={styles.remove}>
                        <AppText variant="label">✕</AppText>
                      </Pressable>
                    </View>
                  ))}
                  {Array.from({ length: uploading }).map((_, i) => <View key={`u${i}`} style={[styles.photo, styles.photoWait]}><Loading label="" /></View>)}
                </View>
                {photos.length + uploading < MAX_PHOTOS ? (
                  <View style={styles.row}>
                    <Button style={styles.flex} title="Take photo" variant="outline" onPress={() => addPhotos(true)} />
                    <Button style={styles.flex} title="Choose photos" variant="outline" onPress={() => addPhotos(false)} />
                  </View>
                ) : null}
                <AppText variant="caption" tone="secondary">{rental ? 'Real photos of the actual property only.' : 'Real photos of the actual item only. No pictures taken from other sites.'}</AppText>
              </Section>

              <TextField label="Title *" value={title} onChangeText={setTitle} maxLength={140}
                placeholder={service ? 'What you do, e.g. Plumber: leaks, taps, installs' : 'What are you offering?'} />
              <TextField label="Description *" value={description} onChangeText={setDescription} maxLength={5000} multiline
                style={styles.multi} placeholder="Size, colour, model, what’s included, any faults… (at least 20 characters)" />

              {rental ? (
                <>
                  {isRole(shopRole) ? (
                    <View style={styles.note}><AppText variant="bodySmall">Listed by: {roleLabel(shopRole)}. Shown on this listing, taken from your profile.</AppText></View>
                  ) : (
                    <Section title="Are you the owner or an agent? *">
                      {ROLES.map((r) => (
                        <Pressable key={r.value} accessibilityRole="radio" accessibilityState={{ selected: newRole === r.value }} onPress={() => setNewRole(r.value)} style={styles.tick}>
                          <View style={[styles.box, newRole === r.value && styles.boxOn]}>{newRole === r.value ? <AppText variant="label" tone="onGreen">✓</AppText> : null}</View>
                          <View style={styles.flex}><AppText variant="label">{r.label}</AppText><AppText variant="caption" tone="secondary">{r.help}</AppText></View>
                        </Pressable>
                      ))}
                    </Section>
                  )}
                  <Section title="For rent or for sale? *">
                    <View style={styles.groups}>
                      {DEALS.map((d) => <Chip key={d.value} label={d.label} selected={deal === d.value}
                        onPress={() => { setDeal(d.value); setProp({ r_period: 'month', ...((shopRole ?? newRole) === 'agent' ? { r_agent_fee: 'none' } : {}) }); }} />)}
                    </View>
                  </Section>
                  {deal ? <PropertyFields deal={deal} agent={(shopRole ?? newRole) === 'agent'} value={prop} onChange={setProp} /> : null}
                </>
              ) : null}
              {group === 'shop' ? (
                <PickerField label="Category *" value={category} options={SHOP_CATEGORIES} placeholder="Choose a category" onChange={(v) => { setCategory(v); setSub(''); }} />
              ) : null}
              {subs.length ? (
                <Section title="What kind? *">
                  <View style={styles.groups}>{subs.map((s) => <Chip key={s} label={s} selected={sub === s} onPress={() => setSub(s)} />)}</View>
                </Section>
              ) : null}

              {service ? (
                <Section title="Price">
                  <View style={styles.groups}>{PRICE_MODES.map((m) => <Chip key={m.value} label={m.label} selected={priceMode === m.value} onPress={() => setPriceMode(m.value)} />)}</View>
                </Section>
              ) : null}
              {!(service && priceMode === 'ask') ? (
                rental ? (
                  <TextField label={deal === 'sale' ? 'Sale price *' : 'Rent *'} value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder={deal === 'sale' ? 'e.g. 8500000' : 'e.g. 15000'} />
                ) : free && !service ? (
                  <View style={styles.note}><AppText variant="heading" tone="green">FREE</AppText></View>
                ) : (
                  <TextField label={service ? 'Amount *' : 'Price (optional)'} value={price} onChangeText={setPrice} keyboardType="decimal-pad"
                    placeholder={service ? 'e.g. 1500' : 'Empty = Price on request'} />
                )
              ) : null}
              <PickerField label="Currency" value={currency} options={CURRENCY_OPTIONS} onChange={setCurrency} />

              {!service && !rental ? (
                <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: free }} onPress={() => setFree((f) => !f)} style={styles.tick}>
                  <View style={[styles.box, free && styles.boxOn]}>{free ? <AppText variant="label" tone="onGreen">✓</AppText> : null}</View>
                  <View style={styles.flex}>
                    <AppText variant="label">I’m giving this away for free</AppText>
                    <AppText variant="caption" tone="secondary">It will show as FREE and appear in the Free section.</AppText>
                  </View>
                </Pressable>
              ) : null}

              {showCondition ? (
                <Section title="Condition *">
                  <View style={styles.groups}>{CONDITIONS.map((c) => <Chip key={c.value} label={c.label} selected={condition === c.value} onPress={() => setCondition(c.value)} />)}</View>
                </Section>
              ) : null}
              {showExpiry ? (
                <Section title={`Expiry date${noExpiry ? '' : ' *'}`}>
                  {!noExpiry ? <TextField label="Year-month-day" value={expiry} onChangeText={setExpiry} placeholder="e.g. 2027-03-31" keyboardType="numbers-and-punctuation" maxLength={10} /> : null}
                  <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: noExpiry }} onPress={() => setNoExpiry((v) => !v)} style={styles.tick}>
                    <View style={[styles.box, noExpiry && styles.boxOn]}>{noExpiry ? <AppText variant="label" tone="onGreen">✓</AppText> : null}</View>
                    <AppText variant="bodySmall" style={styles.flex}>No expiry date (fresh or unpackaged)</AppText>
                  </Pressable>
                </Section>
              ) : null}

              <Section title="Availability">
                <View style={styles.groups}>
                  {([['available', 'Available'], ['reserved', 'Reserved'], ['sold', rental && deal !== 'sale' ? 'Rented / unavailable' : 'Sold / unavailable']] as const).map(([v, l]) => (
                    <Chip key={v} label={l} selected={availability === v} onPress={() => setAvailability(v)} />
                  ))}
                </View>
              </Section>

              <View style={styles.rules}>
                <AppText variant="label" tone="green">Not allowed on Amcolink</AppText>
                <AppText variant="caption" tone="secondary">{(rental ? NOT_ALLOWED_RENTALS : NOT_ALLOWED_ITEMS).join(' · ')}.</AppText>
                <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: rulesOk }} onPress={() => setRulesOk((v) => !v)} style={styles.tick}>
                  <View style={[styles.box, rulesOk && styles.boxOn]}>{rulesOk ? <AppText variant="label" tone="onGreen">✓</AppText> : null}</View>
                  <AppText variant="bodySmall" style={styles.flex}>{deal === 'sale' && rental ? 'This property is real, I am the owner or I am authorised to sell it, and it is not on this list.' : rental ? 'This house or room is real, I may rent it out, and it is not on this list.' : 'My item is real, mine to sell, and not on this list.'}</AppText>
                </Pressable>
              </View>

              {message ? <AppText variant="bodySmall" tone="error" accessibilityRole="alert">{message}</AppText> : null}
              <Button title={busy ? 'Publishing…' : 'Publish listing'} size="lg" loading={busy} disabled={uploading > 0} onPress={publish} />
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  pad: { padding: space.lg },
  body: { padding: space.lg, gap: space.lg, paddingBottom: space.xxl * 2 },
  section: { gap: space.sm },
  groups: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  row: { flexDirection: 'row', gap: space.sm },
  photos: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  photoBox: { position: 'relative' },
  photo: { width: 96, height: 96, borderRadius: radius.md },
  photoWait: { backgroundColor: colors.placeholder, justifyContent: 'center' },
  remove: { position: 'absolute', top: -6, right: -6, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  multi: { height: 120, textAlignVertical: 'top', paddingTop: space.sm },
  note: { gap: space.sm, padding: space.md, borderRadius: radius.md, backgroundColor: colors.greenTint },
  tick: { flexDirection: 'row', gap: space.sm + 2, alignItems: 'flex-start', minHeight: size.touch, paddingVertical: space.xs },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  boxOn: { backgroundColor: colors.green, borderColor: colors.green },
  rules: { gap: space.sm, padding: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.green },
});
