/* eslint-disable no-use-before-define */

import React from "react";
import {
  QueryKey,
  FetchQueryOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AccountFacet, Account, resolveCurrency } from "@/interfaces/account";
import { GenshinGachaRecord, StarRailGachaRecord } from "@/interfaces/gacha";
import PluginStorage from "@/utilities/plugin-storage";
import _ from "lodash";
import { GachaCategory, KnownCategoryTitles } from "./constants";

export type MihoyoRecord = GenshinGachaRecord | StarRailGachaRecord;

type MihoyoFilter = (record: MihoyoRecord) => boolean;

export const KnownStarRailGachaTypes: Record<
  StarRailGachaRecord["gacha_type"],
  NamedMihoyoRecords["category"]
> = {
  2: GachaCategory.Beginner,
  1: GachaCategory.Permanent,
  11: GachaCategory.Character,
  12: GachaCategory.Weapon,
};

export const KnownGenshinGachaTypes: Record<
  GenshinGachaRecord["gacha_type"],
  NamedMihoyoRecords["category"]
> = {
  100: GachaCategory.Beginner,
  200: GachaCategory.Permanent,
  301: GachaCategory.Character, // include 400
  302: GachaCategory.Weapon,
};

// Computed Gacha Records
// See below
export interface MihoyoRecords {
  readonly facet: AccountFacet;
  readonly uid: Account["uid"];
  readonly gachaTypeToCategoryMappings: Record<
    MihoyoRecord["gacha_type"],
    NamedMihoyoRecords["category"]
  >;
  readonly values: Partial<Record<MihoyoRecord["gacha_type"], MihoyoRecord[]>>;
  readonly namedValues: Record<
    NamedMihoyoRecords["category"],
    NamedMihoyoRecords
  >;
  readonly aggregatedValues: Omit<
    NamedMihoyoRecords,
    "category" | "categoryTitle" | "gachaType" | "lastEndId"
  >;
  readonly total: number;
  readonly oldestTimestamp?: MihoyoRecord["time"];
  readonly latestTimestamp?: MihoyoRecord["time"];
}

export interface NamedMihoyoRecords {
  category: GachaCategory;
  categoryTitle: string;
  gachaType: MihoyoRecord["gacha_type"];
  lastEndId?: MihoyoRecord["id"];
  values: MihoyoRecord[];
  total: number;
  firstTime?: MihoyoRecord["time"];
  lastTime?: MihoyoRecord["time"];
  metadata: {
    blue: MihoyoRecordsMetadata;
    purple: AdvancedMihoyoRecordsMetadata;
    golden: AdvancedMihoyoRecordsMetadata;
  };
}

export interface MihoyoRecordsMetadata {
  values: MihoyoRecord[];
  sum: number;
  sumPercentage: number;
}

export interface AdvancedMihoyoRecordsMetadata extends MihoyoRecordsMetadata {
  values: Array<MihoyoRecord & { usedPity: number; restricted?: true }>;
  sumAverage: number;
  sumRestricted: number;
  nextPity: number;
}

/// Query

const QueryPrefix = "gachaRecords";

const mihoyoRecordsQueryFn: FetchQueryOptions<MihoyoRecords | null>["queryFn"] =
  async (context) => {
    const [, facet, uid] = context.queryKey as [
      string,
      AccountFacet,
      Account["uid"] | null
    ];
    if (!uid) {
      return null;
    }

    const rawMihoyoRecords: MihoyoRecord[] =
      await PluginStorage.findGachaRecords(facet, { uid });
    return computeMihoyoRecords(facet, uid, rawMihoyoRecords);
  };

function createQuery(
  facet: AccountFacet,
  uid: Account["uid"] | null
): FetchQueryOptions<MihoyoRecords | null> & { queryKey: QueryKey } {
  return {
    queryKey: [QueryPrefix, facet, uid],
    queryFn: mihoyoRecordsQueryFn,
    staleTime: Infinity,
    // cacheTime: Infinity // TODO: GachaRecords infinity cache time?
  };
}

export function useMihoyoRecordsQuery(
  facet: AccountFacet,
  uid: Account["uid"] | null
) {
  const query = createQuery(facet, uid);
  return useQuery({
    ...query,
    refetchOnWindowFocus: false,
  });
}

/// Hook

export function useRefetchMihoyoRecordsFn() {
  const queryClient = useQueryClient();
  return React.useCallback(
    async (facet: AccountFacet, uid: Account["uid"]) => {
      const query = createQuery(facet, uid);
      await queryClient.refetchQueries({
        queryKey: query.queryKey,
        exact: true,
      });
    },
    [queryClient]
  );
}

/// Private Compute Fn

