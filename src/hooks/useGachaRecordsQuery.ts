import { AccountFacet, Account } from "@/interfaces/account";
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
