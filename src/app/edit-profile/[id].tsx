import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as WebBrowser from 'expo-web-browser';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppText, Button, TextField } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PickerField } from '@/components/PickerField';
import { Photo } from '@/components/Photo';
import { Empty, ErrorState, Loading } from '@/components/States';
import { useAuth } from '@/auth/session';
import { fetchMyShops, nameAvailable, updateShop } from '@/api/seller';
import { uploadAdPhoto } from '@/api/photos';
import { FLOORS } from '@/core/address';
import { countryByName, FEATURED_COUNTRIES, OTHER_COUNTRIES } from '@/core/geo';
import { cleanHours } from '@/core/hours';
import { shopLinks } from '@/core/links';
import { citiesFor, levelName, regionsFor } from '@/core/places';
import { formOf, parseShopForm } from '@/core/shop';
import { SITE_URL } from '@/lib/site';
import { colors, radius, space } from '@/theme/tokens';

const OTHER = '__other__';
const COUNTRY_OPTIONS = [...FEATURED_COUNTRIES, ...OTHER_COUNTRIES].map((c) => ({ value: c.name, label: c.name }));
const FLOOR_OPTIONS = [{ value: '', label: 'Not in a building' }, ...FLOORS.map((f) => ({ value: f, label: f }))];

/**
 * Edit profile (website: components/ShopEditForm.tsx). In the app: name, place, phone/WhatsApp, announcement,
 * address, description, logo and cover. Opening hours, links and the map pin are kept exactly as they are
 * (sent back unchanged) and edited on the website for now.
 */
