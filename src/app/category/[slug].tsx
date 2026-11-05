import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { AppText, Button } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ListingGrid } from '@/components/ListingGrid';
import { ChipRow } from '@/components/ChipRow';
import { SearchField } from '@/components/SearchField';
import { SaveSearchButton } from '@/components/SaveSearchButton';
import { FiltersButton, filterCount, filtersFromParams, type ListFilters } from '@/components/FiltersButton';
import { Empty } from '@/components/States';
import { fetchCategory, type CategoryFilters } from '@/api/listings';
import { categoryByName, categoryBySlug, needsCondition, oldSlug, SHARED_SUBS } from '@/core/categories';
import { useCountry } from '@/lib/countryPref';
import { colors, space } from '@/theme/tokens';

/** Sub-category chips with the shared ones (website rule): shared before "Other …", which always stays last. */
function withShared(category: string, subs: string[]) {
  const own = subs.map((s) => ({ value: s, label: s }));
  const shared = (SHARED_SUBS[category] ?? []).map((x) => ({ value: `shared:${x.category}|${x.sub}`, label: x.label }));
  const last = own.length && own[own.length - 1].label.startsWith('Other') ? own.length - 1 : own.length;
  return [...own.slice(0, last), ...shared, ...own.slice(last)];
}

const num = (t: string) => (t ? Number(t) : undefined);

const SORTS = [
  { value: '', label: 'Newest' },
  { value: 'price_asc', label: 'Lowest price' },
  { value: 'price_desc', label: 'Highest price' },
];

/** One category (website: app/category/[slug]). Sub-category chips, search inside the category, sorting. */
export default function CategoryScreen() {
  const { name: country } = useCountry();
  const params = useLocalSearchParams<{ slug: string; sub?: string; q?: string }>();
  const { slug, sub: subParam, q: qParam } = params;
  const old = oldSlug(String(slug)); // old website links still work, as on the website
  const cat = categoryBySlug(String(slug)) ?? categoryBySlug(old?.slug);
  const [sub, setSub] = useState(String(subParam ?? old?.sub ?? ''));
  const [q, setQ] = useState(String(qParam ?? ''));
  const [sort, setSort] = useState('');
  const [f, setF] = useState<ListFilters>(() => filtersFromParams(params));

  if (!cat) {
    return (
      <SafeAreaView style={styles.page}>
        <ScreenHeader />
        <View style={styles.pad}><Empty title="Category not found" action={{ title: 'Back to Home', onPress: () => router.replace('/') }} /></View>
      </SafeAreaView>
    );
  }

  const filters: CategoryFilters = {
    category: cat.name, sub: sub || undefined, q: q || undefined, sort: (sort || undefined) as CategoryFilters['sort'],
    city: f.city || undefined, min: num(f.min), max: num(f.max), condition: f.condition || undefined, verified: f.verified || undefined,
  };
  const header = (
    <View style={styles.header}>
      <AppText variant="bodySmall" tone="secondary">{cat.blurb}</AppText>
      <SearchField initial={q} placeholder={`Search ${cat.short.toLowerCase()}…`} onSubmit={setQ} label={`Search in ${cat.label}`} />
      {cat.subs.length ? (
        <ChipRow
          options={[{ value: '', label: 'All' }, ...withShared(cat.name, cat.subs)]}
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
      {cat.slug === 'services' ? <Button title="Browse providers" variant="outline" onPress={() => router.push({ pathname: '/profiles', params: { kind: 'service' } })} /> : null}
      <ChipRow options={SORTS} value={sort} onChange={setSort} />
      <FiltersButton value={f} onChange={setF} showCondition={needsCondition(cat.name, sub)} />
      {sub || q || filterCount(f) ? (
        <SaveSearchButton key={`${sub}|${q}|${JSON.stringify(f)}`} params={{ category: cat.name, sub, q, city: f.city, min: f.min, max: f.max, condition: f.condition, verified: f.verified ? '1' : '' }} />
      ) : null}
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
