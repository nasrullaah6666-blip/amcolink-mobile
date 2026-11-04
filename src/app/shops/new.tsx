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
import { createShop, nameAvailable } from '@/api/seller';
import { formOf, parseShopForm } from '@/core/shop';
import { countryByName, FEATURED_COUNTRIES, OTHER_COUNTRIES } from '@/core/geo';
import { citiesFor, levelName, regionsFor } from '@/core/places';
import { colors, radius, space } from '@/theme/tokens';

const OTHER = '__other__';
const COUNTRY_OPTIONS = [...FEATURED_COUNTRIES, ...OTHER_COUNTRIES].map((c) => ({ value: c.name, label: c.name }));

/**
 * Create a seller profile (website: components/ShopForm.tsx). Only what buyers need to find and contact you:
 * name, country, region and town, one WhatsApp/phone number. Logo, address and hours come later in Edit profile.
 */
export default function NewShop() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [nameState, setNameState] = useState<'' | 'checking' | 'free' | 'taken'>('');
  const [country, setCountry] = useState('Kenya');
  const [region, setRegion] = useState('');
  const [town, setTown] = useState('');
  const [typed, setTyped] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const code = countryByName(country)?.code;
  const regions = useMemo(() => regionsFor(code), [code]);
  const towns = useMemo(() => (region ? citiesFor(code, region) : []), [code, region]);
  const level = levelName(code);
  const city = regions.length ? (town === OTHER ? typed.trim() : town) : typed.trim();

  if (!user) {
    return (
      <SafeAreaView style={styles.page}><ScreenHeader />
        <View style={styles.body}><Empty title="Sign in to start selling" action={{ title: 'Sign in', onPress: () => router.replace('/sign-in') }} /></View>
      </SafeAreaView>
    );
  }

  async function checkName() {
    const n = name.trim();
    if (n.length < 2) { setNameState(''); return; }
    setNameState('checking');
    const free = await nameAvailable(n);
    setNameState(free === null ? '' : free ? 'free' : 'taken');
  }

  async function submit() {
    setMessage('');
    if (regions.length && !region) { setMessage(`Choose your ${level.one.toLowerCase()}.`); return; }
    // One number: buyers can call it and message it on WhatsApp (it can be split later in Edit profile).
    const parsed = parseShopForm(formOf({ name, country, region, city, whatsapp, phone: whatsapp }));
    if (!parsed.ok) { setMessage(parsed.error); return; }
    setBusy(true);
    try {
      await createShop(user!.id, parsed.values);
      await qc.invalidateQueries({ queryKey: ['my-shops', user!.id] });
      router.replace('/dashboard');
    } catch (e) {
      setMessage((e as Error).message || 'Could not create your profile.');
    } finally { setBusy(false); }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <ScreenHeader title="Start selling" />
      <KeyboardAvoidingView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <AppText variant="bodySmall" tone="secondary">One profile for Shopping, Services and Properties. You choose what to post each time. It&apos;s free.</AppText>
          <View style={styles.card}>
            <TextField label="Your name or business name *" value={name} maxLength={100} placeholder="e.g. Amina Fashion, Juma Plumbing"
              onChangeText={(t) => { setName(t); if (nameState) setNameState(''); }} onBlur={checkName}
              error={nameState === 'taken' ? 'This name is already taken on Amcolink. Please choose another.' : null}
              hint={nameState === 'checking' ? 'Checking the name…' : nameState === 'free' ? '✓ This name is free' : undefined} />
            <PickerField label="Country *" value={country} options={COUNTRY_OPTIONS} onChange={(v) => { setCountry(v); setRegion(''); setTown(''); setTyped(''); }} />
            {regions.length ? (
              <>
                <PickerField label={`${level.one} *`} value={region} placeholder={`Choose ${level.one.toLowerCase()}…`}
                  options={regions.map((r) => ({ value: r, label: r }))} onChange={(v) => { setRegion(v); setTown(''); setTyped(''); }} />
                <PickerField label="City or town *" value={town} disabled={!region} placeholder={region ? 'Choose city or town…' : `Choose a ${level.one.toLowerCase()} first`}
                  options={[...towns.map((t) => ({ value: t, label: t })), { value: OTHER, label: 'Other (type it)' }]} onChange={setTown} />
                {town === OTHER ? <TextField label="Your town or area *" value={typed} onChangeText={setTyped} maxLength={60} placeholder="Type your town or area" /> : null}
              </>
            ) : (
              <TextField label="City or town *" value={typed} onChangeText={setTyped} maxLength={60} placeholder="Type your city or town" />
            )}
            <TextField label="WhatsApp or phone number *" value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" autoComplete="tel" maxLength={20}
              placeholder="0712 345 678" hint="Buyers call or WhatsApp you on this number. Type it the way you normally do; we add the country code." />
            {message ? <AppText variant="bodySmall" tone="error" accessibilityRole="alert">{message}</AppText> : null}
            <Button title={busy ? 'Saving…' : 'Create profile'} size="lg" loading={busy} onPress={submit} disabled={nameState === 'taken'} />
            <AppText variant="caption" tone="secondary">You can add a logo, address, opening hours and links any time in Edit profile.</AppText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  body: { padding: space.lg, gap: space.md, paddingBottom: space.xxl * 2 },
  card: { gap: space.lg, padding: space.lg, borderRadius: radius.tile, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
});