export default function EditProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['my-shops', user?.id], queryFn: () => fetchMyShops(user!.id), enabled: !!user });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shop = q.data?.find((s) => s.id === id) as any;

  const [ready, setReady] = useState(false);
  const [v, setV] = useState<Record<string, string>>({});
  const [region, setRegion] = useState('');
  const [town, setTown] = useState('');
  const [typed, setTyped] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [cover, setCover] = useState<string | null>(null);
  const [uploading, setUploading] = useState<'' | 'logo' | 'cover'>('');
  const [nameTaken, setNameTaken] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const set = (k: string) => (t: string) => setV((o) => ({ ...o, [k]: t }));

  const country = v.country ?? '';
  const code = countryByName(country)?.code;
  const regions = useMemo(() => regionsFor(code), [code]);
  const towns = useMemo(() => (region ? citiesFor(code, region) : []), [code, region]);
  const level = levelName(code);

  useEffect(() => {
    if (!shop || ready) return;
    setV({
      name: shop.name ?? '', country: countryByName(shop.country)?.name ?? 'Kenya', phone: shop.phone ?? '', whatsapp: shop.whatsapp ?? '',
      announcement: shop.announcement ?? '', building: shop.building ?? '', floor: shop.floor ?? '', unit: shop.unit ?? '',
      address: shop.address ?? '', landmark: shop.landmark ?? '', description: shop.description ?? '',
    });
    const code0 = countryByName(shop.country)?.code;
    const regs = regionsFor(code0);
    if (regs.length) {
      const r = shop.region && regs.includes(shop.region) ? shop.region : '';
      setRegion(r);
      const ts = r ? citiesFor(code0, r) : [];
      if (shop.city && ts.includes(shop.city)) setTown(shop.city); else if (shop.city) { setTown(OTHER); setTyped(shop.city); }
    } else setTyped(shop.city ?? '');
    setLogo(shop.logo_url ?? null); setCover(shop.cover_url ?? null);
    setReady(true);
  }, [shop, ready]);

  const header = <ScreenHeader title="Edit profile" />;
  if (!user) return <SafeAreaView style={styles.page}>{header}<View style={styles.body}><Empty title="Sign in first" action={{ title: 'Sign in', onPress: () => router.replace('/sign-in') }} /></View></SafeAreaView>;
  if (q.isPending || (shop && !ready)) return <SafeAreaView style={styles.page}>{header}<Loading /></SafeAreaView>;
  if (q.isError) return <SafeAreaView style={styles.page}>{header}<View style={styles.body}><ErrorState message={(q.error as Error).message} onRetry={() => q.refetch()} /></View></SafeAreaView>;
  if (!shop) return <SafeAreaView style={styles.page}>{header}<View style={styles.body}><Empty title="Profile not found" /></View></SafeAreaView>;

  const city = regions.length ? (town === OTHER ? typed : town) : typed;

  async function pick(kind: 'logo' | 'cover') {
    setMessage('');
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { setMessage('Allow access to your photos to add one.'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1, allowsEditing: true, aspect: kind === 'logo' ? [1, 1] : [16, 9] });
    if (res.canceled) return;
    const a = res.assets[0];
    setUploading(kind);
    try {
      const url = await uploadAdPhoto(user!.id, { uri: a.uri, width: a.width, height: a.height }, undefined, 'shop-media');
      if (kind === 'logo') setLogo(url); else setCover(url);
    } catch (e) { setMessage((e as Error).message || 'Upload failed.'); } finally { setUploading(''); }
  }

  async function save() {
    setMessage('');
    if (regions.length && !region) { setMessage(`Choose your ${level.one.toLowerCase()}.`); return; }
    if (v.name.trim() !== (shop.name ?? '').trim()) {
      const free = await nameAvailable(v.name.trim(), shop.id);
      if (free === false) { setNameTaken(true); return; }
    }
    // Fields the app does not edit yet go back exactly as they are, so nothing is lost.
    const parsed = parseShopForm(formOf({
      ...v, region: regions.length ? region : '', city,
      links: JSON.stringify(shopLinks(shop)), hours: JSON.stringify(cleanHours(shop.hours)),
      opening_hours: shop.opening_hours ?? '', lat: shop.lat != null ? String(shop.lat) : '', lng: shop.lng != null ? String(shop.lng) : '',
    }));
    if (!parsed.ok) { setMessage(parsed.error); return; }
    setBusy(true);
    try {
      await updateShop(shop.id, { ...parsed.values, logo_url: logo, cover_url: cover });
      await qc.invalidateQueries({ queryKey: ['my-shops', user!.id] });
      qc.invalidateQueries({ queryKey: ['shop', shop.slug] });
      router.back();
    } catch (e) { setMessage((e as Error).message || 'Update failed.'); } finally { setBusy(false); }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      {header}
      <KeyboardAvoidingView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View style={styles.images}>
            <View style={styles.imageCol}>
              <AppText variant="label">Logo</AppText>
              <Photo src={logo} thumb style={styles.logo} label="Logo" />
              <Button title={uploading === 'logo' ? 'Uploading…' : 'Change logo'} variant="outline" loading={uploading === 'logo'} onPress={() => pick('logo')} />
            </View>
            <View style={[styles.imageCol, styles.flex]}>
              <AppText variant="label">Cover</AppText>
              <Photo src={cover} thumb style={styles.cover} label="Cover" />
              <Button title={uploading === 'cover' ? 'Uploading…' : 'Change cover'} variant="outline" loading={uploading === 'cover'} onPress={() => pick('cover')} />
            </View>
          </View>
          <TextField label="Name *" value={v.name} onChangeText={(t) => { set('name')(t); setNameTaken(false); }} maxLength={100}
            error={nameTaken ? 'This name is already taken on Amcolink. Please choose another.' : null} />
          <PickerField label="Country *" value={country} options={COUNTRY_OPTIONS} onChange={(c) => { set('country')(c); setRegion(''); setTown(''); setTyped(''); }} />
          {regions.length ? (
            <>
              <PickerField label={`${level.one} *`} value={region} placeholder={`Choose ${level.one.toLowerCase()}…`} options={regions.map((r) => ({ value: r, label: r }))} onChange={(r) => { setRegion(r); setTown(''); }} />
              <PickerField label="City or town *" value={town} disabled={!region} placeholder="Choose city or town…"
                options={[...towns.map((t) => ({ value: t, label: t })), { value: OTHER, label: 'Other (type it)' }]} onChange={setTown} />
              {town === OTHER ? <TextField label="Your town or area *" value={typed} onChangeText={setTyped} maxLength={60} /> : null}
            </>
          ) : <TextField label="City or town *" value={typed} onChangeText={setTyped} maxLength={60} />}
          <TextField label="Phone" value={v.phone} onChangeText={set('phone')} keyboardType="phone-pad" maxLength={20} placeholder="0712 345 678" />
          <TextField label="WhatsApp" value={v.whatsapp} onChangeText={set('whatsapp')} keyboardType="phone-pad" maxLength={20} placeholder="0712 345 678" />
          <TextField label="Announcement (optional)" value={v.announcement} onChangeText={set('announcement')} maxLength={160}
            placeholder="e.g. Eid offer: 10% off all dresses until Friday" hint="Up to 160 characters, shown at the top of your page. Leave empty to remove it." />
          <AppText variant="heading">Where are you?</AppText>
          <TextField label="Building, mall or market (optional)" value={v.building} onChangeText={set('building')} maxLength={100} />
          <View style={styles.row}>
            <View style={styles.flex}><PickerField label="Floor" value={v.floor} options={v.floor && !FLOORS.includes(v.floor) ? [{ value: v.floor, label: v.floor }, ...FLOOR_OPTIONS] : FLOOR_OPTIONS} onChange={set('floor')} /></View>
            <View style={styles.flex}><TextField label="Shop / stall no." value={v.unit} onChangeText={set('unit')} maxLength={30} placeholder="e.g. B14" /></View>
          </View>
          <TextField label="Street or area" value={v.address} onChangeText={set('address')} maxLength={200} placeholder="e.g. Kebele 05, Taiwan area" />
          <TextField label="Directions / nearest landmark" value={v.landmark} onChangeText={set('landmark')} maxLength={300} multiline style={styles.multi} />
          <TextField label="Description" value={v.description} onChangeText={set('description')} maxLength={1500} multiline style={styles.multi} />
          <View style={styles.note}>
            <AppText variant="bodySmall">Opening hours, links and the map pin are edited on the website for now. They stay as they are when you save here.</AppText>
            <Button title="Open the website" variant="ghost" onPress={() => WebBrowser.openBrowserAsync(`${SITE_URL}/shops/${shop.slug}/edit`)} />
          </View>
          {message ? <AppText variant="bodySmall" tone="error" accessibilityRole="alert">{message}</AppText> : null}
          <Button title={busy ? 'Saving…' : 'Save'} size="lg" loading={busy} disabled={!!uploading} onPress={save} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  body: { padding: space.lg, gap: space.lg, paddingBottom: space.xxl * 2 },
  row: { flexDirection: 'row', gap: space.sm },
  images: { flexDirection: 'row', gap: space.md },
  imageCol: { gap: space.sm },
  logo: { width: 96, height: 96, borderRadius: radius.md },
  cover: { width: '100%', height: 96, borderRadius: radius.md },
  multi: { height: 96, textAlignVertical: 'top', paddingTop: space.sm },
  note: { gap: space.xs, padding: space.md, borderRadius: radius.md, backgroundColor: colors.greenTint },
});
