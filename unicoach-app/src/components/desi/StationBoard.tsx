import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, fonts, hardShadow } from '@/theme/tokens';

type Props = {
  name: string;
  left?: string;
  right?: string;
  size?: 'lg' | 'sm';
  // Short mustard stubs under the board (Welcome hero)
  legs?: boolean;
  // Tall ink posts the board stands on, this many px below it (plan card)
  posts?: number;
  width?: number;
};

// Indian railway station board: mustard plate, black caps, a small platform/code row underneath.
// The one place in the app that keeps the website's hard ink shadow.
export function StationBoard({ name, left, right, size = 'lg', legs, posts, width }: Props) {
  const big = size === 'lg';
  const centred = !!width;
  return (
    <View style={[styles.wrap, width ? { width } : null]}>
      {!!posts && (
        <View style={[styles.posts, { top: 24, height: posts + 24 }]} pointerEvents="none">
          <View style={[styles.post, { height: posts + 24 }]} />
          <View style={[styles.post, { height: posts + 24 }]} />
        </View>
      )}
      <View style={[styles.boardWrap, centred && { alignSelf: 'stretch' }]}>
        <View style={styles.shadow} />
        <View style={[styles.board, !big && styles.boardSmall, centred && { alignItems: 'center' }]}>
          <AppText style={[styles.name, !big && styles.nameSmall, !big && name.length > 11 && { fontSize: 12, letterSpacing: 0.3 }]} numberOfLines={1} adjustsFontSizeToFit>
            {name}
          </AppText>
          {(left || right) && (
            <View style={[styles.codes, centred && { alignSelf: 'stretch' }]}>
              <AppText style={styles.code} numberOfLines={1}>
                {left}
              </AppText>
              <AppText style={styles.code} numberOfLines={1}>
                {right}
              </AppText>
            </View>
          )}
        </View>
      </View>
      {legs && (
        <View style={styles.legs}>
          <View style={styles.leg} />
          <View style={styles.leg} />
        </View>
      )}
      {!!posts && <View style={{ height: posts }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'flex-start' },
  boardWrap: { position: 'relative', marginRight: hardShadow.offset, marginBottom: hardShadow.offset },
  shadow: {
    position: 'absolute',
    top: hardShadow.offset,
    left: hardShadow.offset,
    right: -hardShadow.offset,
    bottom: -hardShadow.offset,
    borderRadius: 7,
    backgroundColor: colors.ink,
  },
  board: {
    backgroundColor: colors.mustard,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 7,
    paddingTop: 9,
    paddingBottom: 6,
    paddingHorizontal: 14,
    gap: 3,
  },
  boardSmall: { paddingTop: 7, paddingBottom: 5, paddingHorizontal: 8 },
  name: { fontFamily: fonts.displayBlack, fontSize: 22, lineHeight: 24, letterSpacing: 0.5, color: colors.ink },
  nameSmall: { fontSize: 16, lineHeight: 18, letterSpacing: 0.8 },
  codes: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  code: { fontFamily: fonts.bodySemi, fontSize: 8, letterSpacing: 0.4, color: colors.ink },
  legs: { flexDirection: 'row', gap: 72, paddingLeft: 18, marginTop: -hardShadow.offset },
  leg: { width: 6, height: 18, backgroundColor: colors.mustard, borderWidth: 1.5, borderTopWidth: 0, borderColor: colors.ink },
  posts: { position: 'absolute', left: 18, right: 18 + hardShadow.offset, flexDirection: 'row', justifyContent: 'space-between' },
  post: { width: 6, backgroundColor: colors.ink, opacity: 0.8 },
});
