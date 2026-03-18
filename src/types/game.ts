export interface CardType {
  id: string;
  label: string;
  multiplier: number;
  canCombine: boolean;
  combinesWith?: string[];
}

export interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: string;
  location: string;
  avatarId: number;
  iq: number;
  basePower: number;
  customImage?: string;
}

export interface GameCard {
  id: string;
  characterId: number;
  types: string[]; // e.g. ["HOLO", "FULL_ART"]
  timestamp: number;
  income?: number; // Optional: used for enemies or special overrides
  power?: number;  // Optional: used for enemies or special overrides
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
    inventory: number;
  };
  discoveredCards: Record<number, string[]>; // characterId -> array of rarity typeIds
  lastSaved: number;
}
