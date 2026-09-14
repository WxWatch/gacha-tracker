import { createTheme, Theme } from '@mui/material/styles';
import { enUS } from '@mui/material/locale';
import { AccountFacet } from '@/interfaces/account';
import { GameTheme, GamePalette, RarityColors } from './types';
import { rarityColors, neutralColors, typography } from './tokens';

/**
 * Base Theme Configuration
 * Shared settings across all game themes
 */
const baseThemeConfig = {
  typography: {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
  },
  shape: {
    borderRadius: 8,
  },
};

/**
 * Genshin Impact Theme
 * Brand colors: Paimon Gold (#eddbbb) and Mirage Blue (#1D2A33)
 */
const genshinPalette: GamePalette = {
  primary: {
    main: '#eddbbb', // Paimon Gold
    light: '#f5ebda',
    dark: '#d4c29a',
  },
  secondary: {
    main: '#1D2A33', // Mirage Blue
    light: '#3a4a58',
    dark: '#0d141a',
  },
  accent: {
    main: '#4a9eff', // Celestial Blue
    light: '#7db9ff',
    dark: '#2780e6',
  },
  background: {
    default: '#fafafa',
    paper: '#ffffff',
    elevated: '#f5f5f5',
  },
};

/**
 * Honkai: Star Rail Theme
 * Brand colors: Purple and Gold space-themed palette
 */
const starRailPalette: GamePalette = {
  primary: {
    main: '#9061d2', // Cosmic Purple
    light: '#b18ce6',
    dark: '#7345c6',
  },
  secondary: {
    main: '#d2ad70', // Stellar Gold
    light: '#e4c596',
    dark: '#b8954d',
  },
  accent: {
    main: '#4a9eff', // Star Blue
    light: '#7db9ff',
    dark: '#2780e6',
  },
  background: {
    default: '#fafafa',
    paper: '#ffffff',
    elevated: '#f5f5f5',
  },
};

/**
 * Wuthering Waves Theme
 * Brand colors: Muted tones with golden accent
 */
const wutheringWavesPalette: GamePalette = {
  primary: {
    main: '#ddbf61', // Muted Gold
    light: '#ead89f',
    dark: '#c4a544',
  },
  secondary: {
    main: '#4f5551', // Storm Gray
    light: '#72776f',
    dark: '#3a3e3b',
  },
  accent: {
    main: '#8cb94b', // Wave Green
    light: '#a8d372',
    dark: '#6d9a2f',
  },
  background: {
    default: '#fafafa',
    paper: '#ffffff',
    elevated: '#f5f5f5',
  },
};

/**
 * Zenless Zone Zero Theme
 * Brand colors: Urban/cyberpunk with teal accents
 */
const zenlessPalette: GamePalette = {
  primary: {
    main: '#00d9d9', // Neon Teal/Cyan
    light: '#4dffff',
    dark: '#00a6a6',
  },
  secondary: {
    main: '#2b2153', // Deep Purple
    light: '#4a3a7a',
    dark: '#1a1330',
  },
  accent: {
    main: '#fbbf24', // Electric Yellow
    light: '#fcd34d',
    dark: '#f59e0b',
  },
  background: {
    default: '#fafafa',
    paper: '#ffffff',
    elevated: '#f5f5f5',
  },
};

/**
 * Default Theme (for Home/Settings)
 * Neutral gray palette
 */
const defaultPalette: GamePalette = {
  primary: {
    main: '#424242',
    light: '#6d6d6d',
    dark: '#1b1b1b',
  },
  secondary: {
    main: '#9e9e9e',
    light: '#cfcfcf',
    dark: '#707070',
  },
  background: {
    default: '#fafafa',
    paper: '#ffffff',
    elevated: '#f5f5f5',
  },
};

/**
 * Create a game-specific theme
 */
function createGameTheme(
  gameName: string,
  palette: GamePalette,
  rarity: RarityColors = rarityColors
): GameTheme {
  const muiTheme = createTheme(
    {
      ...baseThemeConfig,
      palette: {
        primary: palette.primary,
        secondary: palette.secondary,
        background: palette.background,
        grey: {
          50: neutralColors.gray50,
          100: neutralColors.gray100,
          200: neutralColors.gray200,
          300: neutralColors.gray300,
          400: neutralColors.gray400,
          500: neutralColors.gray500,
          600: neutralColors.gray600,
          700: neutralColors.gray700,
          800: neutralColors.gray800,
          900: neutralColors.gray900,
        },
      },
    },
    enUS
  );

  // Extend the theme with game-specific properties
  return {
    ...muiTheme,
    game: {
      name: gameName,
      palette,
      rarity,
    },
  } as GameTheme;
}

/**
 * Export game-specific themes
 */
export const genshinTheme = createGameTheme('Genshin Impact', genshinPalette);
export const starRailTheme = createGameTheme('Honkai: Star Rail', starRailPalette);
export const wutheringWavesTheme = createGameTheme('Wuthering Waves', wutheringWavesPalette);
export const zenlessTheme = createGameTheme('Zenless Zone Zero', zenlessPalette);
export const defaultTheme = createGameTheme('Default', defaultPalette);

/**
 * Get theme by account facet
 */
export function getThemeByFacet(facet?: AccountFacet): GameTheme {
  switch (facet) {
    case AccountFacet.Genshin:
      return genshinTheme;
    case AccountFacet.StarRail:
      return starRailTheme;
    case AccountFacet.WutheringWaves:
      return wutheringWavesTheme;
    // Add support for Zenless Zone Zero when the facet is added
    // case AccountFacet.ZenlessZoneZero:
    //   return zenlessTheme;
    default:
      return defaultTheme;
  }
}

/**
 * Export all themes as a map for easy access
 */
export const themes = {
  genshin: genshinTheme,
  starrail: starRailTheme,
  wutheringwaves: wutheringWavesTheme,
  zenless: zenlessTheme,
  default: defaultTheme,
} as const;
