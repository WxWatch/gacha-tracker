import React from "react";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import queryClient from "@/query-client";
import router from "@/router";
import "@/assets/global.css";

export default function App() {
  // HACK: Disable context menu in production
  React.useEffect(() => {
    if (import.meta.env.PROD) {
      const listener = (evt: Event) => evt.preventDefault();
      document.addEventListener("contextmenu", listener);
      return () => {
        document.removeEventListener("contextmenu", listener);
      };
    }
  }, []);

  return (
    <Box display="flex">
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools position="bottom-right" />
      </QueryClientProvider>
    </Box>
  );
}
