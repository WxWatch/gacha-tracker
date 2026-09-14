import React from "react";
import GachaAnalysisSum from "@/components/gacha/analysis/GachaAnalysisSum";
import GachaAnalysisHistories from "@/components/gacha/analysis/GachaAnalysisHistory";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import Tab from "@mui/material/Tab";
import TabPanel from "@mui/lab/TabPanel";
import { useGachaLayoutContext } from "../GachaLayoutContext";
import GachaAnalysisNamedRecords from "./GachaAnalysisNamedRecords";
import { borderRadius, spacing, elevation } from "@/theme/tokens";

export default function GachaAnalysis() {
  const { gachaRecords } = useGachaLayoutContext();
  const {
    namedValues: { character, weapon, permanent, beginner },
  } = gachaRecords;
  const [value, setValue] = React.useState("1");

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%", typography: "body1" }}>
      <TabContext value={value}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            borderRadius: `${borderRadius.lg}px ${borderRadius.lg}px 0 0`,
            boxShadow: elevation[1],
            "& .MuiTab-root": {
              borderRadius: `${borderRadius.md}px ${borderRadius.md}px 0 0`,
              fontWeight: 600,
              textTransform: "none",
              fontSize: "0.9rem",
              "&.Mui-selected": {
                fontWeight: 700,
              },
            },
          }}
        >
          <TabList onChange={handleChange} aria-label="Analysis tabs">
            <Tab label="Overall" value="1" />
            <Tab label={character.categoryTitle} value="2" />
            <Tab label={weapon.categoryTitle} value="3" />
            <Tab label={permanent.categoryTitle} value="4" />
            <Tab label={beginner.categoryTitle} value="5" />
          </TabList>
        </Box>
        <TabPanel value="1" sx={{ px: 0, py: `${spacing.lg}px` }}>
          <Stack direction="column" spacing={`${spacing.xl}px`}>
            <GachaAnalysisSum />
            <GachaAnalysisHistories />
          </Stack>
        </TabPanel>
        <TabPanel value="2" sx={{ px: 0, py: `${spacing.lg}px` }}>
          <GachaAnalysisNamedRecords values={character} />
        </TabPanel>
        <TabPanel value="3" sx={{ px: 0, py: `${spacing.lg}px` }}>
          <GachaAnalysisNamedRecords values={weapon} />
        </TabPanel>
        <TabPanel value="4" sx={{ px: 0, py: `${spacing.lg}px` }}>
          <GachaAnalysisNamedRecords values={permanent} />
        </TabPanel>
        <TabPanel value="5" sx={{ px: 0, py: `${spacing.lg}px` }}>
          <GachaAnalysisNamedRecords values={beginner} />
        </TabPanel>
      </TabContext>
    </Box>
  );
}
