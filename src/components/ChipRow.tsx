import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from '@/components/ui';
import { space } from '@/theme/tokens';

export type ChipOption = { value: string; label: string };

/** A sideways-scrolling row of single-choice chips (sub-categories, property types, sorting). */
export function ChipRow({ options, value, onChange }: { options: ChipOption[]; value: string; onChange: (v: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} style={styles.scroll}>
      {options.map((o) => (
        <Chip key={o.value || 'all'} label={o.label} selected={o.value === value} onPress={() => onChange(o.value)} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginHorizontal: -space.lg, flexGrow: 0 },
  row: { gap: space.sm, paddingHorizontal: space.lg, paddingVertical: space.xs },
});
