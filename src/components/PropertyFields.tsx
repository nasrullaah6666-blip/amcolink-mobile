import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, Chip, TextField } from '@/components/ui';
import { PickerField } from '@/components/PickerField';
import { AGENT_FEES, FURNISHED, INCLUDES, PERIODS, typesFor, type Deal } from '@/core/rentals';
import type { PropertyDraft } from '@/api/postAd';
import { space } from '@/theme/tokens';

const BEDS = [{ value: '0', label: 'Studio / no separate bedroom' }, ...Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))];
const BATHS = [{ value: '', label: 'Not stated' }, ...Array.from({ length: 6 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))];
const DEPOSIT = [{ value: '', label: 'Not stated' }, { value: '0', label: 'No deposit' }, ...[1, 2, 3, 4, 6, 12].map((n) => ({ value: String(n), label: `${n} month${n > 1 ? 's' : ''} rent` }))];

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={styles.group}><AppText variant="label">{title}</AppText><View style={styles.chips}>{children}</View></View>;
}

/** Property details (website: components/PropertyFields.tsx) — same fields, options and wording. */
export function PropertyFields({ deal, agent, value, onChange }: { deal: Deal; agent: boolean; value: PropertyDraft; onChange: (v: PropertyDraft) => void }) {
  const sale = deal === 'sale';
  const type = value.r_type ?? '';
  const land = type === 'land';
  const commercial = type === 'commercial';
  const set = (k: string) => (v: string) => onChange({ ...value, [k]: v });
  const includes = (value.r_includes_list ?? '').split(',').filter(Boolean);
  const toggleInclude = (v: string) => set('r_includes_list')((includes.includes(v) ? includes.filter((x) => x !== v) : [...includes, v]).join(','));
  return (
    <View style={styles.wrap}>
      <TextField label={`Area / estate of this ${sale ? 'property' : 'house'} *`} value={value.r_area ?? ''} onChangeText={set('r_area')} maxLength={60} placeholder="e.g. Kilimani, Bole, 26 June" />
      <PickerField label={`Type of ${sale ? 'property' : 'place'} *`} value={type} placeholder="Choose" options={typesFor(deal).map((x) => ({ value: x.value, label: x.label }))} onChange={set('r_type')} />
      {sale ? <TextField label={`Size in m²${land ? ' *' : ' (optional)'}`} value={value.r_size_sqm ?? ''} onChangeText={set('r_size_sqm')} keyboardType="number-pad" maxLength={8} placeholder="e.g. 450" /> : null}
      {!sale ? <Group title="Rent is paid *">{PERIODS.map((p) => <Chip key={p.value} label={p.label} selected={(value.r_period ?? 'month') === p.value} onPress={() => set('r_period')(p.value)} />)}</Group> : null}
      {!land ? (
        <>
          <PickerField label={`Bedrooms${commercial ? ' (optional)' : ' *'}`} value={value.r_bedrooms ?? ''} placeholder={commercial ? 'Not applicable' : 'Choose'}
            options={commercial ? [{ value: '', label: 'Not applicable' }, ...BEDS] : BEDS} onChange={set('r_bedrooms')} />
          <PickerField label="Bathrooms" value={value.r_bathrooms ?? ''} options={BATHS} onChange={set('r_bathrooms')} />
          <Group title={`Furnished?${sale ? ' (optional)' : ' *'}`}>{FURNISHED.map((f) => <Chip key={f.value} label={f.label} selected={value.r_furnished === f.value} onPress={() => set('r_furnished')(f.value)} />)}</Group>
        </>
      ) : null}
      {!sale ? (
        <>
          <PickerField label="Deposit" value={value.r_deposit_months ?? ''} options={DEPOSIT} onChange={set('r_deposit_months')} />
          {agent ? <Group title="Agent fee (what you charge the tenant)">{AGENT_FEES.map((f) => <Chip key={f.value} label={f.label} selected={(value.r_agent_fee ?? 'none') === f.value} onPress={() => set('r_agent_fee')(f.value)} />)}</Group> : null}
          <TextField label="Available from (optional)" value={value.r_available_from ?? ''} onChangeText={set('r_available_from')} maxLength={10} placeholder="Year-month-day, e.g. 2026-12-01" />
          <Group title="Included in the rent">{INCLUDES.map((x) => <Chip key={x.value} label={x.label} selected={includes.includes(x.value)} onPress={() => toggleInclude(x.value)} />)}</Group>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.lg },
  group: { gap: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});
