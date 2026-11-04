import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Icon } from '@/components/ui';
import { colors, radius, size, space, type } from '@/theme/tokens';

/** The one search box style. Submits on the keyboard's search key. */
export function SearchField({ initial = '', placeholder = "I'm looking for…", onSubmit, onChange, label = 'Search' }: {
  initial?: string; placeholder?: string; onSubmit: (text: string) => void; onChange?: (text: string) => void; label?: string;
}) {
  const [q, setQ] = useState(initial);
  return (
    <View style={styles.box}>
      <Icon name="search" color={colors.textSecondary} size={20} strokeWidth={2} />
      <TextInput
        accessibilityLabel={label}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        value={q}
        onChangeText={(t) => { setQ(t); onChange?.(t); }}
        returnKeyType="search"
        onSubmitEditing={() => onSubmit(q.trim())}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: space.sm + 2, height: size.input, paddingHorizontal: space.md + 2, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  input: { flex: 1, ...type.body, fontSize: 16, color: colors.text },
});
