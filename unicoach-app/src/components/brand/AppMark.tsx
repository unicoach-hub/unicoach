import { Animated, StyleSheet, Text, View } from 'react-native';

import { CapMark } from '@/components/ui/Icon';
import { colors, fonts } from '@/theme/tokens';

type Props = { size?: number; capStyle?: object };

// The app icon drawn live: teal tile, white U, the logo's cap. Same mark as assets/images/icon.png.
export function AppMark({ size = 132, capStyle }: Props) {
  const r = size * 0.24;
  const shadow = Math.max(3, size * 0.04);
  return (
    <View style={{ width: size + shadow, height: size + shadow }}>
      <View style={[styles.tile, { width: size, height: size, borderRadius: r, left: shadow, top: shadow, backgroundColor: colors.ink }]} />
      <View style={[styles.tile, styles.face, { width: size, height: size, borderRadius: r }]}>
        <Text style={[styles.u, { fontSize: size * 0.66, lineHeight: size * 0.7, marginTop: size * 0.2 }]}>U</Text>
        <Animated.View style={[{ position: 'absolute', left: size * 0.23, top: size * 0.1 }, capStyle]}>
          <CapMark width={size * 0.56} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { position: 'absolute', left: 0, top: 0 },
  face: { backgroundColor: colors.teal, borderWidth: 2, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  u: { fontFamily: fonts.displayBlack, color: colors.white, includeFontPadding: false, textAlign: 'center' },
});
