import React from "react";
import { AccountFacet } from "@/interfaces/account";
import {
  AdvancedGachaRecordsMetadata,
  NamedGachaRecords,
} from "@/hooks/useGachaRecordsQuery";
import { useGachaLayoutContext } from "@/components/gacha/GachaLayoutContext";
import GachaItemView from "@/components/gacha/GachaItemView";
import { SxProps, Theme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

export default function GachaAnalysisHistory() {
  const { facet, gachaRecords } = useGachaLayoutContext();
  const {
    namedValues: { character, weapon, permanent, newbie },
  } = gachaRecords;

  return (
    <>
      <Box>
        <Typography variant="h6" gutterBottom>
          ❖ 5★ History
        </Typography>
        <Stack direction="column" spacing={2}>
          <GachaAnalysisHistoryList
            facet={facet}
            category={character.category}
            categoryTitle={character.categoryTitle}
            records={character.metadata.golden}
          />
          <GachaAnalysisHistoryList
            facet={facet}
            category={weapon.category}
            categoryTitle={weapon.categoryTitle}
            records={weapon.metadata.golden}
          />
          <GachaAnalysisHistoryList
            facet={facet}
            category={permanent.category}
            categoryTitle={permanent.categoryTitle}
            records={permanent.metadata.golden}
          />
          {newbie.metadata.golden.sum > 0 && (
            <GachaAnalysisHistoryList
              facet={facet}
              category={newbie.category}
              categoryTitle={newbie.categoryTitle}
              records={newbie.metadata.golden}
            />
          )}
        </Stack>
      </Box>
      <Divider />
      <Box>
        <Typography variant="h6" gutterBottom>
          ❖ 4★ History
        </Typography>
        <Stack direction="column" spacing={2}>
          <GachaAnalysisHistoryList
            facet={facet}
            category={character.category}
            categoryTitle={character.categoryTitle}
            records={character.metadata.purple}
          />
          <GachaAnalysisHistoryList
            facet={facet}
            category={weapon.category}
            categoryTitle={weapon.categoryTitle}
            records={weapon.metadata.purple}
          />
          <GachaAnalysisHistoryList
            facet={facet}
            category={permanent.category}
            categoryTitle={permanent.categoryTitle}
            records={permanent.metadata.purple}
          />
          {newbie.metadata.purple.sum > 0 && (
            <GachaAnalysisHistoryList
              facet={facet}
              category={newbie.category}
              categoryTitle={newbie.categoryTitle}
              records={newbie.metadata.purple}
            />
          )}
        </Stack>
      </Box>
    </>
  );
}

function GachaAnalysisHistoryList({
  facet,
  category,
  categoryTitle,
  records,
}: {
  facet: AccountFacet;
  category: string;
  categoryTitle: string;
  records: AdvancedGachaRecordsMetadata;
}) {
  return (
    <Stack
      className={GachaAnalysisHistoryListCls}
      sx={GachaAnalysisHistoryListSx}
    >
      <Box className={`${GachaAnalysisHistoryListCls}-title`}>
        <Typography variant="body1">{categoryTitle}</Typography>
        <Typography variant="body2">
          {category !== "permanent" && category !== "newbie"
            ? `${records.sumRestricted} + ${
                records.sum - records.sumRestricted
              }`
            : records.sum}
        </Typography>
      </Box>
      <Divider orientation="horizontal" variant="fullWidth" />
      <Stack className={`${GachaAnalysisHistoryListCls}-items`}>
        {records.values.map((item) => (
          <GachaItemView
            facet={facet}
            key={item.id}
            name={item.name}
            id={item.item_id || item.name}
            isWeapon={item.item_type === "Light Cone"}
            rank={item.rank_type}
            size={GachaAnalysisHistoryItemViewSize}
            usedPity={item.usedPity}
            restricted={item.restricted}
          />
        ))}
      </Stack>
    </Stack>
  );
}

const GachaAnalysisHistoryItemViewSize = 84;
const GachaAnalysisHistoryListCls = "gacha-analysis-history-list";
const GachaAnalysisHistoryListSx: SxProps<Theme> = {
  flexDirection: "row",
  minHeight: GachaAnalysisHistoryItemViewSize,
  [`& .${GachaAnalysisHistoryListCls}-title`]: {
    width: 100,
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    alignItems: "flex-end",
  },
  "& .MuiDivider-root": {
    width: "2px",
    borderWidth: 1,
    borderColor: "warning.light",
    marginX: 1.5,
  },
  [`& .${GachaAnalysisHistoryListCls}-items`]: {
    gap: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
};
