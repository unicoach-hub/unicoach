import { StyleSheet } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { colors } from '@/theme/tokens';

const W = 350;
const H = 360;

// Sun-ray wedges every 15deg, 7.5deg wide, reaching past the corners.
const RAYS = Array.from({ length: 24 }, (_, i) => {
  const a = (i * 15 * Math.PI) / 180;
  const b = ((i * 15 + 7.5) * Math.PI) / 180;
  const r = 520;
  return `M0 0L${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}L${(r * Math.cos(b)).toFixed(1)} ${(r * Math.sin(b)).toFixed(1)}Z`;
}).join('');

// Faint cream mandala (rays + rings) behind teal hero cards. Centre sits top-right by default.
export function Mandala({ x = 0.78, y = 0.3, color = colors.cream }: { x?: number; y?: number; color?: string }) {
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={StyleSheet.absoluteFill} pointerEvents="none">
      <G transform={`translate(${W * x} ${H * y})`}>
        <Path d={RAYS} fill={color} opacity={0.06} />
        {[46, 78, 112].map((r) => (
          <Circle key={r} r={r} fill="none" stroke={color} strokeWidth={1.5} opacity={0.16} />
        ))}
      </G>
    </Svg>
  );
}
