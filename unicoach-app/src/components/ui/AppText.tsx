import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors, fonts } from '@/theme/tokens';

type Variant = 'title' | 'heading' | 'kicker' | 'body' | 'bodyStrong' | 'small' | 'label';

type Props = TextProps & { variant?: Variant; color?: string };

export function AppText({ variant = 'body', color, style, ...rest }: Props) {
  return <Text {...rest} style={[styles[variant], color ? { color } : null, style]} />;
}

// Mustard highlighter behind a word or two of a heading. Nest it inside an AppText;
// no-break spaces pad the marker (nested Text can't take padding) and keep a trailing comma on its line.
export function Highlight({ children, color = colors.mustard }: { children: string; color?: string }) {
  return <Text style={{ backgroundColor: color, color: colors.ink }}>{` ${children} `}</Text>;
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: colors.ink },
  heading: { fontFamily: fonts.display, fontSize: 19, lineHeight: 24, color: colors.ink },
  kicker: { fontFamily: fonts.bodySemi, fontSize: 11, lineHeight: 15, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.red },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.body },
  bodyStrong: { fontFamily: fonts.bodySemi, fontSize: 15, lineHeight: 22, color: colors.ink },
  small: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.mutedDark },
  label: { fontFamily: fonts.bodySemi, fontSize: 13, lineHeight: 18, color: colors.ink },
});
