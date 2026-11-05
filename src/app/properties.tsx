import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ListingGrid } from '@/components/ListingGrid';
import { ChipRow } from '@/components/ChipRow';
import { SearchField } from '@/components/SearchField';
import { NO_PROP_FILTERS, PropertyFiltersButton, type PropFilters } from '@/components/PropertyFiltersButton';
import { RentalAlertButton } from '@/components/RentalAlertButton';
import { fetchProperties } from '@/api/listings';
import { DEALS, furnishedLabel, RENTAL_SAFETY, SALE_SAFETY, typeLabel, typesFor, type Deal } from '@/core/rentals';
import { useCountry } from '@/lib/countryPref';
import { colors, radius, space } from '@/theme/tokens';

const num = (t: string) => (t ? Number(t) : undefined);

/** Property for rent or for sale (website: /properties, components/PropertyMarket.tsx). */
export default function PropertiesScreen() {
  const { name: country } = useCountry();
  const [deal, setDeal] = useState<Deal>('rent');
  const [type, setType] = useState('');
  const [area, setArea] = useState('');
  const [f, setF] = useState<PropFilters>(NO_PROP_FILTERS);
  const types = typesFor(deal);
  const sale = deal === 'sale';
  const fx = sale ? { ...f, period: '', by: '' } : f;

  // Website "Alert me": same query keys and the same label as PropertyMarket.
  const params: Record<string, string> = { area, type, period: fx.period, furnished: fx.furnished, beds: fx.beds, min: fx.min, max: fx.max, by: fx.by };
  const alertQuery: Record<string, string> = { page: 'rentals', ...(sale ? { deal: 'sale' } : {}), ...Object.fromEntries(Object.entries(params).filter(([, v]) => v)) };
  const alertLabel = [sale ? 'For sale' : 'Rentals', fx.beds ? (fx.beds === '0' ? 'studio' : `${fx.beds}${fx.beds === '4' ? '+' : ''} bd`) : '', type ? typeLabel(type).toLowerCase() : '', area,
    fx.furnished ? furnishedLabel(fx.furnished).toLowerCase() : '', fx.by === 'owner' ? 'owner only' : '', fx.max ? `under ${Number(fx.max).toLocaleString()}` : '', fx.min ? `from ${Number(fx.min).toLocaleString()}` : '']
    .filter(Boolean).join(' · ');

  const header = (
    <View style={styles.header}>
      <ChipRow options={DEALS.map((d) => ({ value: d.value, label: d.label }))} value={deal} onChange={(v) => { setDeal(v as Deal); setType(''); }} />
      <SearchField placeholder="Area, e.g. Mogadishu Hodan" label="Search by area" onSubmit={setArea} />
      <ChipRow options={[{ value: '', label: 'All types' }, ...types.map((t) => ({ value: t.value, label: t.label }))]} value={type} onChange={setType} />
      <View style={styles.row}>
        <View style={styles.flex}><PropertyFiltersButton deal={deal} value={f} onChange={setF} /></View>
        <View style={styles.flex}><RentalAlertButton key={JSON.stringify(alertQuery)} label={alertLabel} query={alertQuery} /></View>
      </View>
      <View style={styles.safety}><AppText variant="bodySmall" style={styles.safetyText}>{sale ? SALE_SAFETY : RENTAL_SAFETY}</AppText></View>
    </View>
  );
  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <ScreenHeader title="Property" />
      <ListingGrid
        queryKey={['properties', deal, type, area, fx, country ?? 'ALL']}
        load={(page) => fetchProperties({
          deal, type: type || undefined, area: area || undefined, country: country ?? undefined, page,
          period: fx.period || undefined, furnished: fx.furnished || undefined, by: fx.by || undefined, beds: fx.beds || undefined, min: num(fx.min), max: num(fx.max),
        })}
        header={header}
        emptyTitle={deal === 'rent' ? 'No places for rent yet' : 'No property for sale yet'}
        emptyHint={area ? 'Try another area.' : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  header: { gap: space.md, paddingBottom: space.md },
  row: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  flex: { flex: 1, gap: space.xs },
  safety: { padding: space.md, borderRadius: radius.md, backgroundColor: colors.greenTint },
  safetyText: { color: colors.greenPressed },
});
