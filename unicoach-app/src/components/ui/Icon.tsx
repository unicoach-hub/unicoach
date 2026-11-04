import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '@/theme/tokens';

export type IconName =
  | 'home'
  | 'explore'
  | 'tools'
  | 'chat'
  | 'plan'
  | 'bell'
  | 'arrow'
  | 'check'
  | 'back'
  | 'logout'
  | 'search'
  | 'close'
  | 'filter'
  | 'award'
  | 'cards'
  | 'user'
  | 'play'
  | 'calendar'
  | 'external'
  | 'heart';

type Props = { name: IconName; size?: number; color?: string; strokeWidth?: number; fill?: string };

// Lucide-style outline icons, same set the design boards use.
export function Icon({ name, size = 22, color = colors.ink, strokeWidth = 2.2, fill = 'none' }: Props) {
  const p = { fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'home' && (
        <>
          <Path {...p} d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
          <Path {...p} d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </>
      )}
      {name === 'explore' && (
        <>
          <Circle {...p} cx={12} cy={12} r={10} />
          <Path {...p} d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />
        </>
      )}
      {name === 'tools' && (
        <>
          <Rect {...p} width={7} height={7} x={3} y={3} rx={1} />
          <Rect {...p} width={7} height={7} x={14} y={3} rx={1} />
          <Rect {...p} width={7} height={7} x={14} y={14} rx={1} />
          <Rect {...p} width={7} height={7} x={3} y={14} rx={1} />
        </>
      )}
      {name === 'chat' && <Path {...p} d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />}
      {name === 'plan' && (
        <>
          <Circle {...p} cx={6} cy={19} r={3} />
          <Path {...p} d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
          <Circle {...p} cx={18} cy={5} r={3} />
        </>
      )}
      {name === 'award' && (
        <>
          <Circle {...p} cx={12} cy={8} r={6} />
          <Path {...p} d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
        </>
      )}
      {name === 'cards' && (
        <>
          <Rect {...p} width={12} height={16} x={6} y={5} rx={2.5} />
          <Path {...p} d="M9 2h8a2 2 0 0 1 2 2v12" />
        </>
      )}
      {name === 'user' && (
        <>
          <Circle {...p} cx={12} cy={8} r={4} />
          <Path {...p} d="M4 21a8 8 0 0 1 16 0" />
        </>
      )}
      {name === 'play' && <Path {...p} fill={fill} d="M7 4v16l13-8z" />}
      {name === 'calendar' && (
        <>
          <Rect {...p} width={18} height={18} x={3} y={4} rx={2} />
          <Path {...p} d="M16 2v4M8 2v4M3 10h18" />
        </>
      )}
      {name === 'external' && <Path {...p} d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />}
      {name === 'filter' && <Path {...p} d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4" />}
      {name === 'bell' && (
        <>
          <Path {...p} d="M10.268 21a2 2 0 0 0 3.464 0" />
          <Path {...p} d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
        </>
      )}
      {name === 'arrow' && <Path {...p} d="M5 12h14M13 6l6 6-6 6" />}
      {name === 'back' && <Path {...p} d="M19 12H5M11 18l-6-6 6-6" />}
      {name === 'check' && <Path {...p} d="M20 6 9 17l-5-5" />}
      {name === 'search' && (
        <>
          <Circle {...p} cx={11} cy={11} r={8} />
          <Path {...p} d="m21 21-4.3-4.3" />
        </>
      )}
      {name === 'close' && <Path {...p} d="M18 6 6 18M6 6l12 12" />}
      {name === 'heart' && (
        <Path
          {...p}
          fill={fill}
          d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
        />
      )}
      {name === 'logout' && <Path {...p} d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />}
    </Svg>
  );
}

// The logo's mortarboard: ink cap, mustard tassel.
export function CapMark({ width = 32, tassel = true }: { width?: number; tassel?: boolean }) {
  return (
    <Svg width={width} height={(width * 70) / 100} viewBox="0 0 100 70">
      <Path d="M50 4 94 22 50 40 6 22z" fill={colors.ink} />
      <Path d="M26 31v14q24 12 48 0V31L50 41z" fill={colors.ink} />
      {tassel && (
        <>
          <Path d="M50 22 84 30v18" fill="none" stroke={colors.mustard} strokeWidth={3.5} strokeLinecap="round" />
          <Circle cx={84} cy={52} r={5} fill={colors.mustard} />
        </>
      )}
    </Svg>
  );
}