function computeMihoyoRecords(
  facet: AccountFacet,
  uid: Account["uid"],
  data: MihoyoRecord[]
): MihoyoRecords {
  const total = data.length;
  const oldestTimestamp = _.first(data)?.time;
  const latestTimestamp = _.last(data)?.time;
  const values = data.reduce((acc, record) => {
    (acc[record.gacha_type] || (acc[record.gacha_type] = [])).push(record);
    return acc;
  }, {} as MihoyoRecords["values"]);

  const namedValues = computeNamedMihoyoRecords(facet, values);
  const aggregatedValues = computeAggregatedMihoyoRecords(
    facet,
    data,
    namedValues
  );
  const gachaTypeToCategoryMappings = Object.values(namedValues).reduce(
    (acc, prev) => {
      acc[prev.gachaType] = prev.category;
      return acc;
    },
    {} as MihoyoRecords["gachaTypeToCategoryMappings"]
  );

  return {
    facet,
    uid,
    total,
    gachaTypeToCategoryMappings,
    values,
    namedValues,
    aggregatedValues,
    oldestTimestamp,
    latestTimestamp,
  };
}

const isRankTypeOfBlue = (record: MihoyoRecord) => record.rank_type === "3";
const isRankTypeOfPurple = (record: MihoyoRecord) => record.rank_type === "4";
const isRankTypeOfGolden = (record: MihoyoRecord) => record.rank_type === "5";
const sortMihoyoRecordById = (a: MihoyoRecord, b: MihoyoRecord) =>
  a.id.localeCompare(b.id);

function concatNamedMihoyoRecordsValues(
  facet: AccountFacet,
  values: MihoyoRecords["values"],
  gachaType: MihoyoRecord["gacha_type"],
  category: NamedMihoyoRecords["category"]
): MihoyoRecord[] {
  const data = values[gachaType] || [];
  if (facet === AccountFacet.Genshin && category === GachaCategory.Character) {
    // HACK: Genshin Impact: 301 and 400 are the character gacha type
    return Array.from(data)
      .concat(values["400"] || [])
      .sort(sortMihoyoRecordById);
  } else {
    return Array.from(data);
  }
}

function computeNamedMihoyoRecords(
  facet: AccountFacet,
  values: MihoyoRecords["values"]
): MihoyoRecords["namedValues"] {
  const categories =
    facet === AccountFacet.Genshin
      ? KnownGenshinGachaTypes
      : KnownStarRailGachaTypes;
  const { action: currencyAction } = resolveCurrency(facet);

  return Object.entries(categories).reduce((acc, [gachaType, category]) => {
    const categoryTitle =
      KnownCategoryTitles[facet][category] + " " + currencyAction.singular;
    const data = concatNamedMihoyoRecordsValues(
      facet,
      values,
      gachaType,
      category
    );
    const total = data.length;
    const lastEndId = data[total - 1]?.id;
    const firstTime = data[0]?.time;
    const lastTime = data[total - 1]?.time;
    const metadata: NamedMihoyoRecords["metadata"] = {
      blue: computeMihoyoRecordsMetadata(total, data.filter(isRankTypeOfBlue)),
      purple: computeAdvancedMihoyoRecordsMetadata(
        facet,
        data,
        isRankTypeOfPurple
      ),
      golden: computeAdvancedMihoyoRecordsMetadata(
        facet,
        data,
        isRankTypeOfGolden
      ),
    };

    acc[category] = {
      category,
      categoryTitle,
      gachaType,
      lastEndId,
      total,
      firstTime,
      lastTime,
      values: data,
      metadata,
    };
    return acc;
  }, {} as MihoyoRecords["namedValues"]);
}

