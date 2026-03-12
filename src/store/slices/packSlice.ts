import { StateCreator } from "zustand";
import { GameStore } from "../gameStore";
import { GameCard } from "@/types/game";
import packs from "@/data/packs.json";
import { GAME_CONFIG } from "@/config/gameConfig";
import { generateCard } from "../cardUtils";
import { trackPackOpening } from "@/lib/analytics";

export interface PackSlice {
  isPackUnlocked: (packId: string) => boolean;
  buyPack: (packId: string) => GameCard[] | null;
  generateRandomCard: (
    weights?: Record<string, number>,
    combineChance?: number,
  ) => GameCard;
}

export const createPackSlice: StateCreator<GameStore, [], [], PackSlice> = (
  set,
  get,
) => ({
  isPackUnlocked: (packId) => {
    const { maxDimensionLevel } = get();
    const reqLevel = GAME_CONFIG.DIMENSIONS.PACK_UNLOCKS[packId];
    if (reqLevel === undefined) return false;
    return maxDimensionLevel >= reqLevel;
  },

  buyPack: (packId) => {
    const { seeds, inventory, maxInventory, isPackUnlocked } = get();
    const pack = packs.find((p) => p.id === packId);

    if (!pack || seeds < pack.cost) return null;
    if (inventory.length >= maxInventory) return null;
    if (!isPackUnlocked(packId)) return null;

    const newCards: GameCard[] = [];
    for (let i = 0; i < pack.cardCount; i++) {
      newCards.push(generateCard(pack.weights, pack.combineChance));
    }

    set((state) => ({
      seeds: state.seeds - pack.cost,
    }));

    trackPackOpening(pack.name, pack.cost);

    return newCards;
  },

  generateRandomCard: (weights, combineChance) => {
    return generateCard(weights, combineChance);
  },
});
