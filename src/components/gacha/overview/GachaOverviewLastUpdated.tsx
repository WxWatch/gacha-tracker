import React from "react";
import { useGachaLayoutContext } from "@/components/gacha/GachaLayoutContext";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import { spacing, borderRadius, elevation } from "@/theme/tokens";

export default function GachaOverviewLastUpdated() {
  const { selectedAccount } = useGachaLayoutContext();
  const lastGachaUpdated = selectedAccount.properties?.lastGachaUpdated;

  return (
    <Box
      sx={{
        p: `${spacing.md}px`,
        bgcolor: "background.paper",
        borderRadius: `${borderRadius.lg}px`,
        boxShadow: elevation[1],
        border: "1px solid",
        borderColor: "grey.200",
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontWeight: 500 }}
      >
        <Typography
          component="span"
          variant="inherit"
          sx={{ color: "text.primary", fontWeight: 600 }}
        >{`Last updated: `}</Typography>
        <Typography component="span" variant="inherit">
          {lastGachaUpdated ? dayjs(lastGachaUpdated).format("LLLL") : "unknown"}
        </Typography>
      </Typography>
    </Box>
  );
}
