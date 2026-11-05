import React, { useEffect } from 'react';
import { FlatList, Linking, Pressable, Share, StyleSheet, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { isPropertyAccount } from '@/core/property';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppText, Button, Icon } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ListingCard } from '@/components/ListingCard';
import { ContactBar } from '@/components/ContactBar';
import { Photo } from '@/components/Photo';
import { FollowButton } from '@/components/SaveButton';
import { ReportAndBlock } from '@/components/ReportAndBlock';
import { ShopReviews } from '@/components/ShopReviews';
import { Empty, ErrorState, Loading } from '@/components/States';
import { fetchShop, fetchShopListings } from '@/api/listings';
import { trackEvent } from '@/api/track';
import { db } from '@/api/db';
import { areaLine, mapsUrl, placeLine } from '@/core/address';
import { cleanHours, hasHours, openStatus, weekRows } from '@/core/hours';
import { LINK_INFO, shopLinks } from '@/core/links';
import { safetyGate } from '@/lib/safetyGate';
import { getTrust } from '@/core/trust';
import { TrustCard } from '@/components/TrustCard';
import { awayUntilLabel, isAway } from '@/core/away';
import { useAuth } from '@/auth/session';
import { shopUrl, SITE_URL } from '@/lib/site';
import { colors, radius, space } from '@/theme/tokens';

