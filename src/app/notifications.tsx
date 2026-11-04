import React, { useEffect } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppText, Button, Icon } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Empty, ErrorState, Loading } from '@/components/States';
import { useAuth } from '@/auth/session';
import { clearNotifications, fetchNotifications, markAllRead, noticeTarget, type Notice } from '@/api/account';
import { agoLabel } from '@/core/freshness';
import { SITE_URL } from '@/lib/site';
import { colors, radius, space } from '@/theme/tokens';

/** Notifications (website: app/notifications). Opening the page marks them read, like the website. */
export default function Notifications() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['notices', user?.id], queryFn: () => fetchNotifications(user!.id), enabled: !!user });
  const unread = (q.data ?? []).filter((n) => !n.read_at).length;

  useEffect(() => {
    if (user && unread > 0) markAllRead(user.id).then(() => qc.invalidateQueries({ queryKey: ['unread', user.id] })).catch(() => {});
  }, [user, unread, qc]);

  const open = (n: Notice) => {
    const t = noticeTarget(n.link);
    if (t?.app) router.push(t.app as unknown as Href);
    else if (t?.web) WebBrowser.openBrowserAsync(`${SITE_URL}${t.web}`).catch(() => {});
  };
  const clear = () => Alert.alert('Clear all notifications?', 'This removes them from your list.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Clear', style: 'destructive', onPress: async () => { await clearNotifications(user!.id).catch(() => {}); q.refetch(); } },
  ]);

  if (!user) return <SafeAreaView style={styles.page}><ScreenHeader title="Notifications" /><View style={styles.pad}><Empty title="Sign in to see notifications" action={{ title: 'Sign in', onPress: () => router.replace('/sign-in') }} /></View></SafeAreaView>;

  return (
    <SafeAreaView edges={['top']} style={styles.page}>
      <ScreenHeader title="Notifications" right={(q.data ?? []).length ? <Button title="Clear" variant="ghost" onPress={clear} /> : null} />
      <FlatList
        data={q.data ?? []}
        keyExtractor={(n) => String(n.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<AppText variant="bodySmall" tone="secondary">Price drops on saved items, new matches for saved searches, and updates about your shop.</AppText>}
        refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => q.refetch()} tintColor={colors.green} colors={[colors.green]} />}
        ListEmptyComponent={q.isPending ? <Loading /> : q.isError ? <ErrorState message={(q.error as Error).message} onRetry={() => q.refetch()} /> :
          <Empty title="No notifications yet" hint="Save items (♡) to get alerts when prices drop." />}
        renderItem={({ item: n }) => (
          <Pressable accessibilityRole="button" onPress={() => open(n)} style={[styles.row, !n.read_at && styles.unread]}>
            <View style={styles.icon}><Icon name="bell" color={colors.green} size={18} strokeWidth={2} /></View>
            <View style={styles.flex}>
              <AppText variant="label">{n.title}{!n.read_at ? '  •' : ''}</AppText>
              {n.body ? <AppText variant="bodySmall" tone="secondary" numberOfLines={2}>{n.body}</AppText> : null}
              <AppText variant="caption" tone="secondary">{agoLabel(n.created_at)}</AppText>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  pad: { padding: space.lg },
  list: { padding: space.lg, gap: space.sm, paddingBottom: space.xxl },
  row: { flexDirection: 'row', gap: space.md, padding: space.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  unread: { backgroundColor: colors.greenTint },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, gap: 2 },
});
