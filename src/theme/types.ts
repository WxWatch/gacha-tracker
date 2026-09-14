import { Theme } from '@mui/material/styles';

/**
 * Rarity Color Set
 * Defines colors for a specific rarity level
 */
export interface RarityColorSet {
  main: string;
  light: string;
  dark: string;
  gradient: string;
}

/**
 * Rarity Colors Mapping
 * Maps rarity levels to their color sets
 */
export interface RarityColors {
  three: RarityColorSet;
  four: RarityColorSet;
  five: RarityColorSet;
}

/**
 * Game-Specific Palette
 * Defines the color scheme for a specific game
 */
export interface GamePalette {
  primary: {
    main: string;
    light: string;
    dark: string;
  };
  secondary: {
    main: string;
    light: string;
    dark: string;
  };
  accent?: {
    main: string;
    light: string;
    dark: string;
  };
  background: {
    default: string;
    paper: string;
    elevated: string;
  };
}

/**
 * Extended Theme Interface
 * Extends Material-UI's Theme with game-specific properties
 */
export interface GameTheme extends Theme {
  game: {
    name: string;
    palette: GamePalette;
    rarity: RarityColors;
  };
}

/**
 * Theme Mode
 * Currently only supporting light mode, but structured for future dark mode support
 */
export type ThemeMode = 'light' | 'dark';
