import React from "react";
import { AccountFacet } from "@/interfaces/account";
import {
  createStatefulAccountLoader,
  withStatefulAccount,
} from "@/hooks/useStatefulAccount";
import Layout from "@/components/Layout";
import GachaLayout from "@/components/gacha/GachaLayout";

export const loader = createStatefulAccountLoader(AccountFacet.Genshin);

export default withStatefulAccount(AccountFacet.Genshin, function Genshin() {
  return (
    <Layout>
      <GachaLayout facet={AccountFacet.Genshin} />
    </Layout>
  );
});
