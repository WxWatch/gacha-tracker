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
import { borderRadius, elevation, transitions, easing } from "@/theme/tokens";

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
  usedPity,
  restricted,
}: {
  facet: AccountFacet;
  item: MihoyoRecord | KuroRecord;
  size?: number;
  usedPity?: number;
  restricted?: boolean;
}) {
  switch (facet) {
    case AccountFacet.Genshin:
    case AccountFacet.StarRail:
      return (
        <MihoyoItemView
          facet={facet}
          item={item as MihoyoRecord}
          size={size}
          usedPity={usedPity}
          restricted={restricted}
        />
      );
    case AccountFacet.WutheringWaves:
      return (
        <KuroItemView
          facet={facet}
          item={item as KuroRecord}
          size={size}
          usedPity={usedPity}
          restricted={restricted}
        />
      );
  }
}

// Default SVG placeholders for missing images
const CharacterPlaceholder = ({ size = 100 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="url(#character-gradient)" />
    <circle cx="50" cy="35" r="15" fill="white" opacity="0.3" />
    <path d="M30 70 Q30 55 50 55 Q70 55 70 70 L70 85 Q70 90 65 90 L35 90 Q30 90 30 85 Z" fill="white" opacity="0.3" />
    <defs>
      <linearGradient id="character-gradient" x1="0" y1="0" x2="100" y2="100">
        <stop offset="0%" stopColor="#6B7280" />
        <stop offset="100%" stopColor="#4B5563" />
      </linearGradient>
    </defs>
  </svg>
);

const WeaponPlaceholder = ({ size = 100 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="url(#placard-bg)" />

    {/* Acrylic card shape */}
    <rect x="25" y="15" width="50" height="70" rx="4" fill="url(#placard-gradient)" />
    <rect x="25" y="15" width="50" height="70" rx="4" fill="url(#placard-shine)" opacity="0.4" />

    {/* Shine/gloss effect */}
    <path d="M 30 20 L 45 20 L 35 50 L 30 50 Z" fill="white" opacity="0.2" />

    {/* Decorative geometric pattern */}
    <circle cx="50" cy="40" r="12" fill="white" opacity="0.15" />
    <rect x="44" y="55" width="12" height="3" rx="1.5" fill="white" opacity="0.2" />
    <rect x="42" y="62" width="16" height="2" rx="1" fill="white" opacity="0.15" />

    {/* Border highlight */}
    <rect x="25" y="15" width="50" height="70" rx="4" stroke="white" strokeWidth="1.5" opacity="0.3" fill="none" />

    <defs>
      <linearGradient id="placard-bg" x1="0" y1="0" x2="100" y2="100">
        <stop offset="0%" stopColor="#6B7280" />
        <stop offset="100%" stopColor="#4B5563" />
      </linearGradient>
      <linearGradient id="placard-gradient" x1="25" y1="15" x2="75" y2="85">
        <stop offset="0%" stopColor="#9CA3AF" />
        <stop offset="100%" stopColor="#6B7280" />
      </linearGradient>
      <linearGradient id="placard-shine" x1="25" y1="15" x2="75" y2="50">
        <stop offset="0%" stopColor="white" opacity="0.6" />
        <stop offset="100%" stopColor="white" opacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

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
  const [imageError, setImageError] = React.useState(false);

  // Check if we should show placeholder: no src, empty src, or image failed to load
  const showPlaceholder = !iconSrc || iconSrc.trim() === "" || imageError;

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
      {showPlaceholder ? (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            borderRadius: `${borderRadius.md}px`,
          }}
        >
          {isWeapon ? (
            <WeaponPlaceholder size={size} />
          ) : (
            <CharacterPlaceholder size={size} />
          )}
        </Box>
      ) : (
        <img
          src={iconSrc}
          alt={name}
          onError={() => setImageError(true)}
        />
      )}
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
  usedPity,
  restricted,
}: {
  item: MihoyoRecord;
  facet: AccountFacet;
  size?: number;
  usedPity?: number;
  restricted?: boolean;
}) {
  return (
    <GachaItemViewInternal
      facet={facet}
      key={item.id}
      name={item.name}
      id={item.item_id}
      isWeapon={item.item_type === "Light Cone" || item.item_type === "Weapon"}
      rank={item.rank_type}
      size={size}
      usedPity={usedPity}
      restricted={restricted}
    />
  );
}

