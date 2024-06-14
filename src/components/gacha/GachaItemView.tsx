import React from "react";
import { AccountFacet } from "@/interfaces/account";
import { SxProps, Theme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import GenshinUIRarity3Background from "@/assets/images/genshin/UI_Rarity_3_Background.png";
import GenshinUIRarity4Background from "@/assets/images/genshin/UI_Rarity_4_Background.png";
import GenshinUIRarity5Background from "@/assets/images/genshin/UI_Rarity_5_Background.png";
import { lookupAssetIcon } from "./icons";
import { MihoyoRecord } from "@/hooks/useMihoyoRecordsQuery";
import { KuroRecord } from "@/hooks/useKuroRecordsQuery";

export interface GachaItemViewProps {
  facet: AccountFacet;
  name: string;
  id: string;
  isWeapon: boolean;
  rank: string;
  size?: number;
  usedPity?: number;
  restricted?: boolean;
}

export default function GachaItemView({
  facet,
  item,
  size,
}: {
  facet: AccountFacet;
  item: MihoyoRecord | KuroRecord;
  size?: number;
}) {
  switch (facet) {
    case AccountFacet.Genshin:
    case AccountFacet.StarRail:
      return (
        <MihoyoItemView facet={facet} item={item as MihoyoRecord} size={size} />
      );
    case AccountFacet.WutheringWaves:
      return (
        <KuroItemView facet={facet} item={item as KuroRecord} size={size} />
      );
  }
}

export function GachaItemViewInternal(props: GachaItemViewProps) {
  const {
    facet,
    name,
    id,
    isWeapon,
    rank,
    size,
    usedPity,
    restricted = false,
  } = props;

  const category = isWeapon ? "weapon" : "character";
  const iconSrc = lookupAssetIcon(facet, category, id);

  if (!iconSrc) {
    // TODO: default character and/or weapon iconSrc
    // iconSrc = getRemoteResourceSrc(facet, category, id);
  }

  return (
    <Box
      className={GachaItemViewCls}
      sx={GachaItemViewSx}
      width={size}
      height={size}
      data-facet={facet}
      data-rank={rank}
      data-restricted={restricted}
      title={name}
    >
      <img src={iconSrc} alt={name} />
      {usedPity && (
        <Typography className={`${GachaItemViewCls}-used-pity`}>
          {usedPity}
        </Typography>
      )}
      {restricted && (
        <Typography className={`${GachaItemViewCls}-restricted`}>
          Exclusive
        </Typography>
      )}
    </Box>
  );
}

export function MihoyoItemView({
  item,
  facet,
  size,
}: {
  item: MihoyoRecord;
  facet: AccountFacet;
  size?: number;
}) {
  console.log("beepo", { item });

  return (
    <GachaItemViewInternal
      facet={facet}
      key={item.id}
      name={item.name}
      id={item.item_id}
      isWeapon={item.item_type === "Light Cone" || item.item_type === "Weapon"}
      rank={item.rank_type}
      size={size}
    />
  );
}

export function KuroItemView({
  item,
  facet,
  size,
}: {
  item: KuroRecord;
  facet: AccountFacet;
  size?: number;
}) {
  console.log("beepo", { item });
  return (
    <GachaItemViewInternal
      facet={facet}
      key={item.id}
      name={item.name}
      id={`${item.resourceId}`}
      isWeapon={item.resourceType === "Weapon"}
      rank={`${item.qualityLevel}`}
      size={size}
    />
  );
}

const GachaItemViewCls = "gacha-item-view";
const GachaItemViewSx: SxProps<Theme> = {
  position: "relative",
  display: "flex",
  alignSelf: "flex-start",
  flexDirection: "column",
  borderRadius: 2,
  "& > img": {
    width: "100%",
    height: "100%",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    borderRadius: 2,
    objectFit: "cover", // or use scale-down
  },
  '&[data-facet="genshin"]': {
    '&[data-rank="3"] > img': {
      backgroundImage: `url(${GenshinUIRarity3Background})`,
    },
    '&[data-rank="4"] > img': {
      backgroundImage: `url(${GenshinUIRarity4Background})`,
    },
    '&[data-rank="5"] > img': {
      backgroundImage: `url(${GenshinUIRarity5Background})`,
    },
  },
  // TODO: Because there is no background assets, temporarily use gradient color instead
  '&[data-facet="starrail"]': {
    position: "relative",
    '&[data-rank="3"] > img': {
      backgroundImage: "linear-gradient(#434e7e, #4d80c8)",
    },
    '&[data-rank="4"] > img': {
      backgroundImage: "linear-gradient(#4e4976, #9061d2)",
    },
    '&[data-rank="5"] > img': {
      backgroundImage: "linear-gradient(#986359, #d2ad70)",
    },
  },
  "& > .MuiTypography-root": {
    textAlign: "center",
    lineHeight: "1rem",
    // fontSize: "0.75rem",
    userSelect: "none",
    position: "absolute",
    paddingX: 0.2,
    color: "#efefef",
    borderColor: "#efefef",
    minWidth: "1.25rem",
  },
  [`& .${GachaItemViewCls}-used-pity`]: {
    right: 0,
    bottom: 0,
    bgcolor: "rgb(210, 120, 120)",
    borderLeft: 2,
    borderTop: 2,
    borderTopLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  [`&[data-rank="3"] > .${GachaItemViewCls}-used-pity`]: {
    bgcolor: "#35598c",
  },
  [`&[data-rank="4"] > .${GachaItemViewCls}-used-pity`]: {
    bgcolor: "#644393",
  },
  [`&[data-rank="5"] > .${GachaItemViewCls}-used-pity`]: {
    bgcolor: "#93794e",
  },
  [`& .${GachaItemViewCls}-restricted`]: {
    top: 0,
    left: 0,
    bgcolor: "rgb(140, 185, 75)",
    borderRight: 2,
    borderBottom: 2,
    borderBottomRightRadius: 4,
    borderTopLeftRadius: 4,
  },
};
