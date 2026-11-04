import React from 'react';
import { Text, type TextProps } from 'react-native';
import { colors, type } from '@/theme/tokens';

type Variant = keyof typeof type;
type Tone = 'default' | 'secondary' | 'green' | 'onGreen' | 'error';

const toneColor: Record<Tone, string> = {
  default: colors.text,
  secondary: colors.textSecondary,
  green: colors.green,
  onGreen: colors.onGreen,
  error: colors.error,
};

/** The only text component screens use: one look per variant, everywhere. */
export function AppText({ variant = 'body', tone = 'default', style, ...rest }: TextProps & { variant?: Variant; tone?: Tone }) {
  return <Text {...rest} style={[type[variant], { color: toneColor[tone] }, style]} />;
}
