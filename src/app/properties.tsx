import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ListingGrid } from '@/components/ListingGrid';
import { ChipRow } from '@/components/ChipRow';
import { SearchField } from '@/components/SearchField';
import { fetchProperties } from '@/api/listings';
import { DEALS, RENTAL_SAFETY, SALE_SAFETY, typesFor, type Deal } from '@/core/rentals';
import { colors, radius, space } from '@/theme/tokens';

/** Property for rent or for sale (website: /properties, components/PropertyMarket.tsx). */
export default function PropertiesScreen() {
  const [deal, setDeal] = useState<Deal>('rent');
  const [type, setType] = useState('');
  const [area, setArea] = useState('');
  const types = typesFor(deal);
  const header = (
    <View style={styles.header}>
      <ChipRow options={DEALS.map((d) => ({ value: d.value, label: d.label }))} value={deal} onChange={(v) => { setDeal(v as Deal); setType(''); }} />
      <SearchField placeholder="Area, e.g. Mogadishu Hodan" label="Search by area" onSubmit={setArea} />
      <ChipRow options={[{ value: '', label: 'All types' }, ...types.map((t) => ({ value: t.value, label: t.label }))]} value={type} onChange={setType} />
      <View style={styles.safety}><AppText variant="bodySmall" style={styles.safetyText}>{deal === 'sale' ? SALE_SAFETY : RENTAL_SAFETY}</AppText></View>
    </View>
  );
  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <ScreenHeader title="Property" />
      <ListingGrid
        queryKey={['properties', deal, type, area]}
        load={(page) => fetchProperties({ deal, type: type || undefined, area: area || undefined, page })}
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
  safety: { padding: space.md, borderRadius: radius.md, backgroundColor: colors.greenTint },
  safetyText: { color: colors.greenPressed },
});
