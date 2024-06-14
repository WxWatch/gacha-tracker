import { MihoyoRecord } from "@/hooks/useMihoyoRecordsQuery";
import { AccountFacet } from "./account";
import { KuroRecord } from "@/hooks/useKuroRecordsQuery";

/* eslint-disable no-multi-spaces */
export function getRankType(
  facet: AccountFacet,
  record: MihoyoRecord | KuroRecord
): string {
  if (isMihoyoRecord(record)) {
    return record.rank_type;
  } else if (isKuroRecord(record)) {
    return `${record.qualityLevel}`;
  }

  return "";
}

export function getItemType(
  facet: AccountFacet,
  record: MihoyoRecord | KuroRecord
): string {
  if (isMihoyoRecord(record)) {
    return record.item_type;
  } else if (isKuroRecord(record)) {
    return record.resourceType;
  }

  return "";
}

const isMihoyoRecord = (record: any): record is MihoyoRecord => true;
const isKuroRecord = (record: any): record is KuroRecord => true;

// See: src-tauri/src/gacha/impl_genshin.rs
export interface GenshinGachaRecord {
  id: string;
  uid: string;
  gacha_type: string; // 100 | 200 | 301 | 302 | 400
  item_id: string; // always empty
  count: string; // always 1
  time: string;
  name: string;
  lang: string; // zh-cn
  item_type: string; // 角色 | 武器
  rank_type: string; // 3 | 4 | 5
}

// See: src-tauri/src/gacha/impl_starrail.rs
export interface StarRailGachaRecord {
  id: string;
  uid: string;
  gacha_id: string;
  gacha_type: string; // 1 | 2 | 11 | 12
  item_id: string;
  count: string; // always 1
  time: string;
  name: string;
  lang: string; // zh-cn
  item_type: string; // 角色 | 光锥
  rank_type: string; // 3 | 4 | 5
}

// See: src-tauri/src/gacha/impl_wutheringwaves.rs
export interface WutheringWavesGachaRecord {
  id: string;
  uid: string;
  gacha_type: string;
  cardPoolType: string;
  resourceId: number;
  qualityLevel: number;
  resourceType: string;
  name: string;
  count: number;
  time: string;
}
