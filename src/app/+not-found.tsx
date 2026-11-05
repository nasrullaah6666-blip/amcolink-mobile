import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, usePathname } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Empty } from '@/components/States';
import { Button } from '@/components/ui';
import { SITE_URL } from '@/lib/site';
import { colors, space } from '@/theme/tokens';

/** An amcolink.com link the app has no screen for: offer the website page, or Home. */
export default function NotFound() {
  const path = usePathname();
  return (
    <SafeAreaView style={styles.page}>
      <ScreenHeader />
      <View style={styles.body}>
        <Empty title="This page opens on the website" hint="The app doesn't have this page." action={{ title: 'Back to Home', onPress: () => router.replace('/') }} />
        <Button title="Open on amcolink.com" variant="outline" onPress={() => WebBrowser.openBrowserAsync(`${SITE_URL}${path || '/'}`).catch(() => {})} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  body: { padding: space.lg, gap: space.md },
});
