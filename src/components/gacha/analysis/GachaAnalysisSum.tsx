import React from "react";
import { GachaRecords, NamedGachaRecords } from "@/hooks/useGachaRecordsQuery";
import { useGachaLayoutContext } from "@/components/gacha/GachaLayoutContext";
import { SxProps, Theme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { borderRadius, spacing, elevation } from "@/theme/tokens";

export default function GachaAnalysisSum() {
  const { gachaRecords } = useGachaLayoutContext();
  const {
    namedValues: { character, weapon, permanent, beginner },
    aggregatedValues,
  } = gachaRecords;

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: `${spacing.md}px` }}>
        ❖ Data Ratio
      </Typography>
      <Stack
        flexDirection="row"
        gap={`${spacing.md}px`}
        sx={{
          overflowX: "auto",
          pb: 1,
        }}
      >
        <GachaAnalysisSumCol
          title="Total / Rate"
          values={["5★", "4★", "3★", "Total"]}
        />
        <GachaAnalysisSumCol
          title={character.categoryTitle}
          values={computeNamedGachaRecordsValues(character)}
        />
        <GachaAnalysisSumCol
          title={weapon.categoryTitle}
          values={computeNamedGachaRecordsValues(weapon)}
        />
        <GachaAnalysisSumCol
          title={permanent.categoryTitle}
          values={computeNamedGachaRecordsValues(permanent)}
        />
        <GachaAnalysisSumCol
          title={beginner.categoryTitle}
          values={computeNamedGachaRecordsValues(beginner)}
        />
        <GachaAnalysisSumCol
          title="Total"
          values={computeNamedGachaRecordsValues(aggregatedValues)}
        />
      </Stack>
    </Box>
  );
}

function computeNamedGachaRecordsValues(
  data: NamedGachaRecords | GachaRecords["aggregatedValues"]
) {
  const {
    metadata: { golden, purple, blue },
    total,
  } = data;
  return [
    [golden.sum, golden.sumPercentage + "%", "#d2ad70"], // 5★ - Gold
    [purple.sum, purple.sumPercentage + "%", "#9061d2"], // 4★ - Purple
    [blue.sum, blue.sumPercentage + "%", "#4d80c8"], // 3★ - Blue
    [total, total > 0 ? "100%" : "0%"],
  ];
}

function GachaAnalysisSumCol(props: {
  title: React.ReactNode;
  values: [React.ReactNode, React.ReactNode, string?][] | React.ReactNode[];
}) {
  const { title, values } = props;
  return (
    <Stack
      sx={{
        minWidth: 140,
        flexGrow: 1,
        borderRadius: `${borderRadius.lg}px`,
        overflow: "hidden",
        boxShadow: elevation[1],
        border: "1px solid",
        borderColor: "grey.200",
        bgcolor: "background.paper",
      }}
    >
      <Typography
        variant="body2"
        textAlign="center"
        sx={{
          bgcolor: "grey.100",
          py: 1,
          px: 1.5,
          fontWeight: 700,
          borderBottom: "1px solid",
          borderColor: "grey.200",
        }}
      >
        {title}
      </Typography>
      {values.map((value, index) =>
        Array.isArray(value) ? (
          <Box
            key={index}
            textAlign="center"
            sx={{
              py: 1,
              px: 1.5,
              borderBottom: index < values.length - 1 ? "1px solid" : "none",
              borderColor: "grey.200",
            }}
          >
            <Typography
              component="span"
              fontWeight={600}
              sx={{ color: value[2] || "text.primary" }}
            >
              {value[0]}
            </Typography>
            <Typography component="span" sx={{ mx: 1, color: "grey.400" }}>
              /
            </Typography>
            <Typography
              component="span"
              variant="body2"
              sx={{ color: value[2] || "text.secondary" }}
            >
              {value[1]}
            </Typography>
          </Box>
        ) : (
          <Typography
            key={index}
            textAlign="center"
            sx={{
              bgcolor: "grey.50",
              py: 1,
              px: 1.5,
              fontWeight: 700,
              borderBottom: index < values.length - 1 ? "1px solid" : "none",
              borderColor: "grey.200",
            }}
          >
            {value}
          </Typography>
        )
      )}
    </Stack>
  );
}
