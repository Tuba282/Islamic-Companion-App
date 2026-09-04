export type ThemeName = 'dark' | 'light' | 'navy';
export type AccentName = 'gold' | 'green' | 'blue' | 'purple' | 'red';

export type ColorTokens = {
  text: string;
  tint: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  gold: string;
  goldSoft: string;
  surface: string;
  surfaceRaised: string;
  success: string;
  successSoft: string;
};

const accentColors: Record<AccentName, string> = {
  gold: '#D7B56D',
  green: '#69B38C',
  blue: '#68A9D6',
  purple: '#AA8AC7',
  red: '#D9877E',
};

export const createPalette = (
  theme: ThemeName = 'dark',
  accent: AccentName = 'gold',
): ColorTokens => {
  const isLight = theme === 'light';
  const isNavy = theme === 'navy';
  const accentColor = accentColors[accent];
  const background = isLight ? '#F5F0E6' : isNavy ? '#101B32' : '#062B27';
  const surface = isLight ? '#FFFDF8' : isNavy ? '#172743' : '#0B3A33';
  const raised = isLight ? '#F0E7D5' : isNavy ? '#203251' : '#12453B';
  const foreground = isLight ? '#17352E' : '#F3EBD8';
  const muted = isLight ? '#E6DDCC' : isNavy ? '#1A2943' : '#104138';
  const mutedForeground = isLight ? '#6C766C' : '#AAB9AA';
  const border = isLight ? '#DED2BC' : '#1E584A';
  return {
    text: foreground,
    tint: accentColor,
    background,
    foreground,
    card: surface,
    cardForeground: foreground,
    primary: accentColor,
    primaryForeground: '#17352E',
    secondary: raised,
    secondaryForeground: foreground,
    muted,
    mutedForeground,
    accent: raised,
    accentForeground: foreground,
    destructive: '#D97870',
    destructiveForeground: '#FFF9F0',
    border,
    input: border,
    gold: accentColor,
    goldSoft: isLight ? '#F1E1B7' : '#293F32',
    surface,
    surfaceRaised: raised,
    success: '#6CC38D',
    successSoft: isLight ? '#DCEEDC' : '#183F35',
  };
};

const colors = {
  light: createPalette('light', 'gold'),
  dark: createPalette('dark', 'gold'),
  radius: 18,
  accentColors,
};

export default colors;