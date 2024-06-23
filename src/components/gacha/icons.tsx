import { AccountFacet } from "@/interfaces/account";

const extensions = {
  [AccountFacet.Genshin]: {
    gameName: "genshin",
    character: ".webp",
    weapon: ".png",
  },
  [AccountFacet.StarRail]: {
    gameName: "starrail",
    character: ".webp",
    weapon: ".webp",
  },
  [AccountFacet.WutheringWaves]: {
    gameName: "wutheringwaves",
    character: ".webp",
    weapon: ".png",
  },
} as const;

// TODO: this needs to be by ID ONLY
export function lookupAssetIcon(
  facet: AccountFacet,
  category: "character" | "weapon",
  id: string
): string | undefined {
  const path = `/images/${extensions[facet].gameName}/${category}/${id}${extensions[facet][category]}`;
  return path;
}
