import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { border, colors, fonts, radius } from '@/theme/tokens';

import { AppText } from './AppText';

type Props = TextInputProps & { label: string; error?: string; hint?: string };

export function TextField({ label, error, hint, style, onFocus, onBlur, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      <AppText variant="label">{label}</AppText>
      <TextInput
        {...rest}
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[styles.input, focused && styles.focused, !!error && styles.invalid, style]}
      />
      {error ? (
        <AppText variant="small" color={colors.red}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="small">{hint}</AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  input: {
    height: 52,
    borderWidth: border.width,
    borderColor: border.color,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: colors.ink,
  },
  focused: { borderColor: colors.teal },
  invalid: { borderColor: colors.red },
});
