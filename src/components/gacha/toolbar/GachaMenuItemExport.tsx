import React from "react";
import { dialog } from "@tauri-apps/api";
import { resolveCurrency } from "@/interfaces/account";
import { useGachaLayoutContext } from "@/components/gacha/GachaLayoutContext";
import PluginGacha from "@/utilities/plugin-gacha";
import MenuItem from "@mui/material/MenuItem";
import SaveAltIcon from "@mui/icons-material/SaveAlt";

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
