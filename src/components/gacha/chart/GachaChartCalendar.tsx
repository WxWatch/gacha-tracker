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

export default function GachaChartCalendar() {
  const {
    facet,
    gachaRecords: { aggregatedValues },
  } = useGachaLayoutContext();
  const { action: currencyAction } = resolveCurrency(facet);

  const calendars = Object.entries(
    aggregatedValues.values.reduce((acc, cur) => {
      const key = dayjs(cur.time).format("YYYY-MM-DD");
      if (!acc[key]) {
        acc[key] = 1;
      } else {
        acc[key] += 1;
      }
      return acc;
    }, {} as Record<string, number>)
  ).reduce((acc, [key, value]) => {
    acc.push({ day: key, value });
    return acc;
  }, [] as CalendarDatum[]);

  const metadataByDay: Record<
    string,
    { golden: number; purple: number; blue: number }
  > = {};
  Object.entries(aggregatedValues.metadata).forEach(([, value]) => {
    for (const record of value.values) {
      const day = dayjs(record.time).format("YYYY-MM-DD");
      if (!metadataByDay[day]) {
        metadataByDay[day] = { golden: 0, purple: 0, blue: 0 };
      }
      if (record.rank_type === "5") {
        metadataByDay[day].golden += 1;
      } else if (record.rank_type === "4") {
        metadataByDay[day].purple += 1;
      } else if (record.rank_type === "3") {
        metadataByDay[day].blue += 1;
      }
    }
  });

  const now = dayjs();
  const from = now.subtract(1, "year");

  const containerRef = React.useRef<HTMLDivElement>(null);

  const theme = useTheme();

  return (
    <Stack direction="column" gap={2}>
      <Typography
        variant="h6"
        gutterBottom
      >{`❖ ${currencyAction.singular} Calendar`}</Typography>
      <Box ref={containerRef} position="relative" width="100%" height={220}>
        <ResponsiveTimeRange
          data={calendars}
          from={from.toDate()}
          to={now.toDate()}
          dayBorderWidth={0}
          dayRadius={99}
          daySpacing={2.5}
          minValue={0}
          maxValue={300}
          emptyColor="#eeeeee"
          colors={["#bbdefb", "#c5e1a5", "#ffa726", "#f44336"]}
          margin={{ top: 32, right: 64, bottom: 0, left: 16 }}
          weekdayTicks={[0, 2, 4, 6]}
          weekdayLegendOffset={64}
          firstWeekday="monday"
          monthLegendPosition="before"
          monthLegendOffset={12}
          theme={{
            fontFamily: "inherit",
            fontSize: 14,
            tooltip: {
              // See: https://github.com/plouc/nivo/blob/0f0a926627c370f4ae0ca435a91573a16d96affc/packages/tooltip/src/TooltipWrapper.tsx#L79-L83
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              zIndex: theme.zIndex.drawer + 1,
            },
          }}
          tooltip={({ color, day, value }) => (
            <Box
              component={Paper}
              position="absolute"
              bgcolor="white"
              width={120}
              top={0}
              right="0.5rem"
              paddingY={0.5}
              paddingX={1}
              elevation={5}
            >
              <Box display="flex" alignItems="center">
                <span
                  style={{
                    display: "inline-block",
                    width: 14,
                    height: 14,
                    borderRadius: 10,
                    backgroundColor: color,
                    marginRight: 8,
                  }}
                />
                <Typography component="span" variant="button">
                  {day}
                </Typography>
              </Box>
              <Box>
                <Typography component="p" variant="button">
                  {`Total：${value}`}
                </Typography>
                <Typography
                  component="p"
                  variant="caption"
                  color="warning.main"
                >
                  {`5★：${metadataByDay[day]?.golden || 0}`}
                </Typography>
                <Typography
                  component="p"
                  variant="caption"
                  color="secondary.main"
                >
                  {`4★: ${metadataByDay[day]?.purple || 0}`}
                </Typography>
                <Typography component="p" variant="caption" color="info.main">
                  {`3★：${metadataByDay[day]?.blue || 0}`}
                </Typography>
              </Box>
            </Box>
          )}
          legendFormat={(value) => `>${value}`}
          legends={[
            {
              anchor: "bottom",
              direction: "row",
              itemCount: 4,
              itemHeight: 20,
              itemsSpacing: 48,
              itemWidth: 48,
              translateX: 0,
              translateY: -48,
              symbolShape: "circle",
            },
          ]}
        />
      </Box>
    </Stack>
  );
}
