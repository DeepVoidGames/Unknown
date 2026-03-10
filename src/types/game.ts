export interface CardType {
  id: string;
  label: string;
  multiplier: number;
  color: string;
  canCombine: boolean;
}

export interface GameCard {
  id: string;
  name: string;
  characterName: string;
  types: string[]; // e.g. ["HOLO", "FULL_ART"]
  income: number;
  power: number;
  avatarId?: number;
  customImage?: string;
  origin: string;
  location: string;
  status: string;
  species: string;
  timestamp: number;
}

export interface GameState {
  seeds: number;
  inventory: GameCard[];
  maxInventory: number;
  activeSlots: (GameCard | null)[];
  dimensionLevel: number;
  maxDimensionLevel: number;
  isDimensionActive: boolean;
  currentEnemy: GameCard | null;
  upgrades: {
    seeds: number;
    power: number;
  };
  lastSaved: number;
}
