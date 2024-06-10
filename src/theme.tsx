import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { enUS } from "@mui/material/locale";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import "@/assets/global.css";
import { fontFamily, fontSize, palette } from "@mui/system";

const baseTheme = {
  typography: {
    fontFamily: "汉仪文黑-85W",
    fontSize: 14,
  },
};

const theme = createTheme(baseTheme, enUS);

export default function Theme(props: React.PropsWithChildren) {
  return (
    <ThemeProvider theme={theme}>
      <Box display="flex">
        <CssBaseline />
        {props.children}
      </Box>
    </ThemeProvider>
  );
}

const genshinTheme = createTheme(
  {
    ...baseTheme,
    palette: {
      primary: {
        main: "#eddbbb", // Paimon Gold
      },
      secondary: {
        main: "#011138", // Paimon Blue
      },
    },
  },
  enUS
);
