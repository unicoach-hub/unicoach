import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';

import { colors } from '@/theme/tokens';

const W = 40;

// Small train running along a dashed railway track: the app's "kuch ho raha hai" signal.
export function TrainTrack({ color = colors.red, duration = 2400 }: { color?: string; duration?: number }) {
  const [width, setWidth] = useState(0);
  const [x] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!width) return;
    const loop = Animated.loop(
      Animated.timing(x, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [width, x, duration]);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const dashes = Math.max(0, Math.floor(width / 16));

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <View style={styles.track}>
        {Array.from({ length: dashes }).map((_, i) => (
          <View key={i} style={styles.dash} />
        ))}
      </View>
      {width > 0 && (
        <Animated.View
          style={[
            styles.train,
            { transform: [{ translateX: x.interpolate({ inputRange: [0, 1], outputRange: [-W, width] }) }] },
          ]}>
          <TrainIcon color={color} />
        </Animated.View>
      )}
    </View>
  );
}

export function TrainIcon({ color = colors.red, width = W }: { color?: string; width?: number }) {
  return (
    <Svg width={width} height={(width * 22) / 34} viewBox="0 0 34 22">
      <Rect x={2} y={2} width={30} height={13} rx={4} fill={color} stroke={colors.ink} strokeWidth={2.5} />
      <Rect x={7} y={5} width={6} height={5} fill={colors.cream} />
      <Rect x={16} y={5} width={6} height={5} fill={colors.cream} />
      <Circle cx={9} cy={18} r={2.5} fill={colors.ink} />
      <Circle cx={25} cy={18} r={2.5} fill={colors.ink} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 26, overflow: 'hidden', alignSelf: 'stretch' },
  track: { position: 'absolute', left: 0, right: 0, top: 21, flexDirection: 'row', gap: 6 },
  dash: { width: 10, height: 3, backgroundColor: colors.ink },
  train: { position: 'absolute', left: 0, top: 0 },
});
