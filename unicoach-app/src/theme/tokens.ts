// "S · Cream Teal": the website's palette on cream, with light 1.5px borders and soft shadows.
// Teal is the action colour, mustard is the highlighter, red is for kickers. The only hard
// ink shadow left is on the railway station boards.

export const colors = {
  cream: '#FFF6E5',
  creamDeep: '#FBF3E3',
  ink: '#16130F',
  white: '#FFFFFF',
  teal: '#14837E',
  tealDark: '#0F6560',
  red: '#D0362E',
  magenta: '#B8285B',
  orange: '#DE5C2B',
  orangeDeep: '#C04A1D',
  mustard: '#F2B705',
  peach: '#FFD9C2',
  sand: '#F4EADA',
  green: '#1E8A5A',
  body: '#3D362E',
  muted: '#8A8275',
  mutedDark: '#5B544A',
  divider: '#EDE4D3',
  dashed: '#D9CDB6',
  tint: {
    teal: '#D8EEEC',
    red: '#FCDCD2',
    magenta: '#FBD9E6',
    orange: '#FDE7C8',
    mustard: '#FFF1B8',
  },
} as const;

export const fonts = {
  display: 'Urbanist_800ExtraBold',
  displayBlack: 'Urbanist_900Black',
  displayBold: 'Urbanist_700Bold',
  body: 'Onest_400Regular',
  bodyMedium: 'Onest_500Medium',
  bodySemi: 'Onest_600SemiBold',
} as const;

// 8-pt grid
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;

export const radius = { sm: 10, md: 18, lg: 22, xl: 28, pill: 999 } as const;

export const border = { width: 1.5, color: colors.divider } as const;

// Soft lift for floating things (tab bar, buttons on photos). Android uses elevation.
export const softShadow = {
  shadowColor: colors.ink,
  shadowOpacity: 0.12,
  shadowRadius: 15,
  shadowOffset: { width: 0, height: 10 },
  elevation: 8,
} as const;

// Station boards keep the website's hard 3px ink shadow, drawn as a block (Android has no offset shadows).
export const hardShadow = { offset: 3 } as const;

// Floating tab bar height + its gap from the bottom edge; scroll content pads by this plus the safe area.
export const TAB_BAR = { height: 64, gap: 16 } as const;
