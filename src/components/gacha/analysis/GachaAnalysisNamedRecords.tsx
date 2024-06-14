import React from "react";
import { NamedGachaRecords } from "@/hooks/useGachaRecordsQuery";
import Box from "@mui/material/Box";
import GachaItemView from "../GachaItemView";
import { useGachaLayoutContext } from "../GachaLayoutContext";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function GachaAnalysisNamedRecords({
  values,
}: {
  values: NamedGachaRecords;
}) {
  const { facet } = useGachaLayoutContext();
  if (values.total === 0) {
    return <div>No records found</div>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        ❖ History
      </Typography>{" "}
      <Stack direction="row" gap={1} flexWrap="wrap">
        {values.values.map((item) => (
          <GachaItemView facet={facet} key={item.id} item={item} size={100} />
        ))}
      </Stack>
    </Box>
  );
}
