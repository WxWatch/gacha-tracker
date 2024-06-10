import React from "react";
import { dialog } from "@tauri-apps/api";
import { AccountFacet, resolveCurrency } from "@/interfaces/account";
import { useGachaLayoutContext } from "@/components/gacha/GachaLayoutContext";
import PluginGacha from "@/utilities/plugin-gacha";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import AssistantIcon from "@mui/icons-material/Assistant";

export default function GachaMenuItemExport() {
  const { facet, selectedAccount, alert } = useGachaLayoutContext();
  const { action } = resolveCurrency(facet);
  const [busy, setBusy] = React.useState(false);

  const handleExportGachaRecords = React.useCallback(async () => {
    setBusy(true);
    try {
      const directory = await dialog.open({
        title: "Please select a folder for export:",
        directory: true,
        multiple: false,
      });
      if (typeof directory === "string") {
        const exportFile = await PluginGacha.exportGachaRecords(
          selectedAccount.facet,
          selectedAccount.uid,
          directory
        );
        alert(
          null,
          `${action.singular}The record export was successful: ${exportFile}`
        );
      }
    } catch (e) {
      alert(e);
    } finally {
      setBusy(false);
    }
  }, [selectedAccount, alert, action, setBusy]);

  return (
    <MenuItem
      key="GachaActionExport"
      onClick={handleExportGachaRecords}
      disabled={busy}
    >
      <SaveAltIcon />
      &nbsp;Export
    </MenuItem>
  );
}
