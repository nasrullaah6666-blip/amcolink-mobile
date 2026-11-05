import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText, Button, Chip, TextField } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { CONDITIONS } from '@/core/conditions';
import { colors, radius, space } from '@/theme/tokens';

/** The website's search filters (components/SearchFilters.tsx): town, price range, condition, verified sellers only. */
export type ListFilters = { city: string; min: string; max: string; condition: string; verified: boolean };
export const NO_FILTERS: ListFilters = { city: '', min: '', max: '', condition: '', verified: false };
export const filterCount = (f: ListFilters) => [f.city, f.min || f.max, f.condition, f.verified].filter(Boolean).length;
const digits = (t: string) => t.replace(/[^\d]/g, '').slice(0, 12);

/** Filters from screen parameters (a saved search opens with its filters). */
export function filtersFromParams(p: Record<string, string | string[] | undefined>): ListFilters {
  const one = (k: string) => String((Array.isArray(p[k]) ? p[k]![0] : p[k]) ?? '');
  return { city: one('city').slice(0, 60), min: digits(one('min')), max: digits(one('max')), condition: CONDITIONS.some((c) => c.value === one('condition')) ? one('condition') : '', verified: one('verified') === '1' };
}

export function FiltersButton({ value, onChange, showCondition = true }: { value: ListFilters; onChange: (f: ListFilters) => void; showCondition?: boolean }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ListFilters>(value);
  const n = filterCount(value);
  const wrongRange = !!draft.min && !!draft.max && Number(draft.min) > Number(draft.max);
  return (
    <>
      <Button title={n ? `Filters (${n})` : 'Filters'} variant="outline" onPress={() => { setDraft(value); setOpen(true); }} />
      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={styles.page}>
          <ScreenHeader title="Filters" onBack={() => setOpen(false)} />
          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            <TextField label="Town" value={draft.city} onChangeText={(t) => setDraft({ ...draft, city: t })} placeholder="e.g. Nairobi" maxLength={60} />
            <AppText variant="label">Price</AppText>
            <View style={styles.row}>
              <View style={styles.flex}><TextField label="From" value={draft.min} onChangeText={(t) => setDraft({ ...draft, min: digits(t) })} keyboardType="number-pad" placeholder="0" /></View>
              <View style={styles.flex}><TextField label="To" value={draft.max} onChangeText={(t) => setDraft({ ...draft, max: digits(t) })} keyboardType="number-pad" placeholder="Any" /></View>
            </View>
            {wrongRange ? <AppText variant="bodySmall" tone="error">“From” is higher than “To”.</AppText> : null}
            {showCondition ? (
              <>
                <AppText variant="label">Condition</AppText>
                <View style={styles.chips}>
                  <Chip label="Any" selected={!draft.condition} onPress={() => setDraft({ ...draft, condition: '' })} />
                  {CONDITIONS.map((c) => <Chip key={c.value} label={c.label} selected={draft.condition === c.value} onPress={() => setDraft({ ...draft, condition: c.value })} />)}
                </View>
              </>
            ) : null}
            <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: draft.verified }} onPress={() => setDraft({ ...draft, verified: !draft.verified })} style={styles.tick}>
              <View style={[styles.box, draft.verified && styles.boxOn]}>{draft.verified ? <AppText variant="label" tone="onGreen">✓</AppText> : null}</View>
              <AppText variant="label">Verified sellers only</AppText>
            </Pressable>
          </ScrollView>
          <View style={styles.foot}>
            <Button style={styles.flex} title="Clear" variant="outline" onPress={() => { onChange(NO_FILTERS); setOpen(false); }} />
            <Button style={styles.flex} title="Show results" disabled={wrongRange} onPress={() => { onChange({ ...draft, city: draft.city.trim() }); setOpen(false); }} />
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  body: { padding: space.lg, gap: space.md },
  row: { flexDirection: 'row', gap: space.sm },
  flex: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  tick: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 48 },
  box: { width: 24, height: 24, borderRadius: 6, borderWidth: 1.5, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: colors.green, borderColor: colors.green },
  foot: { flexDirection: 'row', gap: space.sm, padding: space.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
});
