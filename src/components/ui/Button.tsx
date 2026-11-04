import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, radius, size, space } from '@/theme/tokens';
import { AppText } from './AppText';

type Variant = 'primary' | 'outline' | 'ghost';
type Size = 'md' | 'lg';

/**
 * The one button for the whole app. Three looks only:
 *  primary = green fill (main action), outline = green border (second action), ghost = text only (minor action).
 */
export function Button({
  title, onPress, variant = 'primary', size: s = 'md', icon, disabled, loading, style, accessibilityLabel,
}: {
  title: string; onPress?: () => void; variant?: Variant; size?: Size; icon?: React.ReactNode;
  disabled?: boolean; loading?: boolean; style?: ViewStyle; accessibilityLabel?: string;
}) {
  const height = s === 'lg' ? size.buttonLg : size.buttonMd;
  const textTone = variant === 'primary' ? 'onGreen' : variant === 'ghost' ? 'secondary' : 'green';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!disabled || !!loading, busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { height, minHeight: size.touch },
        variant === 'primary' && { backgroundColor: pressed ? colors.greenPressed : colors.green },
        variant === 'outline' && { borderWidth: 1.5, borderColor: colors.green, backgroundColor: pressed ? colors.greenTint : colors.surface },
        variant === 'ghost' && { backgroundColor: pressed ? colors.greenTint : 'transparent' },
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.onGreen : colors.green} />
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
  base: { borderRadius: radius.md, paddingHorizontal: space.lg, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  disabled: { opacity: 0.5 },
});
