import { type GameCard as GameCardType } from '@/store/gameStore';
import { Sparkles, Zap, Star, Circle } from 'lucide-react';

interface GameCardProps {
  card: GameCardType;
  onClick?: () => void;
  isActive?: boolean;
}

const rarityConfig = {
  COMMON: {
    border: 'border-rarity-common',
    bg: 'bg-card',
    icon: Circle,
    label: 'Common',
  },
  RARE: {
    border: 'border-rarity-rare animate-rare-pulse',
    bg: 'bg-card',
    icon: Star,
    label: 'Rare',
  },
  FULL_ART: {
    border: 'border-rarity-fullart',
    bg: 'bg-card',
    icon: Zap,
    label: 'Full Art',
  },
  HOLO: {
    border: 'border-rarity-holo',
    bg: 'bg-card',
    icon: Sparkles,
    label: 'Holo',
  },
};

const characterImages: Record<string, string> = {
  'rick-holo': 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
  'morty-fullart': 'https://rickandmortyapi.com/api/character/avatar/2.jpeg',
  'summer-rare': 'https://rickandmortyapi.com/api/character/avatar/3.jpeg',
  'jerry-common': 'https://rickandmortyapi.com/api/character/avatar/5.jpeg',
};

export function GameCard({ card, onClick, isActive }: GameCardProps) {
  const config = rarityConfig[card.rarity];
  const Icon = config.icon;
  const imgSrc = characterImages[card.id] || '';

  return (
    <button
      onClick={onClick}
      className={`relative w-40 rounded-xl border-2 ${config.border} ${config.bg} overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer group ${isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
    >
      {/* Holo overlay */}
      {card.rarity === 'HOLO' && (
        <div className="absolute inset-0 animate-holo opacity-30 mix-blend-overlay z-10 pointer-events-none rounded-xl" />
      )}

      {/* Image area */}
      <div className="relative h-44 overflow-hidden">
        {card.rarity === 'FULL_ART' ? (
          <img
            src={imgSrc}
            alt={card.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted/50">
            <img
              src={imgSrc}
              alt={card.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-border group-hover:scale-110 transition-transform"
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className={`p-3 space-y-1 ${card.rarity === 'FULL_ART' ? 'bg-background/80 backdrop-blur-sm' : ''}`}>
        <p className="font-display text-xs font-bold text-foreground truncate">
          {card.name}
        </p>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Icon className="w-3 h-3" />
            {config.label}
          </span>
          <span className="text-xs font-bold text-primary">
            +{card.income}/s
          </span>
        </div>
      </div>
    </button>
  );
}
