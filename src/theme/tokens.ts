/**
 * Amcolink design rules — the ONLY place colours, sizes, spacing, corners and fonts are defined.
 * Every screen and component reads from here, so buttons, colours and text stay the same everywhere.
 * A check (npm run check:design) fails if a colour code is written anywhere else in src/.
 * Matches the website: Amcolink green only, Outfit font, phone-first.
 */
export const colors = {
  // Brand: Amcolink green
  green: '#146c5a',
  greenPressed: '#0f5546',
  greenTint: '#e6f0ed',
  onGreen: '#ffffff',
  onGreenMuted: 'rgba(255,255,255,0.45)',
  // Ground and surfaces
  background: '#fbfaf7',
  surface: '#ffffff',
  overlay: 'rgba(255,255,255,0.92)',
  backdrop: 'rgba(20,33,29,0.45)', // behind the side menu
  placeholder: '#dfe7e4',
  // Text
  text: '#14211d',
  textSecondary: '#46534f',
  // Lines
  border: '#e3e8e6',
  borderStrong: '#c9d4d0',
  // Errors only (form messages). Not a design colour.
  error: '#b42318',
} as const;

export const fonts = {
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
} as const;

/** Text styles: weights follow the website (400 body, 500 labels, 600 buttons/section headings, 700 main headings). */
export const type = {
  title: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 28 },
  heading: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24 },
  price: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 20 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21 },
  bodySmall: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 18 },
  button: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 20 },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
  tab: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 14 },
} as const;

/** Spacing scale (px). Use these steps only. */
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 } as const;

/** Corner radius (px). */
export const radius = { sm: 9, md: 12, lg: 14, tile: 16, pill: 999 } as const;

/** Sizes shared by every control. */
export const size = {
  touch: 44, // smallest tappable area
  buttonMd: 44,
  buttonLg: 50,
  chip: 36,
  input: 48,
  tabBar: 68,
  icon: 24,
  iconSmall: 18,
  categoryTile: 56,
} as const;

export const theme = { colors, fonts, type, space, radius, size } as const;
export type Theme = typeof theme;
