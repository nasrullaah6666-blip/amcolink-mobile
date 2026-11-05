import React, { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { colors, radius, size, space, type } from '@/theme/tokens';
import { AppText } from './AppText';

/** The one text box for every form: label above, red border and message when wrong, Show/Hide for passwords. */
export const TextField = forwardRef<TextInput, TextInputProps & { label: string; error?: string | null; password?: boolean; hint?: string }>(
  function TextField({ label, error, password, hint, style, ...rest }, ref) {
    const [hidden, setHidden] = useState(true);
    const [focused, setFocused] = useState(false);
    return (
      <View style={styles.wrap}>
        <AppText variant="label">{label}</AppText>
        <View style={[styles.box, rest.multiline && styles.boxMulti, focused && styles.focused, !!error && styles.wrong]}>
          <TextInput
            {...rest}
            ref={ref}
            accessibilityLabel={label}
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={password && hidden}
            autoCapitalize={password ? 'none' : rest.autoCapitalize}
            autoCorrect={password ? false : rest.autoCorrect}
            onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
            style={[styles.input, style]}
          />
          {password ? (
            <Pressable accessibilityRole="button" accessibilityLabel={hidden ? 'Show password' : 'Hide password'} onPress={() => setHidden((h) => !h)} style={styles.toggle}>
              <AppText variant="label" tone="green">{hidden ? 'Show' : 'Hide'}</AppText>
            </Pressable>
          ) : null}
        </View>
        {error ? <AppText variant="bodySmall" tone="error" accessibilityRole="alert">{error}</AppText> : hint ? <AppText variant="caption" tone="secondary">{hint}</AppText> : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  box: { flexDirection: 'row', alignItems: 'center', height: size.input, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface, paddingLeft: space.md + 2 },
  // Several lines (description…): the frame grows with the text box instead of staying one line tall.
  boxMulti: { height: undefined, minHeight: size.input, alignItems: 'stretch', paddingVertical: space.xs },
  focused: { borderColor: colors.green, borderWidth: 1.5 },
  wrong: { borderColor: colors.error, borderWidth: 1.5 },
  input: { flex: 1, ...type.body, fontSize: 15, color: colors.text, height: '100%' },
  toggle: { height: size.touch, paddingHorizontal: space.md, justifyContent: 'center' },
});
