import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Highlight } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { border, colors, fonts } from '@/theme/tokens';

type Props = { kicker: string; title: [string, string, string?] };

// Back button + logo row, red kicker, heading with one highlighted word.
export function AuthHeader({ kicker, title }: Props) {
  const [before, marked, after = ''] = title;
  return (
    <View style={{ gap: 20 }}>
      <View style={styles.row}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          style={styles.back}>
          <Icon name="back" size={20} />
        </Pressable>
        <Image source={require('@/assets/images/logo-black.png')} style={styles.logo} contentFit="contain" accessibilityLabel="UniCoach" />
      </View>
      <View style={{ gap: 8 }}>
        <AppText variant="kicker">{kicker}</AppText>
        <AppText style={styles.title}>
          {before}
          <Highlight>{marked}</Highlight>
          {after}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: border.width,
    borderColor: border.color,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 106, height: 22 },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: colors.ink },
});
