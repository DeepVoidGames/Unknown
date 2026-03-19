import { type GameCard as GameCardType } from "@/types/game";
import { resolveCardStats } from "@/store/gameStore";
import { RARITY_STYLES, getPrimaryType } from "@/config/rarityConfig";
import { CardImage } from "./card-parts/CardImage";
import { CardStatusBadge } from "./card-parts/CardStatusBadge";
import { CardStats } from "./card-parts/CardStats";
import { CardTypes } from "./card-parts/CardTypes";
import { CardRarityOverlay } from "./card-parts/CardRarityOverlay";

interface GameCardProps {
  card: GameCardType;
  onClick?: () => void;
  isActive?: boolean;
}

export function GameCard({ card, onClick, isActive }: GameCardProps) {
  const stats = resolveCardStats(card);
  const { character, income, power } = stats;

  const types = card.types || [];
  const isFullArt = types.includes("FULL_ART");
  const primaryType = getPrimaryType(types);
  const config = RARITY_STYLES[primaryType] || RARITY_STYLES.COMMON;

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

      <CardRarityOverlay types={types} />

      <div className="relative h-44 overflow-hidden">
        <CardImage character={character} types={types} isFullArt={isFullArt} />

        <div className="absolute top-2 right-2 z-20">
          <CardStatusBadge status={character.status} />
        </div>
      </div>

      <div
        className={`p-3 space-y-1 ${isFullArt ? "bg-background/80 backdrop-blur-sm" : ""}`}
      >
        <p className="font-display text-[10px] font-bold text-foreground truncate leading-tight">
          {character.name}
        </p>
        <p className="text-[8px] text-muted-foreground uppercase tracking-widest">
          <span>{character.origin}</span>
        </p>
        <div className="flex items-center justify-between">
          <CardTypes types={types} />
          <CardStats income={income} power={power} iq={character.iq} />
        </div>
        <div className="pt-1 border-t border-border/50 flex items-center justify-between opacity-60">
          <span className="text-[8px] font-body uppercase">
            {character.species}
          </span>
        </div>
      </div>
    </button>
  );
}
