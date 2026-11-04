import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, size, space } from '@/theme/tokens';
import { AppText } from './AppText';

/** Filter / choice chip. Selected = green fill; not selected = white with a border. Same everywhere. */
export function Chip({ label, selected, onPress, icon }: { label: string; selected?: boolean; onPress?: () => void; icon?: React.ReactNode }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      hitSlop={(size.touch - size.chip) / 2}
      style={({ pressed }) => [
        styles.base,
        selected
          ? { backgroundColor: pressed ? colors.greenPressed : colors.green, borderColor: colors.green }
          : { backgroundColor: pressed ? colors.greenTint : colors.surface, borderColor: colors.borderStrong },
      ]}
    >
      <View style={styles.row}>
        {icon}
        <AppText variant="label" tone={selected ? 'onGreen' : 'default'}>{label}</AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { height: size.chip, paddingHorizontal: space.md + 2, borderRadius: radius.pill, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.xs + 2 },
});
