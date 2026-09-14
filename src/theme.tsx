import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import { AccountFacet } from "@/interfaces/account";
import { ThemeContextProvider, useGameTheme } from "@/theme/ThemeContext";
import "@/assets/global.css";

interface ThemeProps extends React.PropsWithChildren {
  facet?: AccountFacet;
}

/**
 * Inner Theme Component
 * Provides MUI ThemeProvider with the active game theme
 */
function InnerTheme(props: React.PropsWithChildren) {
  const theme = useGameTheme();

  return (
    <ThemeProvider theme={theme}>
      <Box display="flex">
        <CssBaseline />
        {props.children}
      </Box>
    </ThemeProvider>
  );
}

/**
 * Theme Component
 * Main theme wrapper that provides both ThemeContext and MUI ThemeProvider
 * @param facet - The game facet to determine which theme to apply
 */
export default function Theme({ facet, children }: ThemeProps) {
  return (
    <ThemeContextProvider facet={facet}>
      <InnerTheme>{children}</InnerTheme>
    </ThemeContextProvider>
  );
}
