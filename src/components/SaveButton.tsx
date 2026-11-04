import React from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { AppText, Icon } from '@/components/ui';
import { useSaved } from '@/auth/mine';
import { colors, radius, size, space } from '@/theme/tokens';

const askSignIn = (text: string) =>
  Alert.alert('Sign in', text, [{ text: 'Not now', style: 'cancel' }, { text: 'Sign in', onPress: () => router.push('/sign-in') }]);

/** Heart on a listing (website: FavoriteButton). */
export function SaveButton({ adId, overlay }: { adId: string; overlay?: boolean }) {
  const { signedIn, saved, toggle } = useSaved();
  const on = saved.ads.has(adId);
  const press = () => {
    if (!signedIn) return askSignIn('Sign in to save favorites.');
    toggle.mutate({ adId }, { onError: (e) => Alert.alert('Saved', (e as Error).message || 'Unable to update favorite.') });
  };
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={on ? 'Remove favorite' : 'Save favorite'} accessibilityState={{ selected: on, busy: toggle.isPending }}
      disabled={toggle.isPending} onPress={press} hitSlop={6} style={[styles.round, overlay && styles.overlay]}>
      <Icon name="heart" size={18} strokeWidth={2} color={on ? colors.green : colors.text} filled={on} />
    </Pressable>
  );
}

/** Follow a shop (website: FavoriteButton with follow). */
export function FollowButton({ shopId }: { shopId: string }) {
  const { signedIn, saved, toggle } = useSaved();
  const on = saved.shops.has(shopId);
  const press = () => {
    if (!signedIn) return askSignIn('Sign in to follow shops.');
    toggle.mutate({ shopId }, { onError: (e) => Alert.alert('Follow', (e as Error).message || 'Unable to update.') });
  };
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: on }} disabled={toggle.isPending} onPress={press}
      style={[styles.pill, on && styles.pillOn]}>
      <Icon name="heart" size={16} strokeWidth={2} color={on ? colors.onGreen : colors.green} filled={on} />
      <AppText variant="label" tone={on ? 'onGreen' : 'green'}>{on ? 'Following' : 'Follow'}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  round: { width: size.touch, height: size.touch, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  overlay: { position: 'absolute', top: 2, right: 2, width: 36, height: 36, backgroundColor: colors.overlay },
  pill: { flexDirection: 'row', alignItems: 'center', gap: space.xs + 2, height: size.chip, paddingHorizontal: space.md + 2, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.green, backgroundColor: colors.surface, alignSelf: 'flex-start' },
  pillOn: { backgroundColor: colors.green },
});
