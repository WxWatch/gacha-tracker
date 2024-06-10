/* eslint-disable no-multi-spaces */

// See: src-tauri/src/storage/entity_account.rs

export enum AccountFacet {
  Genshin = "genshin",
  StarRail = "starrail",
  WutheringWaves = "wutheringwaves",
}

export interface KnownAccountProperties {
  displayName?: string | null;
  lastGachaUpdated?: string | null;
  [key: string]: unknown;
}

// #[serde(rename_all = "camelCase")]
export interface Account {
  id: number;
  facet: AccountFacet;
  uid: string;
  gameDataDir: string;
  gachaUrl: string | null;
  properties: KnownAccountProperties | null;
}

export function resolveAccountDisplayName(account: Account | null): string {
  return account?.properties?.displayName || defaultAccountName(account?.facet);
}

function defaultAccountName(facet: AccountFacet | undefined): string {
  // TODO: Default display name i18n
  switch (facet) {
    case AccountFacet.Genshin:
      return "Traveler";
    case AccountFacet.StarRail:
      return "Trailblazer";
    case AccountFacet.WutheringWaves:
      return "Rover";
  }

  return "NULL";
}

export interface Action {
  singular: string;
  plural: string;
}

// TODO: i18n
export function resolveCurrency(facet: AccountFacet): {
  currency: string;
  action: Action;
} {
  switch (facet) {
    case AccountFacet.Genshin:
      return {
        currency: "Primogems",
        action: { singular: "Wish", plural: "Wishes" },
      };
    case AccountFacet.StarRail:
      return {
        currency: "Stellar Jade",
        action: { singular: "Warp", plural: "Warps" },
      };
    case AccountFacet.WutheringWaves:
      return {
        currency: "Astrite",
        action: { singular: "Convene", plural: "Convenes" },
      };
    default:
      throw new Error(`Unknown account facet: ${facet}`);
  }
}

// TODO: i18n
export function resolveFacetName(facet: AccountFacet): string {
  switch (facet) {
    case AccountFacet.Genshin:
      return "Genshin Impact";
    case AccountFacet.StarRail:
      return "Honkai: Star Rail";
    case AccountFacet.WutheringWaves:
      return "Wuthering Waves";
    default:
      throw new Error(`Unknown account facet: ${facet}`);
  }
}
