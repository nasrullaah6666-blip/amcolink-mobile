import React, { useEffect } from 'react';
import { FlatList, Linking, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppText, Button, Icon } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ListingCard } from '@/components/ListingCard';
import { ContactBar } from '@/components/ContactBar';
import { Photo } from '@/components/Photo';
import { Empty, ErrorState, Loading } from '@/components/States';
import { fetchShop, fetchShopListings } from '@/api/listings';
import { trackEvent } from '@/api/track';
import { db } from '@/api/db';
import { areaLine, mapsUrl, placeLine } from '@/core/address';
import { cleanHours, openStatus } from '@/core/hours';
import { getTrust } from '@/core/trust';
import { shopUrl } from '@/lib/site';
import { colors, space } from '@/theme/tokens';

export default function ShopScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const shopQ = useQuery({ queryKey: ['shop', slug], queryFn: () => fetchShop(String(slug)), enabled: !!slug });
  const shop = shopQ.data;
  const adsQ = useQuery({ queryKey: ['shop-ads', shop?.id], queryFn: () => fetchShopListings(shop!.id), enabled: !!shop?.id });
  const trustQ = useQuery({ queryKey: ['trust', shop?.id], queryFn: async () => (await getTrust(db(), [shop!.id])).get(shop!.id) ?? null, enabled: !!shop?.id });

  useEffect(() => {
    if (shop?.id) trackEvent(shop.id, null, 'view');
  }, [shop?.id]);

  if (shopQ.isPending) return <SafeAreaView style={styles.page}><ScreenHeader /><Loading /></SafeAreaView>;
  if (shopQ.isError) return <SafeAreaView style={styles.page}><ScreenHeader /><View style={styles.pad}><ErrorState message={(shopQ.error as Error).message} onRetry={() => shopQ.refetch()} /></View></SafeAreaView>;
  if (!shop || shop.status !== 'approved') {
    return (
      <SafeAreaView style={styles.page}>
        <ScreenHeader />
        <View style={styles.pad}><Empty title="This profile is not available" action={{ title: 'Back to Home', onPress: () => router.replace('/') }} /></View>
      </SafeAreaView>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = shop as any;
  const place = placeLine(s);
  const area = areaLine(s);
  const status = openStatus(cleanHours(s.hours), shop.country);
  const trust = trustQ.data;
  const ads = adsQ.data ?? [];

  const share = () => {
    trackEvent(shop.id, null, 'share');
    Share.share({ message: `${shop.name} on Amcolink\n${shopUrl(shop.slug)}` }).catch(() => {});
  };

  const header = (
    <View style={styles.head}>
      <Photo src={shop.cover_url} style={styles.cover} label={`${shop.name} cover photo`} />
      <View style={styles.headBody}>
        <Photo src={shop.logo_url} thumb style={styles.logo} label={`${shop.name} logo`} />
        <AppText variant="title" accessibilityRole="header">{shop.name}</AppText>
        {shop.is_verified ? <AppText variant="label" tone="green">Verified</AppText> : null}
        {place ? <AppText variant="bodySmall" tone="secondary">{place}</AppText> : null}
        {area ? <AppText variant="bodySmall" tone="secondary">{area}</AppText> : null}
        {status ? <AppText variant="label" tone={status.open ? 'green' : 'secondary'}>{status.text}</AppText> : null}
        {trust && trust.reviews > 0 && trust.rating != null ? (
          <AppText variant="bodySmall">{trust.rating.toFixed(1)} out of 5 · {trust.reviews} review{trust.reviews === 1 ? '' : 's'}</AppText>
        ) : null}
        {shop.description ? <AppText variant="body">{shop.description}</AppText> : null}
        <View style={styles.actions}>
          <Button style={styles.flex} variant="outline" title="Map" icon={<Icon name="map" color={colors.green} size={18} strokeWidth={2} />} onPress={() => Linking.openURL(mapsUrl({ ...s, name: shop.name })).catch(() => {})} />
          <Button style={styles.flex} variant="outline" title="Share" icon={<Icon name="share" color={colors.green} size={18} strokeWidth={2} />} onPress={share} />
        </View>
        <AppText variant="heading" style={styles.section}>Ads ({ads.length})</AppText>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <ScreenHeader />
      <FlatList
        data={ads}
        keyExtractor={(a) => a.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        ListHeaderComponent={header}
        renderItem={({ item }) => <ListingCard ad={item} />}
        ListEmptyComponent={adsQ.isPending ? <Loading /> : adsQ.isError ? <ErrorState message={(adsQ.error as Error).message} onRetry={() => adsQ.refetch()} /> : <Empty title="No ads yet" />}
      />
      <ContactBar shop={shop} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  pad: { padding: space.lg },
  content: { paddingHorizontal: space.lg, paddingBottom: space.xxl },
  row: { gap: space.sm + 2, marginBottom: space.sm + 2 },
  head: { marginHorizontal: -space.lg },
  cover: { width: '100%', height: 150 },
  headBody: { paddingHorizontal: space.lg, marginTop: -36, gap: space.xs },
  logo: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: colors.background },
  actions: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
  flex: { flex: 1 },
  section: { marginTop: space.lg, marginBottom: space.sm },
});

