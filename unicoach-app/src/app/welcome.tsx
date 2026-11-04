import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Mandala } from '@/components/desi/Mandala';
import { StationBoard } from '@/components/desi/StationBoard';
import { FormError } from '@/components/FormError';
import { GoogleButton } from '@/components/GoogleButton';
import { AppText, Highlight } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { colors, fonts, radius, space } from '@/theme/tokens';

// Three landmarks on the teal hero, the middle one big. They float in one after another.
const ART = [
  { image: require('@/assets/images/destinations/uk.webp'), style: { left: '4%', top: '26%', width: '34%', height: '31%' }, rotate: '-6deg' },
  { image: require('@/assets/images/destinations/germany.webp'), style: { left: '26%', top: '11%', width: '54%', height: '49%' }, rotate: '0deg' },
  { image: require('@/assets/images/destinations/canada.webp'), style: { right: '2%', top: '33%', width: '32%', height: '29%' }, rotate: '6deg' },
] as const;

export default function Welcome() {
  const [error, setError] = useState<string | null>(null);
  const [rise] = useState(() => ART.map(() => new Animated.Value(0)));
  useEffect(() => {
    Animated.stagger(
      110,
      rise.map((v) => Animated.timing(v, { toValue: 1, duration: 560, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: true })),
    ).start();
  }, [rise]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.page}>
      <View style={styles.topRow}>
        <Image source={require('@/assets/images/logo-black.png')} style={styles.logo} contentFit="contain" accessibilityLabel="UniCoach" />
        <View style={styles.freeTag}>
          <AppText style={styles.freeText}>Counselling free</AppText>
        </View>
      </View>

      <View style={styles.hero}>
        <Mandala />
        {ART.map((a, i) => (
          <Animated.View
            key={i}
            style={[
              styles.art,
              a.style,
              {
                opacity: rise[i],
                transform: [{ translateY: rise[i].interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }, { rotate: a.rotate }],
              },
            ]}>
            <Image source={a.image} style={styles.fill} contentFit="contain" />
          </Animated.View>
        ))}
        <View style={styles.board}>
          <StationBoard name="ABROAD JN." left="PF 1" right="INTAKE 2027" legs />
        </View>
      </View>

      <View style={styles.copy}>
        <AppText variant="kicker">Chalo shuru karte hain</AppText>
        <AppText style={styles.title}>
          Abroad ka <Highlight>poora plan</Highlight>, ek jagah.
        </AppText>
        <AppText style={styles.sub}>Course se visa tak, har station pe counsellor saath.</AppText>
      </View>

      <View style={styles.actions}>
        <GoogleButton onError={setError} divider={false} />
        <FormError message={error} />
        <Button title="Email se login karo" variant="dark" onPress={() => router.push('/login')} />
        <Pressable onPress={() => router.push('/register')} accessibilityRole="link" hitSlop={6} style={styles.linkRow}>
          <AppText style={styles.link}>
            Naye ho? <AppText style={styles.linkStrong}>Account banao</AppText>
          </AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream, paddingHorizontal: space.xl },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, paddingTop: space.md },
  logo: { width: 116, height: 24 },
  freeTag: { height: 28, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: colors.tint.teal, justifyContent: 'center' },
  freeText: { fontFamily: fonts.bodySemi, fontSize: 12, color: colors.tealDark },
  hero: {
    flex: 1,
    minHeight: 240,
    maxHeight: 380,
    marginTop: space.lg,
    borderRadius: 32,
    backgroundColor: colors.teal,
    overflow: 'hidden',
  },
  art: { position: 'absolute' },
  fill: { width: '100%', height: '100%' },
  board: { position: 'absolute', left: 20, bottom: 4 },
  copy: { gap: 10, paddingTop: space.xxl, paddingHorizontal: 4 },
  title: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38, letterSpacing: -0.6, color: colors.ink },
  sub: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.mutedDark },
  actions: { gap: 12, paddingTop: space.xxl, paddingBottom: space.sm },
  linkRow: { alignItems: 'center', paddingVertical: 6 },
  link: { fontFamily: fonts.body, fontSize: 15, color: colors.mutedDark },
  linkStrong: { fontFamily: fonts.bodySemi, color: colors.teal },
});
