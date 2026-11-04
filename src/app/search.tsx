import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ListingGrid } from '@/components/ListingGrid';
import { SearchField } from '@/components/SearchField';
import { Empty } from '@/components/States';
import { fetchSearch } from '@/api/listings';
import { colors, space } from '@/theme/tokens';

/** Search every category (same word rules and ranking as the website's search). */
export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const [q, setQ] = useState(String(params.q ?? ''));
  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <ScreenHeader title="Search" />
      <View style={styles.box}><SearchField initial={q} onSubmit={setQ} /></View>
      {q ? (
        <ListingGrid
          queryKey={['search', q]}
          load={(page) => fetchSearch(q, { page })}
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
});
