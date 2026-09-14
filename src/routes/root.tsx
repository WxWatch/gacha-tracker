import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { AccountFacet } from "@/interfaces/account";
import { ThemeContextProvider, useGameTheme } from "@/theme/ThemeContext";
import Sidebar from "@/components/Sidebar";
import Content from "@/components/Content";

/**
 * Determine the game facet based on the current route path
 */
function getFacetFromPath(pathname: string): AccountFacet | undefined {
  if (pathname.startsWith('/genshin')) {
    return AccountFacet.Genshin;
  }
  if (pathname.startsWith('/starrail')) {
    return AccountFacet.StarRail;
  }
  if (pathname.startsWith('/wutheringwaves')) {
    return AccountFacet.WutheringWaves;
  }
  // Add Zenless Zone Zero when the route is created
  // if (pathname.startsWith('/zenless')) {
  //   return AccountFacet.ZenlessZoneZero;
  // }
  return undefined; // Home, Settings, or other routes use default theme
}

/**
 * Inner component that uses the theme from context
 */
function ThemedContent() {
  const theme = useGameTheme();

  // Debug logging to verify theme switching
  React.useEffect(() => {
    console.log('🎨 Theme changed:', theme.game.name, {
      primary: theme.game.palette.primary.main,
      secondary: theme.game.palette.secondary.main,
    });
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <Sidebar />
      <Content>
        <Outlet />
      </Content>
    </ThemeProvider>
  );
}

export default function Root() {
  const location = useLocation();
  const facet = React.useMemo(
    () => getFacetFromPath(location.pathname),
    [location.pathname]
  );

  return (
    <ThemeContextProvider facet={facet}>
      <ThemedContent />
    </ThemeContextProvider>
  );
}
