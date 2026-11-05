import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { AppText } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ListingGrid } from '@/components/ListingGrid';
import { Empty } from '@/components/States';
import { fetchCollection, type CollectionKind } from '@/api/listings';
import { useCountry } from '@/lib/countryPref';
import { colors, space } from '@/theme/tokens';

// Titles and intro lines follow the website pages /deals, /free, /used and Home "Brand new".
const INFO: Record<CollectionKind, { title: string; intro: string; empty: string }> = {
  deals: { title: 'Deals', intro: 'Items discounted 30% or more in the last 7 days.', empty: 'No big price drops right now' },
  free: { title: 'Free stuff', intro: 'Items people are giving away near you.', empty: 'Nothing free right now' },
  used: { title: 'Used & refurbished', intro: 'Second-hand and refurbished items near you.', empty: 'No used items yet' },
  new: { title: 'Brand new', intro: 'New items from local sellers.', empty: 'No new items yet' },
};

export default function CollectionScreen() {
  const { name: country } = useCountry();
  const { kind } = useLocalSearchParams<{ kind: string }>();
  const k = String(kind) as CollectionKind;
  const info = INFO[k];
  if (!info) {
    return (
      <SafeAreaView style={styles.page}>
        <ScreenHeader />
        <View style={styles.pad}><Empty title="Page not found" action={{ title: 'Back to Home', onPress: () => router.replace('/') }} /></View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <ScreenHeader title={info.title} />
      <ListingGrid
        queryKey={['collection', k, country ?? 'ALL']}
        load={(page) => fetchCollection(k, { page, country: country ?? undefined })}
        header={<AppText variant="bodySmall" tone="secondary" style={styles.intro}>{info.intro}</AppText>}
        emptyTitle={info.empty}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  pad: { padding: space.lg },
  intro: { paddingBottom: space.md },
});
