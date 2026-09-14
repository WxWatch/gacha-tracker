import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { spacing, borderRadius } from "@/theme/tokens";

export default function GachaOverviewTooltips() {
  return (
    <Box
      sx={{
        p: `${spacing.md}px`,
        bgcolor: "info.light",
        borderRadius: `${borderRadius.lg}px`,
        border: "1px solid",
        borderColor: "info.main",
        opacity: 0.8,
      }}
    >
      <Typography variant="caption" color="info.dark" sx={{ fontWeight: 500 }}>
        ℹ️ Due to official settings, there is a delay of about one hour in the
        latest data. Please refer to the in-game data for the specific time.
      </Typography>
    </Box>
  );
}