export function KuroItemView({
  item,
  facet,
  size,
  usedPity,
  restricted,
}: {
  item: KuroRecord;
  facet: AccountFacet;
  size?: number;
  usedPity?: number;
  restricted?: boolean;
}) {
  return (
    <GachaItemViewInternal
      facet={facet}
      key={item.id}
      name={item.name}
      id={`${item.resourceId}`}
      isWeapon={item.resourceType === "Weapons"}
      rank={`${item.qualityLevel}`}
      size={size}
      usedPity={usedPity}
      restricted={restricted}
    />
  );
}

const GachaItemViewCls = "gacha-item-view";
const GachaItemViewSx: SxProps<Theme> = {
  position: "relative",
  display: "flex",
  alignSelf: "flex-start",
  flexDirection: "column",
  borderRadius: `${borderRadius.md}px`, // 8px - miHoYo's standard for small elements
  overflow: "hidden",
  cursor: "pointer",
  boxShadow: elevation[1], // Subtle shadow for depth
  transition: `all ${transitions.normal} ${easing.easeOut}`, // Smooth transitions

  // Hover state - miHoYo's signature lift effect
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: elevation[2], // Enhanced shadow on hover
  },

  "& > img": {
    width: "100%",
    height: "100%",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    borderRadius: `${borderRadius.md}px`,
    objectFit: "cover",
    transition: `transform ${transitions.normal} ${easing.easeOut}`,
  },

  // Slight image zoom on hover for premium feel
  "&:hover > img": {
    transform: "scale(1.05)",
  },

  // Genshin Impact uses image backgrounds for rarity
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

  // Other games use gradient backgrounds from theme
  '&[data-facet="starrail"], &[data-facet="wutheringwaves"]': {
    '&[data-rank="3"] > img': {
      backgroundImage: (theme) =>
        (theme as any).game?.rarity?.three?.gradient ||
        "linear-gradient(135deg, #434e7e 0%, #4d80c8 100%)",
    },
    '&[data-rank="4"] > img': {
      backgroundImage: (theme) =>
        (theme as any).game?.rarity?.four?.gradient ||
        "linear-gradient(135deg, #4e4976 0%, #9061d2 100%)",
    },
    '&[data-rank="5"] > img': {
      backgroundImage: (theme) =>
        (theme as any).game?.rarity?.five?.gradient ||
        "linear-gradient(135deg, #986359 0%, #d2ad70 100%)",
    },
  },

  // Badge base styles
  "& > .MuiTypography-root": {
    textAlign: "center",
    lineHeight: "1.2",
    fontSize: "0.75rem",
    fontWeight: 600,
    userSelect: "none",
    position: "absolute",
    px: 1,
    py: 0.25,
    color: "#ffffff",
    textShadow: "0 1px 2px rgba(0,0,0,0.3)", // Better readability
    minWidth: "1.5rem",
    borderRadius: `${borderRadius.sm}px`, // 4px for small badges
    backdropFilter: "blur(4px)", // Subtle blur for modern feel
  },

  // Pity counter badge
  [`& .${GachaItemViewCls}-used-pity`]: {
    right: 0,
    bottom: 0,
    bgcolor: "rgba(210, 120, 120, 0.9)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    transition: `all ${transitions.fast} ${easing.easeOut}`,
  },

  // Rarity-specific pity badge colors
  [`&[data-rank="3"] > .${GachaItemViewCls}-used-pity`]: {
    bgcolor: (theme) =>
      `${(theme as any).game?.rarity?.three?.dark || "#35598c"}ee`,
  },
  [`&[data-rank="4"] > .${GachaItemViewCls}-used-pity`]: {
    bgcolor: (theme) =>
      `${(theme as any).game?.rarity?.four?.dark || "#644393"}ee`,
  },
  [`&[data-rank="5"] > .${GachaItemViewCls}-used-pity`]: {
    bgcolor: (theme) =>
      `${(theme as any).game?.rarity?.five?.dark || "#93794e"}ee`,
  },

  // Exclusive/Restricted badge
  [`& .${GachaItemViewCls}-restricted`]: {
    top: 0,
    left: 0,
    bgcolor: "rgba(140, 185, 75, 0.9)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    fontSize: "0.625rem",
    fontWeight: 700,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    transition: `all ${transitions.fast} ${easing.easeOut}`,
  },

  // Pulse animation on hover for badges
  "&:hover > .MuiTypography-root": {
    transform: "scale(1.05)",
  },
};
