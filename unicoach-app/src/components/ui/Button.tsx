import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { border, colors, fonts, radius } from '@/theme/tokens';

import { AppText } from './AppText';

type Variant = 'primary' | 'secondary' | 'dark' | 'light';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  loadingTitle?: string;
  disabled?: boolean;
  icon?: ReactNode;
  size?: 'lg' | 'sm';
  style?: StyleProp<ViewStyle>;
};

const LOOK: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.teal, fg: colors.cream },
  dark: { bg: colors.ink, fg: colors.cream },
  secondary: { bg: colors.white, fg: colors.ink, border: border.color },
  // Cream pill used on teal cards
  light: { bg: colors.cream, fg: colors.ink },
};

export function Button({ title, onPress, variant = 'primary', loading, loadingTitle, disabled, icon, size = 'lg', style }: Props) {
  const look = LOOK[variant];
  const inactive = disabled || loading;
  const small = size === 'sm';
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      style={({ pressed }) => [
        styles.surface,
        small && styles.small,
        { backgroundColor: look.bg },
        look.border ? { borderWidth: border.width, borderColor: look.border } : null,
        pressed && !inactive && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <AppText style={[styles.label, small && styles.labelSmall, { color: look.fg }]}>{loading && loadingTitle ? loadingTitle : title}</AppText>
      {loading ? loadingTitle ? <LoadingDots /> : <ActivityIndicator color={look.fg} /> : icon}
    </Pressable>
  );
}

// Mustard / peach / orange dots from the loaders board.
function LoadingDots() {
  const [values] = useState(() => [0, 1, 2].map(() => new Animated.Value(0)));
  useEffect(() => {
    const loops = values.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(v, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay((2 - i) * 150 + 100),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [values]);
  const dotColors = [colors.mustard, colors.peach, colors.orange];
  return (
    <View style={styles.dots}>
      {values.map((v, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            { backgroundColor: dotColors[i], transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    height: 56,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
  },
  small: { height: 44, borderRadius: 22, paddingHorizontal: 18, alignSelf: 'flex-start', gap: 8 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.55 },
  label: { fontFamily: fonts.bodySemi, fontSize: 16 },
  labelSmall: { fontSize: 15 },
  dots: { flexDirection: 'row', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
