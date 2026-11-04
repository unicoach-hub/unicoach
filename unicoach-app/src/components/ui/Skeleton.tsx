import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Easing, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';

// One shared pulse per group, so every bar in a skeleton card breathes together.
const Pulse = createContext<Animated.Value | null>(null);

export function SkeletonGroup({ children }: { children: ReactNode }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (reduce) return;
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      );
      loop.start();
    });
    return () => loop?.stop();
  }, [v]);
  return <Pulse.Provider value={v}>{children}</Pulse.Provider>;
}

type Props = { width?: DimensionValue; height?: number; radius?: number; style?: StyleProp<ViewStyle> };

export function Skeleton({ width = '100%', height = 12, radius = 6, style }: Props) {
  const v = useContext(Pulse);
  const opacity = v ? v.interpolate({ inputRange: [0, 1], outputRange: [1, 0.45] }) : 1;
  return <Animated.View style={[{ width, height, borderRadius: radius, backgroundColor: '#EFE3CB', opacity }, style]} />;
}
