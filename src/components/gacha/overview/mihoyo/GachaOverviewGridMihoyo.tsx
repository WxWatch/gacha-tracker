import React from "react";
import { AccountFacet } from "@/interfaces/account";
import { useGachaLayoutContext } from "@/components/gacha/GachaLayoutContext";
import { SxProps, Theme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import GachaItemView from "../../GachaItemView";
import {
  AdvancedMihoyoRecordsMetadata,
  MihoyoRecords,
  NamedMihoyoRecords,
} from "@/hooks/useMihoyoRecordsQuery";

export default function GachaOverviewGridMihoyo() {
  const { facet, gachaRecords } = useGachaLayoutContext();
  const {
    namedValues: { character, weapon, permanent, beginner },
    aggregatedValues,
  } = gachaRecords as MihoyoRecords;

  return (
    <Box>
      {/* <Grid spacing={2} container> */}
      {character.total === 0 || (
        // <Grid xs={6} item>
        <Box>
          <GachaOverviewCard facet={facet} value={character} />
          <Divider />
        </Box>
        // {/* </Grid> */}
      )}

      {weapon.total === 0 || (
        // <Grid xs={6} item>
        <Box>
          <GachaOverviewCard facet={facet} value={weapon} />
          <Divider />
        </Box>
        // {/* </Grid> */}
      )}

      {permanent.total === 0 || (
        // <Grid xs={6} item>
        <Box>
          <GachaOverviewCard facet={facet} value={permanent} />
          <Divider />
        </Box>
        // {/* </Grid> */}
      )}
      {/* <Grid xs={6} item> */}
      <Box>
        <GachaOverviewCard
          facet={facet}
          value={aggregatedValues}
          newbie={beginner}
        />
        <Divider />
      </Box>

      {/* </Grid> */}
      {/* </Grid> */}
    </Box>
  );
}

const GachaOverviewGridCardSx: SxProps<Theme> = {
  gap: 2,
  position: "relative",
  height: "100%",
  border: 1.5,
  borderRadius: 2,
  borderColor: "grey.300",
  bgcolor: "grey.100",
  userSelect: "none",
  "& .category": {
    position: "absolute",
    top: 0,
    right: 0,
    paddingX: 2,
    paddingY: 0.5,
    color: "#efefef",
    borderLeft: 2,
    borderBottom: 2,
    borderColor: "inherit",
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 6,
    bgcolor: "success.light",
    '&[data-aggregated="true"]': { bgcolor: "warning.light" },
  },
  "& .labels": {
    gap: 1,
    // fontSize: "1rem",
    "& > .MuiStack-root": { flexDirection: "row", gap: 1 },
    "& > .MuiStack-root > .MuiChip-root": { fontSize: "inherit" },
  },
};

function Statistic({
  title,
  statistic,
  suffix,
}: {
  title: string;
  statistic: number;
  suffix?: string;
}) {
  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      sx={{ bgcolor: "primary.light", padding: "8px 12px", borderRadius: 2 }}
    >
      <Typography>{title}</Typography>
      <Typography variant="h5">
        {statistic}
        {suffix}
      </Typography>
    </Stack>
  );
}

function GachaOverviewCard({
  facet,
  value,
}: {
  facet: AccountFacet;
  value: NamedMihoyoRecords | MihoyoRecords["aggregatedValues"];
  newbie?: NamedMihoyoRecords;
}) {
  const {
    total,
    metadata: { golden, purple },
  } = value;
  const categoryTitle =
    "categoryTitle" in value ? value.categoryTitle : "Total";

  if (total === 0) {
    return (
      <Card sx={GachaOverviewGridCardSx}>
        <Box className="category">
          <Typography component="div" variant="body2">
            {categoryTitle}
          </Typography>
        </Box>
        <Box>
          <Typography>No data available</Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Box>
      <Typography variant="h4">{categoryTitle}</Typography>
      {/* <Stack direction="row" gap={1}>
        <Chip label={`Lifetime ${action.plural}: ${total}`} color="primary" />
        {category !== "aggregated" ? (
          <Chip label={`5★ Pity: ${golden.nextPity}`} color="warning" />
        ) : (
          newbieGoldenName && (
            <Chip label={`Novice 5★: ${newbieGoldenName}`} color="warning" />
          )
        )}
        <Chip label={`4★ Pity: ${purple.nextPity}`} color="secondary" />
      </Stack> */}
      {golden.values.length === 0 || (
        <Box>
          <Typography variant="h5">5★</Typography>
          <GachaOverviewLatest facet={facet} metadata={golden} />
        </Box>
      )}
      {purple.values.length === 0 || (
        <Box>
          <Typography variant="h5">4★</Typography>
          <GachaOverviewLatest facet={facet} metadata={purple} />
        </Box>
      )}
    </Box>
    // <Card>
    //   <CardHeader
    //     title={categoryTitle}
    //     subheader={
    //       <Stack direction="row" gap={1}>
    //         <Chip
    //           label={`Lifetime ${action.plural}: ${total}`}
    //           color="primary"
    //         />
    //         {category !== "aggregated" ? (
    //           <Chip label={`5★ Pity: ${golden.nextPity}`} color="warning" />
    //         ) : (
    //           newbieGoldenName && (
    //             <Chip
    //               label={`Novice 5★: ${newbieGoldenName}`}
    //               color="warning"
    //             />
    //           )
    //         )}
    //         <Chip label={`4★ Pity: ${purple.nextPity}`} color="secondary" />
    //       </Stack>
    //     }
    //   ></CardHeader>
    //   <CardContent>
    //     <Stack direction="row" justifyContent="space-around" sx={{ gap: 2 }}>
    //       {golden.values.length === 0 || (
    //         <GachaOverviewLast facet={facet} metadata={golden} />
    //       )}

    //       {purple.values.length === 0 || (
    //         <GachaOverviewLast facet={facet} metadata={purple} />
    //       )}
    //     </Stack>
    //   </CardContent>
    // </Card>
  );
}

function GachaOverviewLatest({
  facet,
  metadata,
}: {
  facet: AccountFacet;
  metadata: AdvancedMihoyoRecordsMetadata;
}) {
  const last = metadata.values[metadata.values.length - 1];
  const lastName = last ? last.name : "none";
  return (
    <Stack direction="row" sx={{ gap: 1, flexBasis: "50%" }}>
      <Card
        sx={{
          position: "relative",
          textAlign: "center",
          flexShrink: 1,
        }}
      >
        <Box sx={{ height: 100, width: 100 }}>
          <GachaItemView facet={facet} key={last.id} item={last} />
        </Box>

        <Typography
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: "rgba(0, 0, 0, 0.5)",
            color: "#efefef",
            padding: "0 4px",
          }}
        >
          {lastName}
        </Typography>
        <Typography
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            background: "rgba(0, 0, 0, 0.5)",
            color: "#efefef",
            borderBottomLeftRadius: "8px",
            padding: "0 8px",
          }}
          variant="caption"
        >
          {`Last ${last.rank_type}★`}
        </Typography>
      </Card>
      <Statistic title="Total" statistic={metadata.sum} />
      <Statistic title={`Rate`} statistic={metadata.sumPercentage} suffix="%" />
      <Statistic title={`Avg. Pity`} statistic={metadata.sumAverage} />
      <Statistic title="Current Pity" statistic={metadata.nextPity} />
    </Stack>
  );
}
