import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { AppText, Button, TextField } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PickerField } from '@/components/PickerField';
import { Empty } from '@/components/States';
import { useAuth } from '@/auth/session';
import { buildWanted, insertWanted } from '@/api/wanted';
import { countryByName, currencyForCountry, FEATURED_COUNTRIES, OTHER_COUNTRIES } from '@/core/geo';
import { citiesFor, levelName, regionsFor } from '@/core/places';
import { CURRENCIES, currencyLabel } from '@/core/listing';
import { CATEGORIES } from '@/core/types';
import { colors, radius, space } from '@/theme/tokens';

const OTHER = '__other__';
const COUNTRY_OPTIONS = [...FEATURED_COUNTRIES, ...OTHER_COUNTRIES].map((c) => ({ value: c.name, label: c.name }));
const CATEGORY_OPTIONS = CATEGORIES.filter((c) => c !== 'All').map((c) => ({ value: c, label: c }));
const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({ value: c, label: currencyLabel(c) }));

/** Post a Wanted request (website: components/WantedForm.tsx). */
export default function NewWanted() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Other');
  const [budget, setBudget] = useState('');
  const [country, setCountry] = useState('Kenya');
  const [currency, setCurrency] = useState(currencyForCountry('Kenya'));
  const [region, setRegion] = useState('');
  const [town, setTown] = useState('');
  const [typed, setTyped] = useState('');
  const [details, setDetails] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const code = countryByName(country)?.code;
  const regions = useMemo(() => regionsFor(code), [code]);
  const towns = useMemo(() => (region ? citiesFor(code, region) : []), [code, region]);
  const level = levelName(code);
  const city = regions.length ? (town === OTHER ? typed : town) : typed;

  if (!user) return <SafeAreaView style={styles.page}><ScreenHeader /><View style={styles.body}><Empty title="Sign in to post a request" action={{ title: 'Sign in', onPress: () => router.replace('/sign-in') }} /></View></SafeAreaView>;

  async function submit() {
    setMessage('');
    const built = buildWanted({ title, details, category, budget, currency, country, city, whatsapp }, user!.id);
    if (!built.ok) { setMessage(built.error); return; }
    setBusy(true);
    try {
      await insertWanted(built.row);
      await qc.invalidateQueries({ queryKey: ['wanted'] });
      router.replace('/wanted');
    } catch (e) { setMessage((e as Error).message || 'Could not post. Please try again.'); } finally { setBusy(false); }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <ScreenHeader title="Post what you need" />
      <KeyboardAvoidingView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <TextField label="What are you looking for? *" value={title} onChangeText={setTitle} maxLength={100} placeholder="e.g. Used fridge, working, 2 doors" />
            <PickerField label="Category" value={category} options={CATEGORY_OPTIONS} onChange={setCategory} />
            <TextField label="Budget (optional)" value={budget} onChangeText={setBudget} keyboardType="number-pad" placeholder="Up to…" />
            <PickerField label="Currency" value={currency} options={CURRENCY_OPTIONS} onChange={setCurrency} />
            <PickerField label="Country *" value={country} options={COUNTRY_OPTIONS} onChange={(v) => { setCountry(v); setCurrency(currencyForCountry(v)); setRegion(''); setTown(''); setTyped(''); }} />
            {regions.length ? (
              <>
                <PickerField label={`${level.one} *`} value={region} placeholder={`Choose ${level.one.toLowerCase()}…`} options={regions.map((r) => ({ value: r, label: r }))} onChange={(v) => { setRegion(v); setTown(''); }} />
                <PickerField label="City or town *" value={town} disabled={!region} placeholder={region ? 'Choose city or town…' : `Choose a ${level.one.toLowerCase()} first`}
                  options={[...towns.map((t) => ({ value: t, label: t })), { value: OTHER, label: 'Other (type it)' }]} onChange={setTown} />
                {town === OTHER ? <TextField label="Your town or area *" value={typed} onChangeText={setTyped} maxLength={60} /> : null}
              </>
            ) : <TextField label="City or town *" value={typed} onChangeText={setTyped} maxLength={60} />}
            <TextField label="Details" value={details} onChangeText={setDetails} maxLength={1000} multiline style={styles.multi} placeholder="Size, colour, condition, when you need it…" />
            <TextField label="Your WhatsApp number *" value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" maxLength={20} placeholder="0712 345 678"
              hint="Sellers who have it will message you here. Only signed-in members can see your number." />
            <View style={styles.note}><AppText variant="bodySmall">Never pay before you see the item. Your request stays up for 30 days, or until you mark it as found.</AppText></View>
            {message ? <AppText variant="bodySmall" tone="error" accessibilityRole="alert">{message}</AppText> : null}
            <Button title={busy ? 'Posting…' : 'Post my request'} size="lg" loading={busy} onPress={submit} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  body: { padding: space.lg, paddingBottom: space.xxl * 2 },
  card: { gap: space.lg, padding: space.lg, borderRadius: radius.tile, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  multi: { height: 100, textAlignVertical: 'top', paddingTop: space.sm },
  note: { padding: space.md, borderRadius: radius.md, backgroundColor: colors.greenTint },
});
