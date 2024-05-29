/* eslint-disable no-use-before-define */

import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AccountFacet, Account, resolveCurrency } from "@/interfaces/account";
import * as _ from "lodash";
import {
  AdvancedMihoyoRecordsMetadata,
  MihoyoRecords,
  NamedMihoyoRecords,
  useMihoyoRecordsQuery,
  useRefetchMihoyoRecordsFn,
} from "./useMihoyoRecordsQuery";
import {
  AdvancedKuroRecordsMetadata,
  KuroRecords,
  NamedKuroRecords,
  useKuroRecordsQuery,
  useRefetchKuroRecordsFn,
} from "./useKuroRecordsQuery";

/// Query
export function useGachaRecordsQuery(
  facet: AccountFacet,
  uid: Account["uid"] | null
) {
  switch (facet) {
    case AccountFacet.Genshin:
    case AccountFacet.StarRail:
      return useMihoyoRecordsQuery(facet, uid);
    case AccountFacet.WutheringWaves:
      return useKuroRecordsQuery(facet, uid);
  }
}

/// Hook
export function useRefetchGachaRecordsFn(facet: AccountFacet) {
  switch (facet) {
    case AccountFacet.Genshin:
    case AccountFacet.StarRail:
      return useRefetchMihoyoRecordsFn();
    case AccountFacet.WutheringWaves:
      return useRefetchKuroRecordsFn();
  }
}

/// Types
export type GachaRecords = MihoyoRecords | KuroRecords;

export type NamedGachaRecords = NamedMihoyoRecords | NamedKuroRecords;

export type AdvancedGachaRecordsMetadata =
  | AdvancedMihoyoRecordsMetadata
  | AdvancedKuroRecordsMetadata;
