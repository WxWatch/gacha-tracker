import React from "react";
import { useTheme } from "@mui/material/styles";
import { resolveCurrency } from "@/interfaces/account";
import { useGachaLayoutContext } from "@/components/gacha/GachaLayoutContext";
import { CalendarDatum, ResponsiveTimeRange } from "@nivo/calendar";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import dayjs from "@/utilities/dayjs";
import { getRankType } from "@/interfaces/gacha";
import { borderRadius, spacing, elevation } from "@/theme/tokens";

export default function GachaChartCalendar() {
  const {
    facet,
    gachaRecords: { aggregatedValues },
  } = useGachaLayoutContext();
  const { action: currencyAction } = resolveCurrency(facet);

  // Build calendar data - track highest rarity per day
  const calendars = Object.entries(
    aggregatedValues.values.reduce((acc, cur) => {
      const key = dayjs(cur.time).format("YYYY-MM-DD");
      if (!acc[key]) {
        acc[key] = +getRankType(facet, cur);
      } else {
        acc[key] = Math.max(acc[key], +getRankType(facet, cur));
      }
      return acc;
    }, {} as Record<string, number>)
  ).reduce((acc, [key, value]) => {
    acc.push({ day: key, value });
    return acc;
  }, [] as CalendarDatum[]);

  // Build detailed metadata by day
  const metadataByDay: Record<
    string,
    { total: number; golden: number; purple: number; blue: number }
  > = {};
  Object.entries(aggregatedValues.metadata).forEach(([, value]) => {
    for (const record of value.values) {
      const day = dayjs(record.time).format("YYYY-MM-DD");
      if (!metadataByDay[day]) {
        metadataByDay[day] = { total: 0, golden: 0, purple: 0, blue: 0 };
      }
      if (record.rank_type === "5") {
        metadataByDay[day].golden += 1;
      } else if (record.rank_type === "4") {
        metadataByDay[day].purple += 1;
      } else if (record.rank_type === "3") {
        metadataByDay[day].blue += 1;
      }

      metadataByDay[day].total += 1;
    }
  });

  const now = dayjs();
  const from = dayjs(aggregatedValues.firstTime);

  const theme = useTheme();

  // Calculate some statistics
  const totalDays = calendars.length;
  const daysWithGolden = Object.values(metadataByDay).filter((d) => d.golden > 0).length;
  const avgPullsPerDay =
    totalDays > 0 ? (aggregatedValues.total / totalDays).toFixed(1) : "0";

  return (
    <Stack spacing={`${spacing.xl}px`}>
      <Typography variant="h6" fontWeight={700}>
        ❖ {currencyAction.singular} Activity Calendar
      </Typography>

      {/* Statistics Cards */}
      <Stack direction="row" spacing={2} flexWrap="wrap">
        <Box
          sx={{
            p: `${spacing.md}px`,
            bgcolor: "background.paper",
            borderRadius: `${borderRadius.lg}px`,
            boxShadow: elevation[1],
            border: "1px solid",
            borderColor: "grey.200",
            minWidth: 140,
            textAlign: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Active Days
          </Typography>
          <Typography variant="h5" fontWeight={700} color="primary.main">
            {totalDays}
          </Typography>
        </Box>
        <Box
          sx={{
            p: `${spacing.md}px`,
            bgcolor: "background.paper",
            borderRadius: `${borderRadius.lg}px`,
            boxShadow: elevation[1],
            border: "1px solid",
            borderColor: "#d2ad70",
            minWidth: 140,
            textAlign: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Lucky Days (5★)
          </Typography>
          <Typography variant="h5" fontWeight={700} sx={{ color: "#d2ad70" }}>
            {daysWithGolden}
          </Typography>
        </Box>
        <Box
          sx={{
            p: `${spacing.md}px`,
            bgcolor: "background.paper",
            borderRadius: `${borderRadius.lg}px`,
            boxShadow: elevation[1],
            border: "1px solid",
            borderColor: "grey.200",
            minWidth: 140,
            textAlign: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Avg Pulls/Day
          </Typography>
          <Typography variant="h5" fontWeight={700} color="primary.main">
            {avgPullsPerDay}
          </Typography>
        </Box>
      </Stack>

      {/* Calendar Visualization */}
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
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: `${spacing.md}px` }}>
          Pull Activity Heatmap
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: `${spacing.lg}px`, display: "block" }}>
          Each cell represents a day. Color intensity shows the highest rarity pulled that day.
        </Typography>
        <Box position="relative" width="100%" height={220}>
          <ResponsiveTimeRange
            data={calendars}
            from={from.toDate()}
            to={now.toDate()}
            dayBorderWidth={1}
            dayBorderColor="#ffffff"
            dayRadius={4}
            daySpacing={3}
            minValue={3}
            maxValue={5}
            emptyColor="#f5f5f5"
            colors={["#4d80c8", "#9061d2", "#d2ad70"]} // 3★ blue, 4★ purple, 5★ gold
            margin={{ top: 32, right: 64, bottom: 0, left: 16 }}
            weekdayTicks={[0, 1, 2, 3, 4, 5, 6]}
            weekdayLegendOffset={64}
            firstWeekday="sunday"
            monthLegendPosition="before"
            monthLegendOffset={12}
            theme={{
              fontFamily: "inherit",
              fontSize: 12,
              tooltip: {
                // @ts-ignore
                zIndex: theme.zIndex.drawer + 1,
              },
              text: {
                fill: "#666",
              },
            }}
            tooltip={({ color, day }) => (
              <Box
                component={Paper}
                sx={{
                  bgcolor: "background.paper",
                  p: `${spacing.sm}px`,
                  borderRadius: `${borderRadius.md}px`,
                  boxShadow: elevation[3],
                  border: "1px solid",
                  borderColor: "grey.300",
                  minWidth: 140,
                }}
                elevation={5}
              >
                <Box display="flex" alignItems="center" mb={0.5}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 12,
                      height: 12,
                      borderRadius: 3,
                      backgroundColor: color,
                      marginRight: 8,
                    }}
                  />
                  <Typography variant="body2" fontWeight={600}>
                    {dayjs(day).format("MMM D, YYYY")}
                  </Typography>
                </Box>
                <Box sx={{ pl: 2.5 }}>
                  <Typography variant="body2" color="text.primary">
                    Total: <strong>{metadataByDay[day]?.total || 0}</strong>
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#d2ad70" }}>
                    5★: {metadataByDay[day]?.golden || 0}
                  </Typography>
                  {" · "}
                  <Typography variant="caption" sx={{ color: "#9061d2" }}>
                    4★: {metadataByDay[day]?.purple || 0}
                  </Typography>
                  {" · "}
                  <Typography variant="caption" sx={{ color: "#4d80c8" }}>
                    3★: {metadataByDay[day]?.blue || 0}
                  </Typography>
                </Box>
              </Box>
            )}
            legendFormat={(value) => `${value}★`}
            legends={[
              {
                anchor: "bottom-right",
                direction: "row",
                itemCount: 3,
                itemHeight: 20,
                itemsSpacing: 12,
                itemWidth: 42,
                translateX: -20,
                translateY: -32,
                symbolShape: "circle",
                symbolSize: 10,
              },
            ]}
          />
        </Box>
      </Box>
    </Stack>
  );
}
