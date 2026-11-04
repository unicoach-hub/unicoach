import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { border, colors, radius, softShadow } from '@/theme/tokens';

type Props = ViewProps & {
  shadow?: boolean;
  background?: string;
  bordered?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

// White surface with a light cream border. `shadow` adds a soft lift for cards that float.
export function Card({ shadow = false, bordered = true, background = colors.white, style, contentStyle, children, ...rest }: Props) {
  return (
    <View style={[shadow && styles.lift, style]} {...rest}>
      <View style={[styles.surface, bordered && styles.border, { backgroundColor: background }, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  lift: { ...softShadow, borderRadius: radius.lg },
  surface: { borderRadius: radius.lg, overflow: 'hidden' },
  border: { borderWidth: border.width, borderColor: border.color },
});
