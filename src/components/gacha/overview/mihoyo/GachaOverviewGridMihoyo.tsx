import React from "react";
import { AccountFacet } from "@/interfaces/account";
import { useGachaLayoutContext } from "@/components/gacha/GachaLayoutContext";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Divider from "@mui/material/Divider";
import GachaItemView from "../../GachaItemView";
import {
  AdvancedMihoyoRecordsMetadata,
  MihoyoRecords,
  NamedMihoyoRecords,
} from "@/hooks/useMihoyoRecordsQuery";
import { borderRadius, elevation, spacing, transitions, easing } from "@/theme/tokens";

export default function GachaOverviewGridMihoyo() {
  const { facet, gachaRecords } = useGachaLayoutContext();
  const {
    namedValues: { character, weapon, permanent, beginner },
    aggregatedValues,
  } = gachaRecords as MihoyoRecords;

  // Calculate global statistics
  const totalPulls = aggregatedValues.total;
  const total5Star = aggregatedValues.metadata.golden.sum;
  const total4Star = aggregatedValues.metadata.purple.sum;
  const rate5Star = aggregatedValues.metadata.golden.sumPercentage;
  const rate4Star = aggregatedValues.metadata.purple.sumPercentage;
  const avg5StarPity = aggregatedValues.metadata.golden.sumAverage;
  const current5StarPity = aggregatedValues.metadata.golden.nextPity;

  // Find best and worst 5★ luck
  const all5Stars = [
    ...character.metadata.golden.values,
    ...weapon.metadata.golden.values,
    ...permanent.metadata.golden.values,
    ...beginner.metadata.golden.values,
  ];
  const bestLuck = all5Stars.length > 0
    ? Math.min(...all5Stars.map(item => item.usedPity))
    : 0;
  const worstLuck = all5Stars.length > 0
    ? Math.max(...all5Stars.map(item => item.usedPity))
    : 0;

  return (
    <Stack direction="column" spacing={`${spacing.xl}px`}>
      {/* Global Statistics Section */}
      <Box>
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ mb: `${spacing.md}px`, color: "text.primary" }}
        >
          📊 Overall Statistics
        </Typography>

        <Grid container spacing={`${spacing.md}px`}>
          <Grid item xs={6} sm={4} md={3}>
            <StatCard
              title="Total Pulls"
              value={totalPulls}
              color="primary.main"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <StatCard
              title="5★ Obtained"
              value={total5Star}
              subtitle={`${rate5Star.toFixed(2)}%`}
              color="#d2ad70"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <StatCard
              title="4★ Obtained"
              value={total4Star}
              subtitle={`${rate4Star.toFixed(2)}%`}
              color="#9061d2"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <StatCard
              title="Avg 5★ Pity"
              value={avg5StarPity}
              color="info.main"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <StatCard
              title="Best Luck"
              value={bestLuck}
              subtitle="pulls"
              color="success.main"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <StatCard
              title="Worst Luck"
              value={worstLuck}
              subtitle="pulls"
              color="error.main"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <StatCard
              title="Current Pity"
              value={current5StarPity}
              subtitle={`${Math.round((current5StarPity / 90) * 100)}%`}
              color="warning.main"
            />
          </Grid>
        </Grid>
      </Box>

      <Divider />

      {/* Banner Statistics */}
      <Box>
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ mb: `${spacing.md}px`, color: "text.primary" }}
        >
          🎯 Banner Insights
        </Typography>

        <Stack direction="column" spacing={`${spacing.lg}px`}>
          {character.total !== 0 && (
            <BannerStatCard facet={facet} banner={character} />
          )}
          {weapon.total !== 0 && (
            <BannerStatCard facet={facet} banner={weapon} />
          )}
          {permanent.total !== 0 && (
            <BannerStatCard facet={facet} banner={permanent} />
          )}
        </Stack>
      </Box>
    </Stack>
  );
}

