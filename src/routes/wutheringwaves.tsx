import React from "react";
import { AccountFacet } from "@/interfaces/account";
import {
  createStatefulAccountLoader,
  withStatefulAccount,
} from "@/hooks/useStatefulAccount";
import Layout from "@/components/Layout";
import AccountMenu from "@/components/account/AccountMenu";
import GachaLayout from "@/components/gacha/GachaLayout";

export const loader = createStatefulAccountLoader(AccountFacet.WutheringWaves);

export default withStatefulAccount(
  AccountFacet.WutheringWaves,
  function WutheringWaves() {
    return (
      <Layout title="Convene · Wuthering Waves" navbar={<AccountMenu />}>
        <GachaLayout />
      </Layout>
    );
  }
);
