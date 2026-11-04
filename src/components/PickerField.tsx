import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText, Icon } from '@/components/ui';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchField } from '@/components/SearchField';
import { colors, radius, size, space } from '@/theme/tokens';

export type PickOption = { value: string; label: string; hint?: string };

/** The one "choose from a list" box: tap → full-screen list with search. Used for country, region, town, category. */
export function PickerField({ label, value, options, onChange, placeholder = 'Choose…', disabled, error }: {
  label: string; value: string; options: PickOption[]; onChange: (v: string) => void; placeholder?: string; disabled?: boolean; error?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? options.filter((o) => o.label.toLowerCase().includes(t)) : options;
  }, [q, options]);
  const current = options.find((o) => o.value === value);
  return (
    <View style={styles.wrap}>
      <AppText variant="label">{label}</AppText>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${current?.label ?? placeholder}`} disabled={disabled}
        onPress={() => { setQ(''); setOpen(true); }} style={[styles.box, !!error && styles.wrong, disabled && styles.disabled]}>
        <AppText variant="body" tone={current ? 'default' : 'secondary'} style={styles.flex} numberOfLines={1}>{current?.label ?? placeholder}</AppText>
        <Icon name="chevronDown" color={colors.textSecondary} size={20} strokeWidth={2} />
      </Pressable>
      {error ? <AppText variant="bodySmall" tone="error">{error}</AppText> : null}
      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={styles.page}>
          <ScreenHeader title={label} onBack={() => setOpen(false)} />
          {options.length > 8 ? <View style={styles.search}><SearchField placeholder="Type to search" onSubmit={setQ} onChange={setQ} /></View> : null}
          <FlatList
            data={shown}
            keyExtractor={(o) => o.value}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Pressable accessibilityRole="button" accessibilityState={{ selected: item.value === value }}
                onPress={() => { onChange(item.value); setOpen(false); }}
                style={({ pressed }) => [styles.row, item.value === value && styles.rowOn, pressed && { backgroundColor: colors.greenTint }]}>
                <View style={styles.flex}>
                  <AppText variant="body">{item.label}</AppText>
                  {item.hint ? <AppText variant="caption" tone="secondary">{item.hint}</AppText> : null}
                </View>
                {item.value === value ? <AppText variant="label" tone="green">✓</AppText> : null}
              </Pressable>
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  box: { flexDirection: 'row', alignItems: 'center', gap: space.sm, height: size.input, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface, paddingHorizontal: space.md + 2 },
  wrong: { borderColor: colors.error, borderWidth: 1.5 },
  disabled: { opacity: 0.5 },
  flex: { flex: 1 },
  page: { flex: 1, backgroundColor: colors.background },
  search: { paddingHorizontal: space.lg, paddingBottom: space.sm },
  list: { paddingHorizontal: space.lg, paddingBottom: space.xxl },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: size.touch + 8, paddingHorizontal: space.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowOn: { backgroundColor: colors.greenTint },
});
