import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ListingGrid } from '@/components/ListingGrid';
import { SearchField } from '@/components/SearchField';
import { SaveSearchButton } from '@/components/SaveSearchButton';
import { FiltersButton, filtersFromParams, type ListFilters } from '@/components/FiltersButton';
import { Empty } from '@/components/States';
import { fetchSearch } from '@/api/listings';
import { useCountry } from '@/lib/countryPref';
import { colors, space } from '@/theme/tokens';

const num = (t: string) => (t ? Number(t) : undefined);

/** Search every category (same word rules and ranking as the website's search). */
export default function SearchScreen() {
  const { name: country } = useCountry();
  const params = useLocalSearchParams<{ q?: string }>();
  const [q, setQ] = useState(String(params.q ?? ''));
  const [f, setF] = useState<ListFilters>(() => filtersFromParams(params));
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.page}>
      <ScreenHeader title="Search" />
      <View style={styles.box}><SearchField initial={q} onSubmit={setQ} /></View>
      {q ? (
        <ListingGrid
          header={<View style={styles.save}>
            <FiltersButton value={f} onChange={setF} />
            <SaveSearchButton key={`${q}|${JSON.stringify(f)}`} params={{ q, city: f.city, min: f.min, max: f.max, condition: f.condition, verified: f.verified ? '1' : '' }} />
          </View>}
          queryKey={['search', q, f, country ?? 'ALL']}
          load={(page) => fetchSearch(q, { page, country: country ?? undefined, city: f.city || undefined, min: num(f.min), max: num(f.max), condition: f.condition || undefined, verified: f.verified || undefined })}
          emptyTitle={`No results for "${q}"`}
          emptyHint="Try fewer or different words."
        />
      ) : (
        <View style={styles.box}><Empty title="What are you looking for?" hint="Type a word like phone, sofa or plumber." /></View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  box: { paddingHorizontal: space.lg, paddingBottom: space.md },
  save: { paddingBottom: space.md, gap: space.sm },
});
