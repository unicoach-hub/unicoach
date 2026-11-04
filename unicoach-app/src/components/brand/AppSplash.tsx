import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors } from '@/theme/tokens';

import { AppMark } from './AppMark';
import { DotGrid } from './DotGrid';
import { TrainTrack } from './Train';

type Props = { done: boolean; onHidden: () => void; onReady?: () => void };

const MIN_SHOW_MS = 1600;

// Animated launch screen shown over the app after the native splash: icon pops in, cap drops onto the U,
// logo + line fade up, train runs on the track. Fades away once the app is ready and the intro has played.
export function AppSplash({ done, onHidden, onReady }: Props) {
  const [v] = useState(() => ({
    pop: new Animated.Value(0),
    cap: new Animated.Value(0),
    text: new Animated.Value(0),
    out: new Animated.Value(1),
  }));
  const [introOver, setIntroOver] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => setIntroOver(true), MIN_SHOW_MS);
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      const ease = Easing.bezier(0.16, 1, 0.3, 1);
      if (reduce) {
        [v.pop, v.cap, v.text].forEach((a) => a.setValue(1));
        return;
      }
      Animated.parallel([
        Animated.timing(v.pop, { toValue: 1, duration: 700, easing: ease, useNativeDriver: true }),
        Animated.timing(v.cap, { toValue: 1, duration: 600, delay: 350, easing: ease, useNativeDriver: true }),
        Animated.timing(v.text, { toValue: 1, duration: 600, delay: 600, useNativeDriver: true }),
      ]).start();
    });
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [v]);

  useEffect(() => {
    if (!done || !introOver) return;
    Animated.timing(v.out, { toValue: 0, duration: 320, useNativeDriver: true }).start(({ finished }) => finished && onHidden());
  }, [done, introOver, v, onHidden]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.page, { opacity: v.out }]} onLayout={onReady} pointerEvents={done && introOver ? 'none' : 'auto'}>
      <DotGrid opacity={0.7} />
      <View style={styles.center}>
        <Animated.View
          style={{
            opacity: v.pop,
            transform: [{ scale: v.pop.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.6, 1.06, 1] }) }],
          }}>
          <AppMark
            size={132}
            capStyle={{
              opacity: v.cap,
              transform: [
                { translateY: v.cap.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] }) },
                { rotate: v.cap.interpolate({ inputRange: [0, 1], outputRange: ['-20deg', '0deg'] }) },
              ],
            }}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.words,
            { opacity: v.text, transform: [{ translateY: v.text.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] },
          ]}>
          <Image source={require('@/assets/images/logo-black.png')} style={styles.logo} contentFit="contain" accessibilityLabel="UniCoach" />
          <AppText variant="kicker" style={{ fontSize: 15 }}>
            Abroad padhai, ek plan
          </AppText>
        </Animated.View>
      </View>
      <View style={styles.bottom}>
        <TrainTrack />
        <AppText variant="small" style={{ textAlign: 'center', fontSize: 12 }}>
          Made in India, students ke liye
        </AppText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.cream, zIndex: 10 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28 },
  words: { alignItems: 'center', gap: 10 },
  logo: { width: 144, height: 30 },
  bottom: { paddingHorizontal: 32, paddingBottom: 48, gap: 22 },
});
