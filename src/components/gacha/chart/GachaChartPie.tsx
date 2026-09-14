import React from "react";
import { AccountFacet } from "@/interfaces/account";

import { useGachaLayoutContext } from "@/components/gacha/GachaLayoutContext";
import { ResponsivePie, PieSvgProps, MayHaveLabel } from "@nivo/pie";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { getItemType } from "@/interfaces/gacha";
import { GameTheme } from "@/theme/types";
import { borderRadius, spacing, elevation } from "@/theme/tokens";

export default function GachaChartPie() {
  const theme = useTheme() as GameTheme;
  const {
    facet,
    gachaRecords: {
      aggregatedValues,
      namedValues: { character, weapon, permanent, beginner },
    },
  } = useGachaLayoutContext();

  const itemTypesData = aggregatedValues.values.reduce((acc, cur) => {
    const key = getItemType(facet, cur);
    if (!acc[key]) {
      acc[key] = 1;
    } else {
      acc[key] += 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Rarity colors
  const rarityColors = ["#4d80c8", "#9061d2", "#d2ad70"]; // 3★, 4★, 5★

  // Banner type colors - use theme colors
  const bannerColors = React.useMemo(() => {
    const palette = theme.game?.palette || theme.palette;
    return [
      palette.primary.main,
      palette.secondary.main,
      theme.palette.info.main,
      theme.palette.warning.main,
    ];
  }, [theme]);

  const pieProps: Partial<PieSvgProps<MayHaveLabel & Record<string, unknown>>> = {
    margin: { top: 20, right: 40, bottom: 60, left: 20 },
    innerRadius: 0.5,
    padAngle: 2,
    cornerRadius: 4,
    activeOuterRadiusOffset: 8,
    borderWidth: 2,
    borderColor: { from: "color", modifiers: [["darker", 0.3]] },
    arcLinkLabelsSkipAngle: 10,
    arcLinkLabelsTextColor: "#333333",
    arcLinkLabelsThickness: 2,
    arcLinkLabelsColor: { from: "color" },
    arcLabelsSkipAngle: 10,
    arcLabelsTextColor: "#ffffff",
    legends: [
      {
        anchor: "bottom",
        direction: "row",
        justify: false,
        translateX: 0,
        translateY: 50,
        itemsSpacing: 8,
        itemWidth: 80,
        itemHeight: 18,
        itemTextColor: "#999",
        itemDirection: "left-to-right",
        itemOpacity: 1,
        symbolSize: 14,
        symbolShape: "circle",
      },
    ],
  };

  const totalPulls = aggregatedValues.total;
  const goldenCount = aggregatedValues.metadata.golden.sum;
  const purpleCount = aggregatedValues.metadata.purple.sum;
  const blueCount = aggregatedValues.metadata.blue.sum;

  return (
    <Stack spacing={`${spacing.xl}px`}>
      <Typography variant="h6" fontWeight={700}>
        ❖ Distribution Analysis
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <Box
            sx={{
              p: `${spacing.md}px`,
              bgcolor: "background.paper",
              borderRadius: `${borderRadius.lg}px`,
              boxShadow: elevation[1],
              border: "1px solid",
              borderColor: "grey.200",
              textAlign: "center",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Total Pulls
            </Typography>
            <Typography variant="h4" fontWeight={700} color="primary.main">
              {totalPulls}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box
            sx={{
              p: `${spacing.md}px`,
              bgcolor: "background.paper",
              borderRadius: `${borderRadius.lg}px`,
              boxShadow: elevation[1],
              border: "1px solid",
              borderColor: "#d2ad70",
              textAlign: "center",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              5★ Items
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ color: "#d2ad70" }}>
              {goldenCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {((goldenCount / totalPulls) * 100).toFixed(1)}%
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box
            sx={{
              p: `${spacing.md}px`,
              bgcolor: "background.paper",
              borderRadius: `${borderRadius.lg}px`,
              boxShadow: elevation[1],
              border: "1px solid",
              borderColor: "#9061d2",
              textAlign: "center",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              4★ Items
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ color: "#9061d2" }}>
              {purpleCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {((purpleCount / totalPulls) * 100).toFixed(1)}%
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Box
            sx={{
              p: `${spacing.md}px`,
              bgcolor: "background.paper",
              borderRadius: `${borderRadius.lg}px`,
              boxShadow: elevation[1],
              border: "1px solid",
              borderColor: "#4d80c8",
              textAlign: "center",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              3★ Items
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ color: "#4d80c8" }}>
              {blueCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {((blueCount / totalPulls) * 100).toFixed(1)}%
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Pie Charts */}
      <Grid container spacing={3}>
        {/* Rarity Distribution */}
        <Grid item xs={12} md={4}>
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
              variant="subtitle1"
              fontWeight={600}
              sx={{ mb: `${spacing.sm}px`, textAlign: "center" }}
            >
              Rarity Distribution
            </Typography>
            <Box width="100%" height={280}>
              <ResponsivePie
                {...pieProps}
                data={[
                  { id: "3★", label: "3★", value: blueCount },
                  { id: "4★", label: "4★", value: purpleCount },
                  { id: "5★", label: "5★", value: goldenCount },
                ]}
                colors={rarityColors}
              />
            </Box>
          </Box>
        </Grid>

        {/* Item Type Distribution */}
        <Grid item xs={12} md={4}>
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
              variant="subtitle1"
              fontWeight={600}
              sx={{ mb: `${spacing.sm}px`, textAlign: "center" }}
            >
              Item Type
            </Typography>
            <Box width="100%" height={280}>
              <ResponsivePie
                {...pieProps}
                data={[
                  {
                    id: "Character",
                    label: "Characters",
                    value: itemTypesData.Character || 0,
                  },
                  {
                    id: facet === AccountFacet.Genshin ? "Weapon" : "Light Cone",
                    label: facet === AccountFacet.Genshin ? "Weapons" : "Light Cones",
                    value:
                      itemTypesData[
                      facet === AccountFacet.Genshin ? "Weapon" : "Light Cone"
                      ] || 0,
                  },
                ]}
                colors={[bannerColors[0], bannerColors[1]]}
              />
            </Box>
          </Box>
        </Grid>

        {/* Banner Distribution */}
        <Grid item xs={12} md={4}>
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
              variant="subtitle1"
              fontWeight={600}
              sx={{ mb: `${spacing.sm}px`, textAlign: "center" }}
            >
              Banner Distribution
            </Typography>
            <Box width="100%" height={280}>
              <ResponsivePie
                {...pieProps}
                data={[
                  { id: "Character", label: character.categoryTitle, value: character.total },
                  {
                    id: facet === AccountFacet.Genshin ? "Weapon" : "Light Cone",
                    label: weapon.categoryTitle,
                    value: weapon.total,
                  },
                  { id: "Permanent", label: permanent.categoryTitle, value: permanent.total },
                  ...(beginner.total > 0
                    ? [{ id: "Beginner", label: beginner.categoryTitle, value: beginner.total }]
                    : []),
                ]}
                colors={bannerColors}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}
