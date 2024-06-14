import { AccountFacet } from "@/interfaces/account";

export const GachaCategory = {
  Beginner: "beginner",
  Permanent: "permanent",
  Character: "character",
  Weapon: "weapon",
} as const;

export type GachaCategory = (typeof GachaCategory)[keyof typeof GachaCategory];

export const KnownCategoryTitles: Record<
  AccountFacet,
  Record<GachaCategory, string>
> = {
  [AccountFacet.Genshin]: {
    [GachaCategory.Character]: "Character",
    [GachaCategory.Weapon]: "Weapon",
    [GachaCategory.Permanent]: "Standard",
    [GachaCategory.Beginner]: "Beginner",
  },
  [AccountFacet.StarRail]: {
    [GachaCategory.Character]: "Character",
    [GachaCategory.Weapon]: "Light Cone",
    [GachaCategory.Permanent]: "Regular",
    [GachaCategory.Beginner]: "Starter",
  },
  [AccountFacet.WutheringWaves]: {
    [GachaCategory.Character]: "Featured Resonator",
    [GachaCategory.Weapon]: "Standard Weapon",
    [GachaCategory.Permanent]: "Standard Resonator",
    [GachaCategory.Beginner]: "Beginner",
  },
};