// Compact stat card component
function StatCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: number;
  subtitle?: string;
  color: string;
}) {
  return (
    <Box
      sx={{
        p: `${spacing.md}px`,
        bgcolor: "background.paper",
        borderRadius: `${borderRadius.lg}px`,
        boxShadow: elevation[1],
        border: "1px solid",
        borderColor: "grey.200",
        textAlign: "center",
        transition: `all ${transitions.normal} ${easing.easeOut}`,
        "&:hover": {
          boxShadow: elevation[2],
          transform: "translateY(-2px)",
        },
      }}
    >
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {title}
      </Typography>
      <Typography
        variant="h4"
        fontWeight={700}
        sx={{ color, my: 0.5 }}
      >
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

// Banner-specific statistics card
function BannerStatCard({
  facet,
  banner,
}: {
  facet: AccountFacet;
  banner: NamedMihoyoRecords;
}) {
  const { categoryTitle, total, metadata } = banner;
  const { golden, purple } = metadata;

  // Calculate pity progress (assuming 90 is hard pity)
  const pityProgress = (golden.nextPity / 90) * 100;
  const last5Star = golden.values[golden.values.length - 1];

  return (
    <Box
      sx={{
        p: `${spacing.lg}px`,
        bgcolor: "background.paper",
        borderRadius: `${borderRadius.xl}px`,
        boxShadow: elevation[2],
        border: "1px solid",
        borderColor: "grey.200",
      }}
    >
      {/* Banner Title */}
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ mb: `${spacing.md}px`, color: "primary.main" }}
      >
        {categoryTitle}
      </Typography>

      <Grid container spacing={`${spacing.md}px`}>
        {/* Statistics Grid */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={`${spacing.sm}px`}>
            <Grid item xs={6}>
              <MiniStat label="Total Pulls" value={total} />
            </Grid>
            <Grid item xs={6}>
              <MiniStat label="5★ Count" value={golden.sum} color="#d2ad70" />
            </Grid>
            <Grid item xs={6}>
              <MiniStat label="4★ Count" value={purple.sum} color="#9061d2" />
            </Grid>
            <Grid item xs={6}>
              <MiniStat label="Avg Pity" value={golden.sumAverage} />
            </Grid>
          </Grid>

          {/* Pity Progress */}
          <Box sx={{ mt: `${spacing.md}px` }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                Current Pity
              </Typography>
              <Typography variant="caption" fontWeight={700} color="warning.main">
                {golden.nextPity} / 90
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(pityProgress, 100)}
              sx={{
                height: 8,
                borderRadius: `${borderRadius.sm}px`,
                bgcolor: "grey.200",
                "& .MuiLinearProgress-bar": {
                  borderRadius: `${borderRadius.sm}px`,
                  background: pityProgress >= 75
                    ? "linear-gradient(90deg, #ff9800, #f44336)"
                    : "linear-gradient(90deg, #2196f3, #4caf50)",
                },
              }}
            />
          </Box>
        </Grid>

        {/* Latest 5★ Item */}
        <Grid item xs={12} md={6}>
          {last5Star ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Latest 5★
              </Typography>
              <Box sx={{ position: "relative" }}>
                <GachaItemView
                  facet={facet}
                  item={last5Star}
                  size={100}
                  usedPity={last5Star.usedPity}
                />
                <Typography
                  variant="caption"
                  sx={{
                    mt: 0.5,
                    fontWeight: 500,
                    color: "text.secondary",
                    textAlign: "center",
                    display: "block",
                  }}
                >
                  {last5Star.name}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Typography variant="body2" color="text.disabled">
                No 5★ items yet
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

// Mini stat component for banner cards
function MiniStat({
  label,
  value,
  color = "text.primary",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <Box
      sx={{
        p: `${spacing.sm}px`,
        bgcolor: "grey.50",
        borderRadius: `${borderRadius.md}px`,
        textAlign: "center",
      }}
    >
      <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
        {label}
      </Typography>
      <Typography variant="h6" fontWeight={700} sx={{ color }}>
        {value}
      </Typography>
    </Box>
  );
}