function computeAggregatedMihoyoRecords(
  facet: AccountFacet,
  data: MihoyoRecord[],
  namedValues: MihoyoRecords["namedValues"]
): MihoyoRecords["aggregatedValues"] {
  const total = data.length;
  const firstTime = data[0]?.time;
  const lastTime = data[total - 1]?.time;
  const {
    [GachaCategory.Beginner]: newbie,
    [GachaCategory.Permanent]: permanent,
    [GachaCategory.Character]: character,
    [GachaCategory.Weapon]: weapon,
  } = namedValues;

  const blueSum =
    newbie.metadata.blue.sum +
    permanent.metadata.blue.sum +
    character.metadata.blue.sum +
    weapon.metadata.blue.sum;
  const blueSumPercentage =
    blueSum > 0 ? Math.round((blueSum / total) * 10000) / 100 : 0;
  const blueValues = data.filter(isRankTypeOfBlue);

  const purpleSum =
    newbie.metadata.purple.sum +
    permanent.metadata.purple.sum +
    character.metadata.purple.sum +
    weapon.metadata.purple.sum;
  const purpleSumPercentage =
    purpleSum > 0 ? Math.round((purpleSum / total) * 10000) / 100 : 0;
  const purpleValues = Array.from(newbie.metadata.purple.values)
    .concat(Array.from(permanent.metadata.purple.values))
    .concat(Array.from(character.metadata.purple.values))
    .concat(Array.from(weapon.metadata.purple.values))
    .sort(sortMihoyoRecordById);

  const { purpleUsedPitySum } = purpleValues.reduce(
    (acc, record) => {
      acc.purpleUsedPitySum += record.usedPity;
      return acc;
    },
    {
      purpleUsedPitySum: 0,
    }
  );

  const purpleSumAverage =
    purpleSum > 0
      ? Math.ceil(Math.round((purpleUsedPitySum / purpleSum) * 100) / 100)
      : 0;

  const goldenSum =
    newbie.metadata.golden.sum +
    permanent.metadata.golden.sum +
    character.metadata.golden.sum +
    weapon.metadata.golden.sum;
  const goldenSumPercentage =
    goldenSum > 0 ? Math.round((goldenSum / total) * 10000) / 100 : 0;
  const goldenValues = Array.from(newbie.metadata.golden.values)
    .concat(Array.from(permanent.metadata.golden.values))
    .concat(Array.from(character.metadata.golden.values))
    .concat(Array.from(weapon.metadata.golden.values))
    .sort(sortMihoyoRecordById);

  const { goldenSumRestricted, goldenUsedPitySum } = goldenValues.reduce(
    (acc, record) => {
      if (record.restricted) {
        acc.goldenSumRestricted += 1;
      }

      acc.goldenUsedPitySum += record.usedPity;
      return acc;
    },
    {
      goldenSumRestricted: 0,
      goldenUsedPitySum: 0,
    }
  );

  const goldenSumAverage =
    goldenSum > 0
      ? Math.ceil(Math.round((goldenUsedPitySum / goldenSum) * 100) / 100)
      : 0;

  return {
    total,
    firstTime,
    lastTime,
    values: data,
    metadata: {
      blue: {
        sum: blueSum,
        sumPercentage: blueSumPercentage,
        values: blueValues,
      },
      purple: {
        sum: purpleSum,
        sumPercentage: purpleSumPercentage,
        values: purpleValues,
        sumAverage: purpleSumAverage,
        sumRestricted: 0,
        nextPity: 0,
      },
      golden: {
        sum: goldenSum,
        sumPercentage: goldenSumPercentage,
        values: goldenValues,
        sumAverage: goldenSumAverage,
        sumRestricted: goldenSumRestricted,
        nextPity: 0,
      },
    },
  };
}

function computeMihoyoRecordsMetadata(
  total: number,
  values: MihoyoRecord[]
): MihoyoRecordsMetadata {
  const sum = values.length;
  const sumPercentage = sum > 0 ? Math.round((sum / total) * 10000) / 100 : 0;
  return {
    values,
    sum,
    sumPercentage,
  };
}

function computeAdvancedMihoyoRecordsMetadata(
  facet: AccountFacet,
  values: MihoyoRecord[],
  filter: MihoyoFilter
): AdvancedMihoyoRecordsMetadata {
  const result: AdvancedMihoyoRecordsMetadata["values"] = [];

  let sum = 0;
  let pity = 0;
  let usedPitySum = 0;
  let sumRestricted = 0;

  for (const record of values) {
    pity += 1;

    if (filter(record)) {
      const restricted = isRestrictedGolden(facet, record);
      const rest = Object.assign(
        { usedPity: pity, restricted },
        record
      ) as AdvancedMihoyoRecordsMetadata["values"][number];
      result.push(rest);

      sum += 1;
      usedPitySum += pity;
      pity = 0;
      if (restricted) {
        sumRestricted += 1;
      }
    }
  }

  const total = values.length;
  const sumPercentage = sum > 0 ? Math.round((sum / total) * 10000) / 100 : 0;
  const sumAverage =
    sum > 0 ? Math.ceil(Math.round((usedPitySum / sum) * 100) / 100) : 0;

  return {
    values: result,
    sum,
    sumPercentage,
    sumAverage,
    sumRestricted,
    nextPity: pity,
  };
}

function isRestrictedGolden(
  facet: AccountFacet,
  record: MihoyoRecord
): boolean {
  // TODO: rework "restricted"
  return false;
  switch (facet) {
    case AccountFacet.Genshin:
      return !KnownGenshinPermanentGoldenNames.includes(record.name);
    case AccountFacet.StarRail:
      return !KnownStarRailPermanentGoldenItemIds.includes(record.item_id);
    default:
      throw new Error(`Unknown facet: ${facet}`);
  }
}

// TODO: Genshin Impact and Honkai: Star Rail restricted golden
//   Temporary use of embedded resources

const KnownGenshinPermanentGoldenNames: string[] = [
  "琴",
  "迪卢克",
  "七七",
  "莫娜",
  "刻晴",
  "提纳里",
  "迪希雅",
  "风鹰剑",
  "天空之刃",
  "天空之傲",
  "狼的末路",
  "天空之脊",
  "和璞鸢",
  "天空之卷",
  "四风原典",
  "天空之翼",
  "阿莫斯之弓",
];

const KnownStarRailPermanentGoldenItemIds: string[] = [
  "1003",
  "1004",
  "1101",
  "1104",
  "1107",
  "1209",
  "1211",
  "23000",
  "23002",
  "23003",
  "23004",
  "23005",
  "23012",
  "23013",
];
