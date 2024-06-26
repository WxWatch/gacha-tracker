import React from "react";
import { dialog } from "@tauri-apps/api";
import { AccountFacet, resolveCurrency } from "@/interfaces/account";
import { useGachaLayoutContext } from "@/components/gacha/GachaLayoutContext";
import { useRefetchGachaRecordsFn } from "@/hooks/useGachaRecordsQuery";
import PluginGacha from "@/utilities/plugin-gacha";
import Box from "@mui/material/Box";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import MenuItem from "@mui/material/MenuItem";

export default function GachaMenuItemImport() {
  const { facet, selectedAccount, alert } = useGachaLayoutContext();
  const { action } = resolveCurrency(facet);
  const [busy, setBusy] = React.useState(false);
  const refetchGachaRecords = useRefetchGachaRecordsFn(facet);

  const handleImportGachaRecords = React.useCallback(async () => {
    setBusy(true);
    try {
      const file = await dialog.open({
        title: `Please select the ${action.singular} record file:`,
        directory: false,
        multiple: false,
        filters: [
          {
            extensions: ["json"],
            name: {
              [AccountFacet.Genshin]:
                "UIGF (Unified Standardized GenshinData Format)",
              [AccountFacet.StarRail]: "SRGF (Star Rail GachaLog Format)",
              [AccountFacet.WutheringWaves]: "",
            }[selectedAccount.facet],
          },
        ],
      });
      if (typeof file === "string") {
        const changes = await PluginGacha.importGachaRecords(
          selectedAccount.facet,
          selectedAccount.uid,
          file
        );
        setBusy(false);
        alert(null, `Successfully imported ${changes} records`);
        await refetchGachaRecords(selectedAccount.facet, selectedAccount.uid);
      } else {
        setBusy(false);
      }
    } catch (e) {
      alert(e);
      setBusy(false);
    }
  }, [selectedAccount, alert, action, setBusy]);

  return (
    <MenuItem
      key="GachaActionImport"
      onClick={handleImportGachaRecords}
      disabled={busy}
    >
      <FileUploadIcon />
      <span>&nbsp;Import</span>

      <Backdrop
        open={busy}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: "rgba(0, 0, 0, 0.65)",
          color: "#efefef",
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center">
          <CircularProgress color="info" />
          <Typography variant="h6" sx={{ marginTop: 2 }}>
            {`importing ${action.singular} recording, please wait...`}
          </Typography>
        </Box>
      </Backdrop>
    </MenuItem>
  );
}
