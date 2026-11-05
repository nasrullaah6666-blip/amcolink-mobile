import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, radius, size, space } from '@/theme/tokens';
import { AppText } from './AppText';

type Variant = 'primary' | 'outline' | 'ghost';
type Size = 'md' | 'lg';

/**
 * The one button for the whole app. Three looks only:
 *  primary = green fill (the ONE main action on a screen), outline = grey border (normal action), ghost = text only (minor action).
 * Green is kept for the main action and for what is selected, so screens stay calm and consistent (owner, 5 Nov 2026).
 */
export function Button({
  title, onPress, variant = 'primary', size: s = 'md', icon, disabled, loading, style, accessibilityLabel,
}: {
  title: string; onPress?: () => void; variant?: Variant; size?: Size; icon?: React.ReactNode;
  disabled?: boolean; loading?: boolean; style?: ViewStyle; accessibilityLabel?: string;
}) {
  const height = s === 'lg' ? size.buttonLg : size.buttonMd;
  const textTone = variant === 'primary' ? 'onGreen' : variant === 'ghost' ? 'secondary' : 'default';
  const slop = Math.max(0, (size.touch - height) / 2);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!disabled || !!loading, busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      hitSlop={{ top: slop, bottom: slop }}
      style={({ pressed }) => [
        styles.base,
        { height },
        variant === 'primary' && { backgroundColor: pressed ? colors.greenPressed : colors.green },
        variant === 'outline' && { borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: pressed ? colors.greenTint : colors.surface },
        variant === 'ghost' && { backgroundColor: pressed ? colors.greenTint : 'transparent' },
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.onGreen : colors.textSecondary} />
      ) : (
        <View style={styles.row}>
          {icon}
          <AppText variant="button" tone={textTone}>{title}</AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.sm, paddingHorizontal: space.md + 2, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  disabled: { opacity: 0.5 },
});
