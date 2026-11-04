import { useId } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

// The website's faint dotted paper behind hero areas.
export function DotGrid({ color = '#E9DDC6', gap = 22, opacity = 0.8 }: { color?: string; gap?: number; opacity?: number }) {
  // Pattern ids are document-wide on web, so two grids on screen need different ids.
  const id = `dots-${useId().replace(/:/g, '')}`;
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none" opacity={opacity}>
      <Defs>
        <Pattern id={id} width={gap} height={gap} patternUnits="userSpaceOnUse">
          <Circle cx={gap / 2} cy={gap / 2} r={1.3} fill={color} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
