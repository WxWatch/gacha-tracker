import React from "react";
import { AccountFacet } from "@/interfaces/account";
import { useGachaLayoutContext } from "@/components/gacha/GachaLayoutContext";
import GachaOverviewGridMihoyo from "./mihoyo/GachaOverviewGridMihoyo";
import GachaOverviewGridKuro from "./kuro/GachaOverviewGridKuro";

export default function GachaOverviewGrid() {
  const { facet } = useGachaLayoutContext();
  switch (facet) {
    case AccountFacet.Genshin:
    case AccountFacet.StarRail:
      return <GachaOverviewGridMihoyo />;
    case AccountFacet.WutheringWaves:
      return <GachaOverviewGridKuro />;
  }
}
