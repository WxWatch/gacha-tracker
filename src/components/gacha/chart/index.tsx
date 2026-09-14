import React from "react";
import GachaChartCalendar from "@/components/gacha/chart/GachaChartCalendar";
import GachaChartPie from "@/components/gacha/chart/GachaChartPie";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { spacing } from "@/theme/tokens";

export default function GachaChart() {
  return (
    <Stack spacing={`${spacing.xl}px`}>
      <GachaChartCalendar />
      <Divider />
      <GachaChartPie />
    </Stack>
  );
}
