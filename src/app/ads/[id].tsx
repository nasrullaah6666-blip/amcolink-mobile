import React, { useEffect } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppText, Button, Icon } from '@/components/ui';
import { useAuth } from '@/auth/session';
import { PhotoPager } from '@/components/PhotoPager';
import { ContactBar } from '@/components/ContactBar';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Empty, ErrorState, Loading } from '@/components/States';
import { Photo } from '@/components/Photo';
import { SaveButton } from '@/components/SaveButton';
import { ReportAndBlock } from '@/components/ReportAndBlock';
import { StatusShareButton } from '@/components/StatusShare';
import { QuickQuestions } from '@/components/QuickQuestions';
import { SimilarItems } from '@/components/SimilarItems';
import { TrustCard } from '@/components/TrustCard';
import { getTrust } from '@/core/trust';
import { db } from '@/api/db';
import { fetchListing } from '@/api/listings';
import { trackEvent } from '@/api/track';
import { formatPrice } from '@/core/utils';
import { conditionLabel } from '@/core/conditions';
import { agoLabel } from '@/core/freshness';
import {
  agentFeeLabel, bedsLabel, claimedRole, dealOf, furnishedLabel, isRental, periodShort, RENTAL_SAFETY, SALE_SAFETY, sizeLabel, typeLabel,
} from '@/core/rentals';
import { adUrl } from '@/lib/site';
import { recordView } from '@/lib/recent';
import { colors, radius, size, space } from '@/theme/tokens';

const GENERAL_SAFETY = 'Meet in a public place, inspect the item before you pay, and never send money in advance to someone you have not met.';

function Fact({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.fact}>
      <AppText variant="caption" tone="secondary">{label}</AppText>
      <AppText variant="label">{value}</AppText>
    </View>
  );
}

