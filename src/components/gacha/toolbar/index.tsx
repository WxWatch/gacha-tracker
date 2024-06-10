import React from "react";
import { AccountFacet } from "@/interfaces/account";
import GachaActionUrl from "@/components/gacha/toolbar/GachaActionUrl";
import GachaActionFetch from "@/components/gacha/toolbar/GachaActionFetch";
import GachaActionImport from "@/components/gacha/toolbar/GachaActionImport";
import GachaActionExport from "@/components/gacha/toolbar/GachaActionExport";
import GachaActionTabs, {
  GachaActionTabsProps,
} from "@/components/gacha/toolbar/GachaActionTabs";
import Stack from "@mui/material/Stack";
import AccountMenu from "@/components/account/AccountMenu";
import GachaActionUpdate from "./GachaActionUpdate";

export interface GachaToolbarProps {
  facet: AccountFacet;
  ActionTabsProps: GachaActionTabsProps;
}

export default function GachaToolbar(props: GachaToolbarProps) {
  const { ActionTabsProps } = props;
  return (
    <Stack direction="row" gap={2} justifyContent="space-between">
      <GachaActionTabs {...ActionTabsProps} />
      {/* <GachaActionUrl /> */}
      <Stack direction="row">
        <GachaActionUpdate />
        <AccountMenu />
      </Stack>
    </Stack>
  );
}