export default function ShopScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user } = useAuth();
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const card = (a: any) => <ListingCard key={a.id} ad={a} />;
  const trust = trustQ.data;
  const all = adsQ.data ?? [];
  // Website: up to 4 pinned listings first (newest pin first), then the rest newest first.
  const pinned = all.filter((a) => (a as { pinned_at?: string | null }).pinned_at && !(a as { hidden_by_owner?: boolean }).hidden_by_owner)
    .sort((x, y) => String((y as { pinned_at?: string }).pinned_at).localeCompare(String((x as { pinned_at?: string }).pinned_at))).slice(0, 4);
  const rest = all.filter((a) => !pinned.some((p) => p.id === a.id));
  const hours = cleanHours(s.hours);
  const links = shopLinks(s);
  const since = s.created_at ? new Date(s.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '';
  const announcement = String(s.announcement || '').trim();
  const note = String(s.opening_hours || '').trim();
  const away = isAway(s);
  const mine = user?.id === (shop as { owner_id?: string }).owner_id;

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
        {shop.is_verified ? (
          <Pressable accessibilityRole="link" accessibilityLabel={`Verified ${isPropertyAccount(s) ? 'profile' : 'seller'}. What this means`} hitSlop={8}
            onPress={() => WebBrowser.openBrowserAsync(`${SITE_URL}/verified`).catch(() => {})}>
            <AppText variant="label" tone="green">✓ Verified {isPropertyAccount(s) ? 'profile' : 'seller'} · <AppText variant="label" tone="green" style={styles.underline}>What this means</AppText></AppText>
          </Pressable>
        ) : null}
        <FollowButton shopId={shop.id} />
        {place ? <AppText variant="bodySmall" tone="secondary">{place}</AppText> : null}
        {area ? <AppText variant="bodySmall" tone="secondary">{area}</AppText> : null}
        {status ? <AppText variant="label" tone={status.open ? 'green' : 'secondary'}>{status.text}</AppText> : null}
        <AppText variant="bodySmall">
          {trust && trust.reviews > 0 && trust.rating != null ? `★ ${trust.rating.toFixed(1)} · ${trust.reviews} review${trust.reviews === 1 ? '' : 's'}` : 'New profile'}
          {since ? ` · Since ${since}` : ''}
        </AppText>
        {announcement ? <View style={styles.note}><AppText variant="bodySmall">📣 {announcement}</AppText></View> : null}
        {links.length ? (
          <View style={styles.links}>
            {links.map((l) => (
              <Button key={l.type} variant="outline" title={LINK_INFO[l.type].label} accessibilityLabel={`${shop.name} on ${LINK_INFO[l.type].label}`}
                onPress={() => safetyGate(`shop:${shop.id}`, `Continue to ${LINK_INFO[l.type].label}`, () => { Linking.openURL(l.url).catch(() => {}); })} />
            ))}
          </View>
        ) : null}
        {away ? (
          <View style={styles.away}>
            <AppText variant="label">🌙 {shop.name} is away{s.away_until ? ` until ${awayUntilLabel(s.away_until)}` : ' for now'}.</AppText>
            <AppText variant="bodySmall">{mine ? 'Your listings are hidden from buyers. Turn Away mode off in My ads.' : 'Their listings will be back when they return. Follow this profile to find it again easily.'}</AppText>
          </View>
        ) : null}
        {shop.description ? <AppText variant="body">{shop.description}</AppText> : null}
        {hasHours(hours) || note ? (
          <View style={styles.hours}>
            <AppText variant="label">Opening hours</AppText>
            {weekRows(hours).map((r) => (
              <View key={r.days} style={styles.hourRow}>
                <AppText variant="bodySmall" style={styles.days}>{r.days}</AppText>
                <AppText variant="bodySmall" tone="secondary">{r.time}</AppText>
              </View>
            ))}
            {note ? <AppText variant="caption" tone="secondary">{note}</AppText> : null}
          </View>
        ) : null}
        <View style={styles.actions}>
          <Button style={styles.flex} variant="outline" title="Map" icon={<Icon name="map" color={colors.green} size={18} strokeWidth={2} />} onPress={() => Linking.openURL(mapsUrl({ ...s, name: shop.name })).catch(() => {})} />
          <Button style={styles.flex} variant="outline" title="Share" icon={<Icon name="share" color={colors.green} size={18} strokeWidth={2} />} onPress={share} />
        </View>
        <TrustCard trust={trust} />
        {!mine ? <ReportAndBlock shopId={shop.id} shopName={shop.name} /> : null}
        {pinned.length ? (
          <>
            <AppText variant="heading" style={styles.section}>📌 Featured</AppText>
            {Array.from({ length: Math.ceil(pinned.length / 2) }).map((_, i) => (
              <View key={i} style={styles.pinRow}>{pinned.slice(i * 2, i * 2 + 2).map(card)}{pinned.length - i * 2 === 1 ? <View style={styles.flex} /> : null}</View>
            ))}
          </>
        ) : null}
        {!pinned.length || rest.length ? <AppText variant="heading" style={styles.section}>{pinned.length ? `More from ${shop.name}` : `Ads (${all.length})`}</AppText> : null}
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <ScreenHeader />
      <FlatList
        data={rest}
        keyExtractor={(a) => a.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        ListHeaderComponent={header}
        renderItem={({ item }) => <ListingCard ad={item} />}
        ListFooterComponent={<ShopReviews shopId={shop.id} ownerId={(shop as { owner_id: string }).owner_id} shopName={shop.name} />}
        ListEmptyComponent={pinned.length ? null : adsQ.isPending ? <Loading /> : adsQ.isError ? <ErrorState message={(adsQ.error as Error).message} onRetry={() => adsQ.refetch()} /> : <Empty title={away ? 'This profile is away. Its listings will be back soon.' : 'No ads yet'} />}
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
  note: { padding: space.md, borderRadius: radius.md, backgroundColor: colors.greenTint, marginTop: space.xs },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.xs },
  hours: { gap: space.xs, padding: space.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, marginTop: space.sm },
  hourRow: { flexDirection: 'row', gap: space.md },
  days: { width: 96 },
  pinRow: { flexDirection: 'row', gap: space.sm + 2, marginBottom: space.sm + 2 },
  underline: { textDecorationLine: 'underline' },
  away: { gap: space.xs, padding: space.md, borderRadius: radius.md, backgroundColor: colors.greenTint, marginTop: space.sm },
});

