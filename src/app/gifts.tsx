import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ListingGrid } from '@/components/ListingGrid';
import { ChipRow } from '@/components/ChipRow';
import { fetchGifts } from '@/api/listings';
import { GIFT_FOR, GIFT_OCCASIONS } from '@/core/gifts';
import { useCountry } from '@/lib/countryPref';
import { colors, space } from '@/theme/tokens';

const SORTS = [{ value: '', label: 'Newest' }, { value: 'price_asc', label: 'Lowest price' }, { value: 'price_desc', label: 'Highest price' }];

/** Gifts (website: app/gifts): gift ideas from local shops, by occasion and by who it is for. */
export default function GiftsScreen() {
  const { name: country } = useCountry();
  const [occasion, setOccasion] = useState('');
  const [forWho, setForWho] = useState('');
  const [sort, setSort] = useState('');
  const header = (
    <View style={styles.head}>
      <AppText variant="bodySmall" tone="secondary">Gifts for Eid, weddings, birthdays and new babies from shops near you.</AppText>
      <ChipRow options={[{ value: '', label: 'All' }, ...GIFT_OCCASIONS.map((o) => ({ value: o.value, label: o.label }))]} value={occasion} onChange={setOccasion} />
      <ChipRow options={[{ value: '', label: 'Everyone' }, ...GIFT_FOR.filter((g) => g.value !== 'anyone').map((g) => ({ value: g.value, label: g.label }))]} value={forWho} onChange={setForWho} />
      <ChipRow options={SORTS} value={sort} onChange={setSort} />
    </View>
  );
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.page}>
      <ScreenHeader title="Gifts" />
      <ListingGrid
        queryKey={['gifts', occasion, forWho, sort, country ?? 'ALL']}
        load={(page) => fetchGifts({ occasion: occasion || undefined, forWho: forWho || undefined, sort: (sort || undefined) as 'price_asc' | 'price_desc' | undefined, country: country ?? undefined, page })}
        header={header}
        emptyTitle="No gifts here yet"
        emptyHint="Sellers tag their items as gifts when they post them."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  head: { gap: space.md, paddingBottom: space.md },
});
