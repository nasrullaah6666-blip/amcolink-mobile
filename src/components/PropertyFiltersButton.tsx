import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText, Button, Chip, TextField } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { FURNISHED, PERIODS, type Deal } from '@/core/rentals';
import { ROLES } from '@/core/property';
import { colors, space } from '@/theme/tokens';

/** Website: components/PropertyMarket.tsx filters — bedrooms, furnished, rent period, owner/agent, price range. */
export type PropFilters = { beds: string; furnished: string; period: string; by: string; min: string; max: string };
export const NO_PROP_FILTERS: PropFilters = { beds: '', furnished: '', period: '', by: '', min: '', max: '' };
export const BEDS = [
  { value: '', label: 'Any' }, { value: '0', label: 'Studio' }, { value: '1', label: '1' },
  { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4+' },
];
export const propFilterCount = (f: PropFilters) => [f.beds, f.furnished, f.by, f.min || f.max, f.period].filter(Boolean).length;
const digits = (t: string) => t.replace(/[^\d]/g, '').slice(0, 9);

export function PropertyFiltersButton({ deal, value, onChange }: { deal: Deal; value: PropFilters; onChange: (f: PropFilters) => void }) {
  const [open, setOpen] = useState(false);
  const [d, setD] = useState<PropFilters>(value);
  const rent = deal === 'rent';
  const n = propFilterCount(value);
  const wrong = !!d.min && !!d.max && Number(d.min) > Number(d.max);
  const chips = (list: readonly { value: string; label: string }[], key: keyof PropFilters) => (
    <View style={styles.chips}>
      {[{ value: '', label: 'Any' }, ...list.filter((x) => x.value !== '')].map((x) => (
        <Chip key={x.value || 'any'} label={x.label} selected={d[key] === x.value} onPress={() => setD({ ...d, [key]: x.value })} />
      ))}
    </View>
  );
  return (
    <>
      <Button title={n ? `Filters (${n})` : 'Filters'} variant="outline" onPress={() => { setD(value); setOpen(true); }} />
      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={styles.page}>
          <ScreenHeader title="Filters" onBack={() => setOpen(false)} />
          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            <AppText variant="label">Bedrooms</AppText>
            {chips(BEDS, 'beds')}
            <AppText variant="label">Furnished</AppText>
            {chips(FURNISHED, 'furnished')}
            {rent ? <><AppText variant="label">Rent is paid</AppText>{chips(PERIODS, 'period')}</> : null}
            {rent ? <><AppText variant="label">Listed by</AppText>{chips(ROLES.map((r) => ({ value: r.value, label: r.short })), 'by')}</> : null}
            <AppText variant="label">{rent ? 'Rent' : 'Price'}</AppText>
            <View style={styles.row}>
              <View style={styles.flex}><TextField label="From" value={d.min} onChangeText={(t) => setD({ ...d, min: digits(t) })} keyboardType="number-pad" placeholder="0" /></View>
              <View style={styles.flex}><TextField label="To" value={d.max} onChangeText={(t) => setD({ ...d, max: digits(t) })} keyboardType="number-pad" placeholder="Any" /></View>
            </View>
            {wrong ? <AppText variant="bodySmall" tone="error">“From” is higher than “To”.</AppText> : null}
          </ScrollView>
          <View style={styles.foot}>
            <Button style={styles.flex} title="Clear" variant="outline" onPress={() => { onChange(NO_PROP_FILTERS); setOpen(false); }} />
            <Button style={styles.flex} title="Show places" disabled={wrong} onPress={() => { onChange(d); setOpen(false); }} />
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  body: { padding: space.lg, gap: space.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  row: { flexDirection: 'row', gap: space.sm },
  flex: { flex: 1 },
  foot: { flexDirection: 'row', gap: space.sm, padding: space.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
});