export default function ListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const q = useQuery({ queryKey: ['listing', id], queryFn: () => fetchListing(String(id)), enabled: !!id });
  const ad = q.data;
  const trustQ = useQuery({ queryKey: ['trust', ad?.shops?.id], queryFn: async () => (await getTrust(db(), [ad!.shops!.id])).get(ad!.shops!.id) ?? null, enabled: !!ad?.shops?.id });

  useEffect(() => {
    if (ad?.shops?.id) trackEvent(ad.shops.id, ad.id, 'view');
    // "Continue where you left off" on Home (public listings only, like the website).
    if (ad && ad.status === 'published') {
      recordView({ id: ad.id, title: ad.title, price: formatPrice(ad.price, ad.currency, ad.price_from), photo: ad.photo_urls?.[0] ?? null, city: ad.shops?.city ?? '' });
    }
  }, [ad?.id, ad?.shops?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (q.isPending) return <SafeAreaView style={styles.page}><ScreenHeader /><Loading /></SafeAreaView>;
  if (q.isError) return <SafeAreaView style={styles.page}><ScreenHeader /><View style={styles.pad}><ErrorState message={(q.error as Error).message} onRetry={() => q.refetch()} /></View></SafeAreaView>;
  if (!ad || ad.status !== 'published') {
    return (
      <SafeAreaView style={styles.page}>
        <ScreenHeader />
        <View style={styles.pad}><Empty title="This listing is not available" hint="It may have been sold or removed." action={{ title: 'Back to Home', onPress: () => router.replace('/') }} /></View>
      </SafeAreaView>
    );
  }

  const rental = isRental(ad.category) ? ad.rental : null;
  const deal = rental ? dealOf(ad) : null;
  const price = formatPrice(ad.price, ad.currency, ad.price_from) + (deal === 'rent' && periodShort(rental) ? ` ${periodShort(rental)}` : '');
  const shop = ad.shops;
  const place = [shop?.city, shop?.country].filter(Boolean).join(', ');
  const safety = deal === 'sale' ? SALE_SAFETY : deal === 'rent' ? RENTAL_SAFETY : GENERAL_SAFETY;

  const share = () => {
    if (shop?.id) trackEvent(shop.id, ad.id, 'share');
    Share.share({ message: `${ad.title} — ${price}\n${adUrl(ad.id)}` }).catch(() => {});
  };

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <ScreenHeader right={<View style={styles.headerRight}>
        <SaveButton adId={ad.id} />
        <Pressable accessibilityRole="button" accessibilityLabel="Share" onPress={share} style={styles.iconButton}>
          <Icon name="share" strokeWidth={2} size={22} />
        </Pressable>
      </View>} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <PhotoPager photos={ad.photo_urls ?? []} title={ad.title} />
        <View style={styles.body}>
          <View style={styles.gapSm}>
            <AppText variant="title" tone="green">{price}</AppText>
            <AppText variant="heading" accessibilityRole="header">{ad.title}</AppText>
            <AppText variant="bodySmall" tone="secondary">{[place, ad.created_at ? `Posted ${agoLabel(ad.created_at)}` : ''].filter(Boolean).join(' · ')}</AppText>
            {ad.availability === 'reserved' ? <AppText variant="label" tone="green">Reserved</AppText> : null}
            {ad.availability === 'sold' ? <AppText variant="label" tone="secondary">Sold</AppText> : null}
          </View>

          <StatusShareButton
            ad={{ title: ad.title, price, place, photo: ad.photo_urls?.[0] ?? null, condition: ad.condition ? conditionLabel(ad.condition) : null }}
            onShared={() => { if (shop?.id) trackEvent(shop.id, ad.id, 'share'); }}
          />

          <View style={styles.chips}>
            {ad.condition ? <View style={styles.tag}><AppText variant="caption" tone="green">{conditionLabel(ad.condition)}</AppText></View> : null}
            <View style={styles.tag}><AppText variant="caption" tone="green">{ad.subcategory || ad.category}</AppText></View>
            {deal ? <View style={styles.tag}><AppText variant="caption" tone="green">{deal === 'rent' ? 'For rent' : 'For sale'}</AppText></View> : null}
          </View>

          {rental ? (
            <View style={styles.facts}>
              <Fact label="Type" value={typeLabel(rental.type)} />
              <Fact label="Bedrooms" value={bedsLabel(rental.bedrooms)} />
              <Fact label="Bathrooms" value={rental.bathrooms ? String(rental.bathrooms) : null} />
              <Fact label="Size" value={sizeLabel(rental.size_sqm)} />
              <Fact label="Area" value={rental.area} />
              <Fact label="Furnished" value={furnishedLabel(rental.furnished)} />
              <Fact label="Agent fee" value={agentFeeLabel(rental.agent_fee)} />
              <Fact label="Listed by" value={claimedRole(rental.lister)} />
            </View>
          ) : null}

          {ad.description ? <AppText variant="body">{ad.description}</AppText> : null}

          {shop ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Seller ${shop.name}. View profile and all ads`}
              onPress={() => router.push({ pathname: '/shops/[slug]', params: { slug: shop.slug } })}
              style={({ pressed }) => [styles.seller, pressed && { backgroundColor: colors.greenTint }]}
            >
              <Photo src={shop.logo_url} thumb style={styles.logo} label={`${shop.name} logo`} />
              <View style={styles.flex}>
                <AppText variant="label">{shop.name}</AppText>
                <AppText variant="caption" tone="secondary">{shop.is_verified ? 'Verified · ' : ''}{shop.city} · View profile and all ads</AppText>
              </View>
              <Icon name="chevronRight" color={colors.textSecondary} size={20} strokeWidth={2} />
            </Pressable>
          ) : null}

          <TrustCard trust={trustQ.data} />
          {shop && ad.availability !== 'sold' && !(user && user.id === ad.owner_id) ? (
            <QuickQuestions shopId={shop.id} adId={ad.id} shopName={shop.name} whatsapp={shop.whatsapp ?? null} adTitle={ad.title} hasPrice={ad.price !== null} />
          ) : null}

          <View style={styles.safety}>
            <AppText variant="bodySmall" style={styles.safetyText}>{safety}</AppText>
          </View>
          {user && user.id === ad.owner_id ? (
            <Button title="Edit listing" variant="outline" onPress={() => router.push({ pathname: '/edit-ad/[id]', params: { id: ad.id } })} />
          ) : shop ? <ReportAndBlock adId={ad.id} shopId={shop.id} shopName={shop.name} /> : null}
          <SimilarItems ad={ad} city={shop?.city ?? ''} />
        </View>
      </ScrollView>
      {shop ? <ContactBar shop={shop} adId={ad.id} adTitle={ad.title} /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  pad: { padding: space.lg },
  scroll: { paddingBottom: space.xxl },
  body: { padding: space.lg, gap: space.lg },
  gapSm: { gap: space.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  tag: { height: 28, paddingHorizontal: space.sm + 2, borderRadius: radius.pill, backgroundColor: colors.greenTint, justifyContent: 'center' },
  facts: { flexDirection: 'row', flexWrap: 'wrap', rowGap: space.md, padding: space.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  fact: { width: '50%', gap: 2 },
  seller: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, minHeight: size.touch },
  logo: { width: 48, height: 48, borderRadius: 24 },
  flex: { flex: 1, gap: 2 },
  safety: { padding: space.md, borderRadius: radius.md, backgroundColor: colors.greenTint },
  safetyText: { color: colors.greenPressed },
  headerRight: { flexDirection: 'row' },
  iconButton: { width: size.touch, height: size.touch, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
