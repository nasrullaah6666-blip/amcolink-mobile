import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { AppText } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ListingGrid } from '@/components/ListingGrid';
import { ChipRow } from '@/components/ChipRow';
import { SearchField } from '@/components/SearchField';
import { SaveSearchButton } from '@/components/SaveSearchButton';
import { Empty } from '@/components/States';
import { fetchCategory, type CategoryFilters } from '@/api/listings';
import { categoryByName, categoryBySlug, oldSlug, SHARED_SUBS } from '@/core/categories';
import { useCountry } from '@/lib/countryPref';
import { colors, space } from '@/theme/tokens';

const SORTS = [
  { value: '', label: 'Newest' },
  { value: 'price_asc', label: 'Lowest price' },
  { value: 'price_desc', label: 'Highest price' },
];

/** One category (website: app/category/[slug]). Sub-category chips, search inside the category, sorting. */
export default function CategoryScreen() {
  const { name: country } = useCountry();
  const { slug, sub: subParam, q: qParam } = useLocalSearchParams<{ slug: string; sub?: string; q?: string }>();
  const old = oldSlug(String(slug)); // old website links still work, as on the website
  const cat = categoryBySlug(String(slug)) ?? categoryBySlug(old?.slug);
  const [sub, setSub] = useState(String(subParam ?? old?.sub ?? ''));
  const [q, setQ] = useState(String(qParam ?? ''));
  const [sort, setSort] = useState('');

  if (!cat) {
    return (
      <SafeAreaView style={styles.page}>
        <ScreenHeader />
        <View style={styles.pad}><Empty title="Category not found" action={{ title: 'Back to Home', onPress: () => router.replace('/') }} /></View>
      </SafeAreaView>
    );
  }

  const filters: CategoryFilters = { category: cat.name, sub: sub || undefined, q: q || undefined, sort: (sort || undefined) as CategoryFilters['sort'] };
  const header = (
    <View style={styles.header}>
      <AppText variant="bodySmall" tone="secondary">{cat.blurb}</AppText>
      <SearchField initial={q} placeholder={`Search ${cat.short.toLowerCase()}…`} onSubmit={setQ} label={`Search in ${cat.label}`} />
      {cat.subs.length ? (
        <ChipRow
          options={[{ value: '', label: 'All' }, ...cat.subs.map((s) => ({ value: s, label: s })), ...(SHARED_SUBS[cat.name] ?? []).map((x) => ({ value: `shared:${x.category}|${x.sub}`, label: x.label }))]}
          value={sub}
          onChange={(v) => {
            // A shared tile lives in another category (website rule): open that category on that sub-category.
            if (v.startsWith('shared:')) {
              const [category, s] = v.slice(7).split('|');
              const target = categoryByName(category);
              if (target) router.push({ pathname: '/category/[slug]', params: { slug: target.slug, sub: s } });
              return;
            }
            setSub(v);
          }}
        />
      ) : null}
      <ChipRow options={SORTS} value={sort} onChange={setSort} />
      {sub || q ? <SaveSearchButton key={`${sub}|${q}`} params={{ category: cat.name, sub, q }} /> : null}
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <ScreenHeader title={cat.label} />
      <ListingGrid
        queryKey={['category', filters, country ?? 'ALL']}
        load={(page) => fetchCategory({ ...filters, country: country ?? undefined, page })}
        header={header}
        emptyTitle="Nothing here yet"
        emptyHint={q ? 'Try fewer or different words.' : 'New ads appear here as sellers post them.'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  pad: { padding: space.lg },
  header: { gap: space.md, paddingBottom: space.md },
});
