import { type GameCard as GameCardType } from "@/types/game";
import {
  Sparkles,
  Zap,
  Star,
  Circle,
  Coins,
  Trophy,
  RefreshCw,
  Sword,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import cardTypes from "@/data/cardTypes.json";

interface GameCardProps {
  card: GameCardType;
  onClick?: () => void;
  isActive?: boolean;
}

const typeIcons: Record<string, any> = {
  COMMON: Circle,
  NORMAL: Circle,
  RARE: Star,
  HOLO: Sparkles,
  FULL_ART: Zap,
  SILVER: Coins,
  GOLD: Trophy,
  REVERT: RefreshCw,
  SWORD: Sword,
};

const rarityConfig: Record<string, any> = {
  COMMON: { border: "border-border", bg: "bg-card" },
  NORMAL: { border: "border-border", bg: "bg-card" },
  RARE: { border: "border-blue-400/60 animate-rare-pulse", bg: "bg-card" },
  HOLO: { border: "border-rarity-holo", bg: "bg-card" },
  FULL_ART: { border: "border-rarity-fullart", bg: "bg-card" },
  SILVER: { border: "border-slate-300", bg: "bg-slate-900/40" },
  GOLD: { border: "border-yellow-500", bg: "bg-yellow-900/20" },
  REVERT: { border: "border-red-500", bg: "bg-black" },
};

export function GameCard({ card, onClick, isActive }: GameCardProps) {
  const types = card.types || [];
  const isHolo = types.includes("HOLO");
  const isFullArt = types.includes("FULL_ART");
  const isRare = types.includes("RARE");
  const isSilver = types.includes("SILVER");
  const isGold = types.includes("GOLD");
  const isRevert = types.includes("REVERT");

  const primaryType = types.includes("REVERT")
    ? "REVERT"
    : types.includes("GOLD")
      ? "GOLD"
      : types.includes("SILVER")
        ? "SILVER"
        : types.includes("FULL_ART")
          ? "FULL_ART"
          : types.includes("HOLO")
            ? "HOLO"
            : types.includes("RARE")
              ? "RARE"
              : types.includes("NORMAL")
                ? "NORMAL"
                : "COMMON";

  const config = rarityConfig[primaryType] || rarityConfig.COMMON;

  let imgSrc = "https://rickandmortyapi.com/api/character/avatar/19.jpeg";

  if (card.customImage) {
    imgSrc = card.customImage;
  } else if (card.avatarId) {
    imgSrc = `https://rickandmortyapi.com/api/character/avatar/${card.avatarId}.jpeg`;
  }

  const imageFilter = isRevert
    ? "invert(1) hue-rotate(180deg)"
    : isGold
      ? "sepia(1) saturate(5) brightness(0.8) hue-rotate(-15deg)"
      : isSilver
        ? "grayscale(1) brightness(1.2) contrast(1.1)"
        : "";

  return (
    <button
      onClick={onClick}
      className={`relative w-48 rounded-xl border-2 ${config.border} ${config.bg} overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer group ${isActive ? "shadow-[0_0_15px_rgba(var(--primary),0.3)] border-primary/60" : ""}`}
    >
      {isActive && (
        <div className="absolute top-2 left-2 z-30 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary))]" />
        </div>
      )}

      {isHolo && (
        <div className="absolute inset-0 animate-holo opacity-30 mix-blend-overlay z-10 pointer-events-none rounded-xl" />
      )}
      {isGold && (
        <div className="absolute inset-0 bg-yellow-500/10 mix-blend-color-dodge z-10 pointer-events-none" />
      )}

      <div className="relative h-44 overflow-hidden">
        {isFullArt ? (
          <img
            src={imgSrc}
            alt={card.characterName}
            className="w-full h-full object-cover transition-all duration-500"
            style={{ filter: imageFilter }}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted/50">
            <img
              src={imgSrc}
              alt={card.characterName}
              className="w-24 h-24 rounded-full object-cover border-2 border-border group-hover:scale-110 transition-all duration-500"
              style={{ filter: imageFilter }}
            />
          </div>
        )}

        <div className="absolute top-2 right-2 z-20">
          <span
            className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
              card.status === "Alive"
                ? "bg-green-500/20 text-green-400 border border-green-500/40"
                : card.status === "Dead"
                  ? "bg-red-500/20 text-red-400 border border-red-500/40"
                  : "bg-gray-500/20 text-gray-400 border border-gray-500/40"
            }`}
          >
            {card.status}
          </span>
        </div>
      </div>

      <div
        className={`p-3 space-y-1 ${isFullArt ? "bg-background/80 backdrop-blur-sm" : ""}`}
      >
        <p className="font-display text-[10px] font-bold text-foreground truncate leading-tight">
          {card.characterName}
        </p>
        <p className="text-[8px] text-muted-foreground uppercase tracking-widest">
          <span>{card.origin}</span>
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center -space-x-1">
            {types.map((tId) => {
              const Icon = typeIcons[tId];
              if (!Icon) return null;
              return (
                <Icon key={tId} className="w-3 h-3 text-muted-foreground" />
              );
            })}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-primary">
              +{formatNumber(card.income)}/s
            </span>
            <div className="flex items-center gap-1">
              <Sword className="w-2.5 h-2.5 text-red-500 fill-red-500/20" />
              <span className="text-[10px] font-bold text-red-500">
                {formatNumber(card.power)}
              </span>
            </div>
          </div>
        </div>
        <div className="pt-1 border-t border-border/50 flex items-center justify-between opacity-60">
          <span className="text-[8px] font-body uppercase">{card.species}</span>
        </div>
      </div>
    </button>
  );
}
