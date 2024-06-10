/* eslint-disable no-use-before-define */

import React from "react";
import {
  QueryKey,
  FetchQueryOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AccountFacet, Account, resolveCurrency } from "@/interfaces/account";
import {
  GenshinGachaRecord,
  StarRailGachaRecord,
  WutheringWavesGachaRecord,
} from "@/interfaces/gacha";
import PluginStorage from "@/utilities/plugin-storage";
import * as _ from "lodash";
import { GachaCategory, KnownCategoryTitles } from "./constants";

export type KuroRecord = WutheringWavesGachaRecord;

type KuroFilter = (record: KuroRecord) => boolean;

export const KnownWutheringWavesGachaTypes: Record<
  WutheringWavesGachaRecord["gacha_type"],
  NamedKuroRecords["category"]
> = {
  1: GachaCategory.Character,
  2: GachaCategory.Character,
  3: GachaCategory.Permanent,
  4: GachaCategory.Weapon,
  5: GachaCategory.Beginner,
  6: GachaCategory.Beginner,
  7: GachaCategory.Beginner,
};

// Computed Gacha Records
// See below
export interface KuroRecords {
  readonly facet: AccountFacet;
  readonly uid: Account["uid"];
  readonly gachaTypeToCategoryMappings: Record<
    KuroRecord["gacha_type"],
    NamedKuroRecords["category"]
  >;
  readonly values: Partial<Record<KuroRecord["gacha_type"], KuroRecord[]>>;
  readonly namedValues: Record<NamedKuroRecords["category"], NamedKuroRecords>;
  readonly aggregatedValues: Omit<
    NamedKuroRecords,
    "category" | "categoryTitle" | "gachaType" | "lastEndId"
  >;
  readonly total: number;
  readonly oldestTimestamp?: KuroRecord["time"];
  readonly latestTimestamp?: KuroRecord["time"];
}

export interface NamedKuroRecords {
  category: GachaCategory;
  categoryTitle: string;
  gachaType: KuroRecord["gacha_type"];
  lastEndId?: KuroRecord["id"];
  values: KuroRecord[];
  total: number;
  firstTime?: KuroRecord["time"];
  lastTime?: KuroRecord["time"];
  metadata: {
    blue: KuroRecordsMetadata;
    purple: AdvancedKuroRecordsMetadata;
    golden: AdvancedKuroRecordsMetadata;
  };
}

export interface KuroRecordsMetadata {
  values: KuroRecord[];
  sum: number;
  sumPercentage: number;
}

export interface AdvancedKuroRecordsMetadata extends KuroRecordsMetadata {
  values: Array<KuroRecord & { usedPity: number; restricted?: true }>;
  sumAverage: number;
  sumRestricted: number;
  nextPity: number;
}

/// Query

const QueryPrefix = "gachaRecords";

const kuroRecordsQueryFn: FetchQueryOptions<KuroRecords | null>["queryFn"] =
  async (context) => {
    const [, facet, uid] = context.queryKey as [
      string,
      AccountFacet,
      Account["uid"] | null
    ];
    if (!uid) {
      return null;
    }

    const rawKuroRecords: KuroRecord[] = (await PluginStorage.findGachaRecords(
      facet,
      { uid }
    )) as unknown as KuroRecord[]; //TODO: fix this
    return computeKuroRecords(facet, uid, rawKuroRecords);
  };

function createQuery(
  facet: AccountFacet,
  uid: Account["uid"] | null
): FetchQueryOptions<KuroRecords | null> & { queryKey: QueryKey } {
  return {
    queryKey: [QueryPrefix, facet, uid],
    queryFn: kuroRecordsQueryFn,
    staleTime: Infinity,
    // cacheTime: Infinity // TODO: GachaRecords infinity cache time?
  };
}

