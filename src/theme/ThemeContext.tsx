import React, { createContext, useContext, useMemo } from 'react';
import { AccountFacet } from '@/interfaces/account';
import { GameTheme } from './types';
import { getThemeByFacet, defaultTheme } from './themes';

/**
 * Theme Context Value
 */
interface ThemeContextValue {
  theme: GameTheme;
  facet?: AccountFacet;
}

/**
 * Theme Context
 */
const ThemeContext = createContext<ThemeContextValue>({
  theme: defaultTheme,
  facet: undefined,
});

/**
 * Theme Context Provider Props
 */
interface ThemeContextProviderProps {
  facet?: AccountFacet;
  children: React.ReactNode;
}

/**
 * Theme Context Provider
 * Provides the active game theme based on the current facet
 */
export function ThemeContextProvider({
  facet,
  children,
}: ThemeContextProviderProps) {
  const theme = useMemo(() => getThemeByFacet(facet), [facet]);

  const value = useMemo(
    () => ({
      theme,
      facet,
    }),
    [theme, facet]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Hook to access the game theme
 * Returns the full GameTheme object with game-specific properties
 */
export function useGameTheme(): GameTheme {
  const { theme } = useContext(ThemeContext);
  return theme;
}

/**
 * Hook to access rarity colors
 * Provides easy access to rarity-specific colors
 */
export function useRarityColors() {
  const { theme } = useContext(ThemeContext);
  return theme.game.rarity;
}

/**
 * Hook to access the current game facet
 */
export function useCurrentFacet(): AccountFacet | undefined {
  const { facet } = useContext(ThemeContext);
  return facet;
}

/**
 * Hook to access the game palette
 */
export function useGamePalette() {
  const { theme } = useContext(ThemeContext);
  return theme.game.palette;
}
