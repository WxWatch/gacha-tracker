import React from "react";
import { NamedGachaRecords } from "@/hooks/useGachaRecordsQuery";
import Box from "@mui/material/Box";
import GachaItemView from "../GachaItemView";
import { useGachaLayoutContext } from "../GachaLayoutContext";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import { borderRadius, spacing, elevation } from "@/theme/tokens";

export default function GachaAnalysisNamedRecords({
  values,
}: {
  values: NamedGachaRecords;
}) {
  const { facet } = useGachaLayoutContext();

  if (values.total === 0) {
    return (
      <Box
        sx={{
          p: `${spacing.lg}px`,
          bgcolor: "background.paper",
          borderRadius: `${borderRadius.lg}px`,
          boxShadow: elevation[1],
          textAlign: "center",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No records found
        </Typography>
      </Box>
    );
  }

  // Group items by name and count occurrences
  const itemCounts = new Map<string, { item: any; count: number }>();
  values.values.forEach((item) => {
    const key = item.name;
    if (itemCounts.has(key)) {
      itemCounts.get(key)!.count++;
    } else {
      itemCounts.set(key, { item, count: 1 });
    }
  });

  // Sort by count (highest to lowest)
  const sortedItems = Array.from(itemCounts.values()).sort(
    (a, b) => b.count - a.count
  );

  return (
    <Stack spacing={`${spacing.xl}px`}>
      {/* Summary Stats */}
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
        <Typography variant="h6" fontWeight={700} gutterBottom>
          ❖ Summary
        </Typography>
        <Stack direction="row" spacing={`${spacing.xl}px`} flexWrap="wrap">
          <Box>
            <Typography variant="caption" color="text.secondary">
              Total Pulls
            </Typography>
            <Typography variant="h5" fontWeight={700} color="primary.main">
              {values.total}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Unique Items
            </Typography>
            <Typography variant="h5" fontWeight={700} color="primary.main">
              {itemCounts.size}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider />

      {/* Items Grid */}
      <Box>
        <Typography variant="h6" fontWeight={700} sx={{ mb: `${spacing.md}px` }}>
          ❖ Collection ({sortedItems.length} items)
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={`${spacing.md}px`}>
          {sortedItems.map(({ item, count }) => (
            <Stack
              key={item.id}
              alignItems="center"
              spacing={`${spacing.xs}px`}
              sx={{ width: 110 }}
            >
              {/* Item Image with Count Badge */}
              <Box sx={{ position: "relative" }}>
                <GachaItemView
                  facet={facet}
                  item={item}
                  size={100}
                />
                {/* Count Badge */}
                {count > 1 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      bgcolor: "primary.main",
                      color: "white",
                      borderRadius: "50%",
                      width: 26,
                      height: 26,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                  >
                    ×{count}
                  </Box>
                )}
              </Box>

              {/* Item Name */}
              <Typography
                variant="caption"
                sx={{
                  textAlign: "center",
                  fontSize: "0.7rem",
                  lineHeight: 1.2,
                  fontWeight: 500,
                  color: "text.primary",
                  wordBreak: "break-word",
                  width: "100%",
                }}
              >
                {item.name}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}