export function useKuroRecordsQuery(
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

export function useRefetchKuroRecordsFn() {
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

function computeKuroRecords(
  facet: AccountFacet,
  uid: Account["uid"],
  records: KuroRecord[]
): KuroRecords {
  console.log("the datt", records);
  const total = records.length;
  const oldestTimestamp = _.first(records)?.time;
  const latestTimestamp = _.last(records)?.time;

  const recordsByGachaType = records.reduce((acc, record) => {
    (acc[record.gacha_type] || (acc[record.gacha_type] = [])).push(record);
    return acc;
  }, {} as KuroRecords["values"]);

  const namedValues = computeNamedKuroRecords(facet, recordsByGachaType);
  const aggregatedValues = computeAggregatedKuroRecords(
    facet,
    records,
    namedValues
  );
  const gachaTypeToCategoryMappings = Object.values(namedValues).reduce(
    (acc, prev) => {
      acc[prev.gachaType] = prev.category;
      return acc;
    },
    {} as KuroRecords["gachaTypeToCategoryMappings"]
  );

  console.log({
    facet,
    uid,
    total,
    gachaTypeToCategoryMappings,
    recordsByGachaType,
    namedValues,
    aggregatedValues,
  });

  return {
    facet,
    uid,
    total,
    gachaTypeToCategoryMappings,
    values: recordsByGachaType,
    namedValues,
    aggregatedValues,
    oldestTimestamp,
    latestTimestamp,
  };
}

const isRankTypeOfBlue = (record: KuroRecord) => record.qualityLevel === 3;
const isRankTypeOfPurple = (record: KuroRecord) => record.qualityLevel === 4;
const isRankTypeOfGolden = (record: KuroRecord) => record.qualityLevel === 5;
const sortKuroRecordById = (a: KuroRecord, b: KuroRecord) =>
  a.id.localeCompare(b.id);

function concatNamedKuroRecordsValues(
  facet: AccountFacet,
  values: KuroRecords["values"],
  gachaType: KuroRecord["gacha_type"],
  category: NamedKuroRecords["category"]
): KuroRecord[] {
  const data = values[gachaType] || [];
  if (facet === AccountFacet.Genshin && category === GachaCategory.Character) {
    // HACK: Genshin Impact: 301 and 400 are the character gacha type
    return Array.from(data)
      .concat(values["400"] || [])
      .sort(sortKuroRecordById);
  } else {
    return Array.from(data);
  }
}

function computeNamedKuroRecords(
  facet: AccountFacet,
  values: KuroRecords["values"]
): KuroRecords["namedValues"] {
  const categories = KnownWutheringWavesGachaTypes;
  const { action: currencyAction } = resolveCurrency(facet);

  return Object.entries(categories).reduce((acc, [gachaType, category]) => {
    const categoryTitle =
      KnownCategoryTitles[facet][category] + " " + currencyAction.singular;
    const data = concatNamedKuroRecordsValues(
      facet,
      values,
      gachaType,
      category
    );
    const total = data.length;
    const lastEndId = data[total - 1]?.id;
    const firstTime = data[0]?.time;
    const lastTime = data[total - 1]?.time;
    const metadata: NamedKuroRecords["metadata"] = {
      blue: computeKuroRecordsMetadata(total, data.filter(isRankTypeOfBlue)),
      purple: computeAdvancedKuroRecordsMetadata(
        facet,
        data,
        isRankTypeOfPurple
      ),
      golden: computeAdvancedKuroRecordsMetadata(
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
  }, {} as KuroRecords["namedValues"]);
}

function computeAggregatedKuroRecords(
  facet: AccountFacet,
  data: KuroRecord[],
  namedValues: KuroRecords["namedValues"]
): KuroRecords["aggregatedValues"] {
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
    .sort(sortKuroRecordById);

  const { purpleUsedPitySum } = purpleValues.reduce(
    (acc, record) => {
      console.log("usedpity", record.usedPity);
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
    .sort(sortKuroRecordById);

  const { goldenSumRestricted, goldenUsedPitySum } = goldenValues.reduce(
    (acc, record) => {
      if (record.restricted) {
        acc.goldenSumRestricted += 1;
      }
      console.log("usedpitgy", record.usedPity);

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

function computeKuroRecordsMetadata(
  total: number,
  values: KuroRecord[]
): KuroRecordsMetadata {
  const sum = values.length;
  const sumPercentage = sum > 0 ? Math.round((sum / total) * 10000) / 100 : 0;
  return {
    values,
    sum,
    sumPercentage,
  };
}

function computeAdvancedKuroRecordsMetadata(
  facet: AccountFacet,
  values: KuroRecord[],
  filter: KuroFilter
): AdvancedKuroRecordsMetadata {
  const result: AdvancedKuroRecordsMetadata["values"] = [];

  let sum = 0;
  let pity = 0;
  let usedPitySum = 0;
  let sumRestricted = 0;

  for (const record of values) {
    pity += 1;

    if (filter(record)) {
      const restricted = false;
      const rest = Object.assign(
        { usedPity: pity, restricted },
        record
      ) as AdvancedKuroRecordsMetadata["values"][number];
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
